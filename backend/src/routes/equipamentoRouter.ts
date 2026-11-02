import { Router } from "express";

import { getString } from "../utils.js";
import { pool } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const direcao = getString(req.query.direcao) ?? "ASC";
        const ordenarPor = getString(req.query.ordenarPor) ?? "nome";
        const q = getString(req.query.q);
        const tipo = getString(req.query.tipo);


        const sortColumns : Record<string, string> = {
            nome: "e.nome",
            origem: "e.origem",
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
                FROM equipamento e
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
                    e.origem,
                    e.tipo,
                    e.url_imagem
                FROM equipamento e
                ${where}
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

router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            nome,
            tipo,
            origem,
            descricao,
            url_imagem,

            usuarios,
            habilidades
        } = req.body;

        if (typeof nome !== "string" || !nome.trim()) 
            return res.status(400).json({
                message: "Missing required fields."
            });

        if (
            !Array.isArray(usuarios)
            || !Array.isArray(habilidades)
        )
            return res.status(400).json({
                    message: "Invalid relationship data."
                });

        await client.query("BEGIN");

        const equipamentoRes = await client.query(
            `
                INSERT INTO equipamento (
                    nome,
                    tipo,
                    origem,
                    descricao,
                    url_imagem
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
                RETURNING id
            `,
            [
                nome.trim(),
                tipo.trim(),
                origem.trim(),
                descricao.trim(),
                url_imagem || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
            ]
        );

        const idEquipamento = equipamentoRes.rows[0].id;

        for (const u of usuarios) {
            await client.query(
                `
                    INSERT INTO individuo_equipamento (
                        id_individuo,
                        id_equipamento
                    )
                    VALUES ($1, $2)
                `,
                [
                    u.id,
                    idEquipamento
                ]
            );
        }

        for (const h of habilidades) {
            await client.query(
                `
                    INSERT INTO dependencia_equipamento (
                        id_habilidade,
                        id_equipamento
                    )
                    VALUES (
                        $1,
                        $2
                    )
                `,
                [
                    h.id,
                    idEquipamento
                ]
            );
        }

        await client.query("COMMIT");

        return res.status(201).json({
            id: idEquipamento,
            message: "Equipment created."
        });
    }

    catch (error) {
        console.error(error);
        await client.query("ROLLBACK");

        return res.status(500).json({
            message: "Unable to create."
        });
    }

    finally {
        client.release();
    }
});

router.get("/filtros", async (_req, res) => {
    try {
        const tipos = await pool.query(
            `
                SELECT DISTINCT tipo
                FROM equipamento
                WHERE tipo IS NOT NULL
                ORDER BY tipo ASC
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

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const equipamento = await pool.query(
            `
                SELECT
                    e.id,
                    e.nome,
                    e.tipo,
                    e.origem,
                    e.descricao,
                    e.url_imagem
                FROM equipamento e
                WHERE e.id = $1
            `,
            [id]
        );

        if (equipamento.rows.length === 0) {
            return res.status(404).json({
                error: "Not found."
            });
        }

        const dependentes = await pool.query(
            `
                SELECT
                    de.id_habilidade AS id,
                    h.nome,
                    h.descricao
                FROM dependencia_equipamento de
                JOIN habilidade h ON h.id = de.id_habilidade
                WHERE de.id_equipamento = $1
            `,
            [id]
        );

        const donos = await pool.query(
            `
                SELECT
                    ie.id_individuo AS id,
                    i.nome,
                    i.realidade,
                    i.alinhamento,
                    i.status,
                    i.url_imagem,
                    c.codinome
                FROM individuo_equipamento ie
                JOIN individuo i ON i.id = ie.id_individuo
                LEFT JOIN LATERAL (
                    SELECT codinome
                    FROM codinome
                    WHERE id_individuo = ie.id_individuo
                        AND data_fim IS NULL
                    ORDER BY data_inicio DESC NULLS LAST, id DESC
                    LIMIT 1
                ) c ON true
                WHERE ie.id_equipamento = $1
            `,
            [id]
        );

        res.json({
            equipamento: equipamento.rows[0],
            dependentes: dependentes.rows,
            donos: donos.rows
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