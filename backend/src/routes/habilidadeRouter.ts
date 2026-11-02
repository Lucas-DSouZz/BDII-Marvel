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

router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            nome,
            origem,
            descricao,

            equipamentos,
            dependentes,
            requisitos,
            usuarios
        } = req.body;

        if (
            typeof nome !== "string" || !nome.trim()
            || typeof origem !== "string" || !origem.trim()
        ) 
            return res.status(400).json({
                message: "Missing required fields."
            });

        if (
            !Array.isArray(equipamentos)
            || !Array.isArray(dependentes)
            || !Array.isArray(requisitos)
            || !Array.isArray(usuarios)
        )
            return res.status(400).json({
                    message: "Invalid relationship data."
                });

        await client.query("BEGIN");

        const habRes = await client.query(
            `
                INSERT INTO habilidade (
                    nome,
                    origem,
                    descricao
                )
                VALUES (
                    $1,
                    $2,
                    $3
                )
                RETURNING id
            `,
            [
                nome.trim(),
                origem.trim(),
                descricao.trim(),
            ]
        );

        const idHab = habRes.rows[0].id;

        for (const e of equipamentos) {
            await client.query(
                `
                    INSERT INTO dependencia_equipamento (
                        id_habilidade,
                        id_equipamento
                    )
                    VALUES ($1, $2)
                `,
                [
                    idHab,
                    e.id
                ]
            );
        }

        for (const d of dependentes) {
            await client.query(
                `
                    INSERT INTO dependencia_habilidade (
                        id_hab_dependente,
                        id_hab_requisito
                    )
                    VALUES ($1, $2)
                `,
                [
                    d.id,
                    idHab
                ]
            );
        }

        for (const r of requisitos) {
            await client.query(
                `
                    INSERT INTO dependencia_habilidade (
                        id_hab_dependente,
                        id_hab_requisito
                    )
                    VALUES ($1, $2)
                `,
                [
                    idHab,
                    r.id
                ]
            );
        }

        for (const u of usuarios) {
            await client.query(
                `
                    INSERT INTO individuo_habilidade (
                        id_individuo,
                        id_habilidade
                    )
                    VALUES ($1, $2)
                `,
                [
                    u.id,
                    idHab
                ]
            );
        }

        await client.query("COMMIT");

        return res.status(201).json({
            id: idHab,
            message: "Team created."
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

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const habilidade = await pool.query(
            `
                SELECT
                    h.id,
                    h.nome,
                    h.origem,
                    h.descricao
                FROM habilidade h
                WHERE h.id = $1
            `,
            [id]
        );

        if (habilidade.rows.length === 0) {
            return res.status(404).json({
                error: "Not found"
            });
        }

        const equips = await pool.query(
            `
                SELECT
                    de.id_equipamento AS id,
                    e.nome,
                    e.tipo,
                    e.url_imagem
                FROM dependencia_equipamento de
                JOIN equipamento e ON e.id = de.id_equipamento
                WHERE de.id_habilidade = $1
                ORDER BY e.nome 
            `,
            [id]
        );

        const habs_dependentes = await pool.query(
            `
                SELECT
                    dh.id_hab_dependente AS id,
                    h.nome,
                    h.origem
                FROM dependencia_habilidade dh
                JOIN habilidade h ON h.id = dh.id_hab_dependente
                WHERE dh.id_hab_requisito = $1
                ORDER BY h.nome
            `,
            [id]
        );

        const habs_requisitos = await pool.query(
            `
                SELECT
                    dh.id_hab_requisito AS id,
                    h.nome,
                    h.origem
                FROM dependencia_habilidade dh
                JOIN habilidade h ON h.id = dh.id_hab_requisito
                WHERE dh.id_hab_dependente = $1
                ORDER BY h.nome
            `,
            [id]
        );

        const usuarios = await pool.query(
            `
                SELECT
                    ih.id_individuo AS id,
                    i.nome,
                    i.realidade,
                    i.nivel_ameaca,
                    i.url_imagem,
                    c.codinome
                FROM individuo_habilidade ih
                JOIN individuo i ON i.id = ih.id_individuo
                LEFT JOIN LATERAL (
                    SELECT codinome
                    FROM codinome
                    WHERE id_individuo = ih.id_individuo
                        AND data_fim IS NULL
                    ORDER BY data_inicio DESC NULLS LAST, id DESC
                    LIMIT 1
                ) c ON true
                WHERE ih.id_habilidade = $1
                ORDER BY i.nome
            `,
            [id]
        );

        res.json({
            habilidade: habilidade.rows[0],
            equips: equips.rows,
            habs_dependentes: habs_dependentes.rows,
            habs_requisitos: habs_requisitos.rows,
            usuarios: usuarios.rows
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