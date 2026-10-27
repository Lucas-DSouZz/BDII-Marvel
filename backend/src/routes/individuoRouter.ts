import { Router } from "express";

import { getString, isValidDate } from "../utils.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const alinhamento = getString(req.query.alinhamento);
        const direcao = getString(req.query.direcao) ?? "ASC";
        const nascimentoDe = getString(req.query.nascimentoDe);
        const nascimentoAte = getString(req.query.nascimentoAte);
        const nivelAmeaca = getString(req.query.nivelAmeaca);
        const ordenarPor = getString(req.query.ordenarPor) ?? "nome";
        const q = getString(req.query.q);
        const realidade = getString(req.query.realidade);
        const status = getString(req.query.status);


        const sortColumns : Record<string, string> = {
            alinhamento: "i.alinhamento",
            codinome: "c.codinome",
            nascimento: "i.data_nascimento",
            nivel_ameaca: "i.nivel_ameaca",
            nome: "i.nome",
            realidade: "i.realidade",
            status: "i.status"
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


        const booleanFilters = [
            ["humano", "i.humano"],
            ["mutante", "i.mutante"],
            ["alienigena", "i.alienigena"],
            ["sintetico", "i.sintetico"]
        ] as const;

        const selectedBioFilters = booleanFilters.filter(
            ([key]) => req.query[key] === "true"
        );


        if (
            (nascimentoDe && !isValidDate(nascimentoDe))
            || (nascimentoAte && !isValidDate(nascimentoAte))
        ) {
            res.status(400).json({
                message: "Invalid birth date parameter."
            });
        }

        if (
            nascimentoDe && nascimentoAte
            && nascimentoDe > nascimentoAte
        ) {
            res.status(400).json({
                message: "Invalid foundation date parameters."
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
                (p) => `
                    (
                        i.nome ILIKE ${p}
                        OR EXISTS (
                            SELECT 1
                            FROM codinome c
                            WHERE c.id_individuo = i.id
                                AND c.codinome ILIKE ${p}
                        )
                    )
                `,
                `%${q}%`
            );

        if (alinhamento)
            addCondition(
                (p) => `i.alinhamento::text = ${p}`,
                alinhamento
            );

        if (nascimentoDe)
            addCondition(
                (p) => `e.data_nascimento >= ${p}::date`,
                nascimentoDe
            );

        if (nascimentoAte)
            addCondition(
                (p) => `e.data_nascimento <= ${p}::date`,
                nascimentoAte
            );

        if (nivelAmeaca)
            addCondition(
                (p) => `i.nivel_ameaca::text = ${p}`,
                nivelAmeaca
            );
        
        if (realidade)
            addCondition(
                (p) => `i.realidade = ${p}`,
                realidade
            );

        if (status)
            addCondition(
                (p) => `i.status::text = ${p}`,
                status
            );

        let bioOrder = "";

        if (selectedBioFilters.length > 0) {
            const bioConditions = selectedBioFilters.map(
                ([, column]) => `${column} = TRUE`
            );

            conditions.push(
                `(${bioConditions.join(" OR ")})`
            );

            bioOrder = `
                CASE
                    WHEN ${bioConditions.join(" AND ")}
                    THEN 0
                    ELSE 1
                END,
            `;
        }
        
        const where = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : ""
        ;

        const filterValues = [...values];


        const count = await pool.query(
            `
                SELECT COUNT(*) AS total
                FROM individuo i
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
                    i.id,
                    i.alinhamento::text AS alinhamento,
                    i.nivel_ameaca::text AS nivel_ameaca,
                    i.nome,
                    i.realidade,
                    i.status::text AS status,
                    i.url_imagem,
                    c.codinome
                FROM individuo i
                LEFT JOIN LATERAL (
                    SELECT codinome
                    FROM codinome
                    WHERE id_individuo = i.id
                    ORDER BY data_inicio DESC NULLS LAST, id DESC
                    LIMIT 1
                ) c ON true
                ${where}
                ORDER BY ${bioOrder} ${sortColumn} ${direcao} NULLS LAST, i.id ASC
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
        const [alinhamentos, niveisAmeaca, realidades, status] = await Promise.all([
            pool.query(`
                SELECT unnest(enum_range(NULL::tipo_alinhamento))::text AS alinhamento

            `),
            pool.query(`
                SELECT unnest(enum_range(NULL::tipo_nivel_ameaca))::text AS nivel
            `),
            pool.query(`
                SELECT DISTINCT realidade
                FROM individuo
                WHERE realidade IS NOT NULL
                ORDER BY realidade ASC
            `),
            pool.query(`
                SELECT unnest(enum_range(NULL::tipo_status))::text AS status
            `)
        ]);

        res.json({
            alinhamentos: alinhamentos.rows.map((row) => row.alinhamento),
            niveis: niveisAmeaca.rows.map((row) => row.nivel),
            realidades: realidades.rows.map((row) => row.realidade),
            status: status.rows.map((row) => row.status)
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