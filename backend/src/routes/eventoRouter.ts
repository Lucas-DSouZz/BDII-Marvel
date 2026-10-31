import { Router } from "express";

import { getString, isValidDate } from "../utils.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const direcao = getString(req.query.direcao) ?? "ASC";
        const fimDe = getString(req.query.fimDe);
        const fimAte = getString(req.query.fimAte);
        const inicioDe = getString(req.query.inicioDe);
        const inicioAte = getString(req.query.inicioAte);
        const nivelAmeaca = getString(req.query.nivelAmeaca);
        const ordenarPor = getString(req.query.ordenarPor) ?? "nome";
        const q = getString(req.query.q);


        const sortColumns : Record<string, string> = {
            fim: "e.data_fim",
            inicio: "e.data_inicio",
            nivel_ameaca: "e.nivel_ameaca",
            nome: "e.nome",
            qnt_individuo: "qnt_individuo"
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


        if (
            (inicioDe && !isValidDate(inicioDe))
            || (inicioAte && !isValidDate(inicioAte))
        ) {
            res.status(400).json({
                message: "Invalid starting date parameter."
            });
        }

        if (
            inicioDe && inicioAte
            && inicioDe > inicioAte
        ) {
            res.status(400).json({
                message: "Invalid starting date parameters."
            });
        }

        if (
            (fimDe && !isValidDate(fimDe))
            || (fimAte && !isValidDate(fimAte))
        ) {
            res.status(400).json({
                message: "Invalid ending date parameter."
            });
        }

        if (
            fimDe && fimAte
            && fimDe > fimAte
        ) {
            res.status(400).json({
                message: "Invalid ending date parameters."
            });
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
                (p) => `e.nome ILIKE ${p}`,
                `%${q}%`
            );

        if (fimDe)
            addCondition(
                (p) => `e.data_fim >= ${p}::date`,
                fimDe
            );

        if (fimAte)
            addCondition(
                (p) => `e.data_fim <= ${p}::date`,
                fimAte
            );

        if (inicioDe)
            addCondition(
                (p) => `e.data_inicio >= ${p}::date`,
                inicioDe
            );

        if (inicioAte)
            addCondition(
                (p) => `e.data_inicio <= ${p}::date`,
                inicioAte
            );
        
        if (nivelAmeaca)
            addCondition(
                (p) => `e.nivel_ameaca = ${p}`,
                nivelAmeaca
            );
        
        const where = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : ""
        ;

        const filterValues = [...values];


        const count = await pool.query(
            `
                SELECT COUNT(*) AS total
                FROM evento e
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
                    e.id,
                    e.nivel_ameaca::text AS nivel_ameaca,
                    e.nome,
                    COUNT(ie.id_individuo) as qnt_individuo
                FROM evento e
                LEFT JOIN individuo_evento ie ON ie.id_evento = e.id
                ${where}
                GROUP BY e.id, e.nivel_ameaca, e.nome
                ORDER BY ${sortColumn} ${direcao} NULLS LAST, e.id ASC
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
        const niveis = await pool.query(
            `
                SELECT unnest(enum_range(NULL::tipo_nivel_ameaca))::text AS nivel
            `
        );

        res.json({
            niveis: niveis.rows.map((row) => row.nivel)
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

        const evento = await pool.query(
            `
                SELECT
                    e.id,
                    e.nome,
                    e.nivel_ameaca,
                    e.descricao,
                    e.data_inicio,
                    e.data_fim
                FROM evento e
                WHERE e.id = $1
            `,
            [id]
        );

        if (evento.rows.length === 0) {
            return res.status(404).json({
                error: "Not found"
            });
        }

        const regioes = await pool.query(
            `
                SELECT
                    er.id_regiao AS id,
                    r.nome,
                    r.realidade,
                    r.tipo,
                    r.url_imagem
                FROM evento_regiao er
                JOIN regiao r ON r.id = er.id_regiao
                WHERE er.id_evento = $1
                ORDER BY r.nome 
            `,
            [id]
        );

        const participantes = await pool.query(
            `
                SELECT
                    ie.id_individuo AS id,
                    ie.papel,
                    ie.resultado_individual,
                    i.nome,
                    i.realidade,
                    i.alinhamento,
                    i.url_imagem,
                    c.codinome
                FROM individuo_evento ie
                JOIN individuo i ON i.id = ie.id_individuo
                LEFT JOIN LATERAL (
                    SELECT codinome
                    FROM codinome
                    WHERE id_individuo = ie.id_individuo
                        AND data_fim IS NULL
                    ORDER BY data_inicio DESC NULLS LAST, id DESC
                    LIMIT 1
                ) c ON true
                WHERE ie.id_evento = $1
                ORDER BY i.nome
            `,
            [id]
        );

        const guerra = await pool.query(
            `
                SELECT
                    g.nome,
                    dg.motivo,
                    c1.id AS id_coligacao1,
                    c1.nome AS nome_coligacao1,
                    c2.id AS id_coligacao2,
                    c2.nome AS nome_coligacao2
                FROM guerra g
                JOIN declara_guerra dg ON dg.id = g.id_declaracao
                JOIN coligacao c1 ON c1.id = dg.id_coligacao1
                JOIN coligacao c2 ON c2.id = dg.id_coligacao2
                WHERE g.id_evento_correspondente = $1
            `,
            [id]
        );

        res.json({
            evento: evento.rows[0],
            regioes: regioes.rows,
            participantes: participantes.rows,
            guerra: guerra.rows
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