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

export default router;