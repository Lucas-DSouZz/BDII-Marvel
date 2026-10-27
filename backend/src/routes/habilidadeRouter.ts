import { Router } from "express";

import { getString } from "../utils.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const direcao = getString(req.query.direcao) ?? "ASC";
        const ordenarPor = getString(req.query.ordenarPor) ?? "nome";
        const q = getString(req.query.q);


        const sortColumns : Record<string, string> = {
            nome: "h.nome",
            origem: "h.origem",
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
                (p) => `h.nome ILIKE ${p}`,
                `%${q}%`
            );
        
        const where = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : ""
        ;

        const filterValues = [...values];


        const count = await pool.query(
            `
                SELECT COUNT(*) AS total
                FROM habilidade h
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
                    h.id,
                    h.nome,
                    h.origem,
                    COUNT(ih.id_individuo) as qnt_individuo
                FROM habilidade h
                LEFT JOIN individuo_habilidade ih ON ih.id_habilidade = h.id
                ${where}
                GROUP BY h.id, h.nome, h.origem
                ORDER BY ${sortColumn} ${direcao} NULLS LAST, h.id ASC
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

export default router;