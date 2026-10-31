import { Router } from "express";

import { getString } from "../utils.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const direcao = getString(req.query.direcao) ?? "ASC";
        const ordenarPor = getString(req.query.ordenarPor) ?? "nome";
        const realidade = getString(req.query.realidade);
        const tipo = getString(req.query.tipo);
        const q = getString(req.query.q);


        const sortColumns : Record<string, string> = {
            nome: "r.nome",
            qnt_individuo: "qnt_individuo",
            qnt_evento: "qnt_evento",
            realidade: "r.realidade",
            tipo: "r.tipo"
        };

        if (
            !Object.hasOwn(sortColumns, ordenarPor)
            || !["ASC", "DESC"].includes(direcao)
        ) {
            res.status(400).json({
                message: "Invalid sorting parameters."
            });

            return;
        }

        const sortColumn = sortColumns[ordenarPor];


        const rawLimit = getString(req.query.limit);
        const rawOffset = getString(req.query.offset);

        const limit = rawLimit === undefined
            ? 20
            : Number(rawLimit);
        
        const offset = rawOffset === undefined
            ? 0
            : Number(rawOffset);

        if (
            !Number.isInteger(limit)
            || !Number.isInteger(offset)
            || limit < 1
            || limit > 100
            || offset < 0
        ) {
            res.status(400).json({
                message: "Invalid pagination parameters."
            });

            return;
        }


        const values : unknown[] = [];
        const conditions : string[] = [];

        function addCondition(
            sql : (placeholder : string) => string,
            value : unknown
        ) {
            values.push(value);
            conditions.push(sql(`$${values.length}`));
        }

        if (q)
            addCondition(
                (p) => `r.nome ILIKE ${p}`,
                `%${q}%`
            );

        if (realidade)
            addCondition(
                (p) => `r.realidade = ${p}`,
                realidade
            );

        if (tipo)
            addCondition(
                (p) => `r.tipo = ${p}`,
                tipo
            );
        
        const where = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : ""
        ;

        const filterValues = [...values];


        const count = await pool.query(
            `
                SELECT COUNT(*) AS total
                FROM regiao r
                ${where}
            `,
            filterValues
        );


        values.push(limit + 1);
        const limitPlaceholder = `$${values.length}`;

        values.push(offset);
        const offsetPlaceholder = `$${values.length}`;


        const result = await pool.query(
            `
                SELECT
                    r.id,
                    r.nome,
                    r.realidade,
                    r.tipo,
                    r.url_imagem,
                    (
                        SELECT COUNT(*)
                        FROM individuo_regiao ir
                        WHERE ir.id_regiao = r.id
                    ) AS qnt_individuo,
                    (
                        SELECT COUNT(*)
                        FROM evento_regiao er
                        WHERE er.id_regiao = r.id
                    ) AS qnt_evento
                FROM regiao r
                ${where}
                ORDER BY ${sortColumn} ${direcao} NULLS LAST, r.id ASC
                LIMIT ${limitPlaceholder}
                OFFSET ${offsetPlaceholder}
            `,
            values
        );

        const hasMore = result.rows.length > limit;
        const items = result.rows.slice(0, limit);


        res.json({
            items,
            total : Number(count.rows[0].total),
            limit,
            offset,
            hasMore
        });
    }

    catch (error) {
        console.error("Error: ", error);
        
        res.status(500).json({
            message: "Unable to query."
        });
    }
});

router.get("/filtros", async (_req, res) => {
    try {
        const [realidades, tipos] = await Promise.all([
            pool.query(
                `
                    SELECT DISTINCT realidade
                    FROM regiao
                    WHERE realidade IS NOT NULL
                    ORDER BY realidade ASC
                `
            ),
            pool.query(
                `
                    SELECT DISTINCT tipo
                    FROM regiao
                    WHERE tipo IS NOT NULL
                    ORDER BY tipo ASC
                `
            ),
        ]);

        res.json({
            realidades: realidades.rows.map((row) => row.realidade),
            tipos: tipos.rows.map((row) => row.tipo)
        });
    }

    catch (error) {
        console.error("Error: ", error);

        res.status(500).json({
            message: "Unable to query."
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const regiao = await pool.query(
            `
                SELECT
                    r.id,
                    r.nome,
                    r.realidade,
                    r.tipo,
                    r.url_imagem
                FROM regiao r
                WHERE r.id = $1
            `,
            [id]
        );

        if (regiao.rows.length === 0) {
            return res.status(404).json({
                error: "Not found"
            });
        }

        const individuos = await pool.query(
            `
                SELECT
                    ir.id_individuo AS id,
                    i.nome,
                    i.realidade,
                    i.nivel_ameaca,
                    i.alinhamento,
                    i.url_imagem,
                    c.codinome
                FROM individuo_regiao ir
                JOIN individuo i ON i.id = ir.id_individuo
                LEFT JOIN LATERAL (
                    SELECT codinome
                    FROM codinome
                    WHERE id_individuo = ir.id_individuo
                        AND data_fim IS NULL
                    ORDER BY data_inicio DESC NULLS LAST, id DESC
                    LIMIT 1
                ) c ON true
                WHERE ir.id_regiao = $1
                ORDER BY i.nome 
            `,
            [id]
        );

        const eventos = await pool.query(
            `
                SELECT
                    er.id_evento AS id,
                    e.nome,
                    e.nivel_ameaca,
                    e.data_inicio,
                    e.data_fim
                FROM evento_regiao er
                JOIN evento e ON e.id = er.id_evento
                WHERE er.id_regiao = $1
                ORDER BY e.nome
            `,
            [id]
        );

        res.json({
            regiao: regiao.rows[0],
            individuos: individuos.rows,
            eventos: eventos.rows
        });
    }

    catch (error) {
        console.error("Error: ", error);
        
        res.status(500).json({
            message: "Unable to query."
        });
    }
});

export default router;