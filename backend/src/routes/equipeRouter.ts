import { Router } from "express";

import { getString, isValidDate } from "../utils.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const direcao = getString(req.query.direcao) ?? "ASC";
        const fundacaoDe = getString(req.query.fundacaoDe);
        const fundacaoAte = getString(req.query.fundacaoAte);
        const ordenarPor = getString(req.query.ordenarPor) ?? "nome";
        const q = getString(req.query.q);
        const tipo = getString(req.query.tipo);


        const sortColumns : Record<string, string> = {
            fundacao: "e.data_fundacao",
            nome: "e.nome",
            qnt_individuo: "qnt_individuo",
            tipo: "e.tipo"
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
            (fundacaoDe && !isValidDate(fundacaoDe))
            || (fundacaoAte && !isValidDate(fundacaoAte))
        ) {
            res.status(400).json({
                message: "Invalid foundation date parameter."
            });
        }

        if (
            fundacaoDe && fundacaoAte
            && fundacaoDe > fundacaoAte
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
                (p) => `e.nome ILIKE ${p}`,
                `%${q}%`
            );

        if (fundacaoDe)
            addCondition(
                (p) => `e.data_fundacao >= ${p}::date`,
                fundacaoDe
            );

        if (fundacaoAte)
            addCondition(
                (p) => `e.data_fundacao <= ${p}::date`,
                fundacaoAte
            );
        
        if (tipo)
            addCondition(
                (p) => `e.tipo = ${p}`,
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
                FROM equipe e
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
                    e.nome,
                    e.tipo::text AS tipo,
                    COUNT(ie.id_individuo) as qnt_individuo
                FROM equipe e
                LEFT JOIN individuo_equipe ie ON ie.id_equipe = e.id
                ${where}
                GROUP BY e.id, e.nome, e.tipo
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
        const tipos = await pool.query(
            `
                SELECT unnest(enum_range(NULL::tipo_equipe))::text AS tipo
            `
        );

        res.json({
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

export default router;