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


        const sortColumns : Record<string, string> = {
            fundacao: "c.data_fundacao",
            nome: "c.nome",
            qnt_equipe: "qnt_equipe"
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
                (p) => `c.nome ILIKE ${p}`,
                `%${q}%`
            );
        
        if (fundacaoDe)
            addCondition(
                (p) => `c.data_fundacao >= ${p}::date`,
                fundacaoDe
            );

        if (fundacaoAte)
            addCondition(
                (p) => `c.data_fundacao <= ${p}::date`,
                fundacaoAte
            );
        
        const where = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : ""
        ;

        const filterValues = [...values];


        const count = await pool.query(
            `
                SELECT COUNT(*) AS total
                FROM coligacao c
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
                    c.id,
                    c.nome,
                    COUNT(ec.id_equipe) AS qnt_equipe
                FROM coligacao c
                LEFT JOIN equipe_coligacao ec ON ec.id_coligacao = c.id
                ${where}
                GROUP BY c.id, c.nome
                ORDER BY ${sortColumn} ${direcao} NULLS LAST, c.id ASC
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

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const coligacao = await pool.query(
            `
                SELECT
                    c.id,
                    c.nome,
                    c.ideologia,
                    c.data_fundacao
                FROM coligacao c
                WHERE c.id = $1
            `,
            [id]
        );

        if (coligacao.rows.length === 0) {
            return res.status(404).json({
                error: "Not found."
            });
        }

        const equipes = await pool.query(
            `
                SELECT
                    e.id,
                    e.nome,
                    e.tipo,
                    ec.data_afiliacao,
                    ec.nivel_influencia
                FROM equipe_coligacao ec
                JOIN equipe e ON e.id = ec.id_equipe
                WHERE ec.id_coligacao = $1
            `,
            [id]
        );

        const guerras = await pool.query(
            `
                SELECT
                    g.nome,
                    g.id_evento_correspondente,
                    dg.motivo,
                    c.nome AS coligacao_inimiga
                FROM declara_guerra dg
                JOIN guerra g ON dg.id = g.id_declaracao
                JOIN coligacao c ON c.id = CASE
                    WHEN $1 = dg.id_coligacao1
                        THEN dg.id_coligacao2
                    WHEN $1 = dg.id_coligacao2
                        THEN dg.id_coligacao1
                END
                WHERE dg.id_coligacao1 = $1
                    OR dg.id_coligacao2 = $1
            `,
            [id]
        );

        res.json({
            coligacao: coligacao.rows[0],
            equipes: equipes.rows,
            guerras: guerras.rows
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