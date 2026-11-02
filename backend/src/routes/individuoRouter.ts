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
                        AND data_fim IS NULL
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

router.post("/", async (req, res) => {
    const client = await pool.connect();

    try {
        const {
            nome,
            realidade,
            nivel_ameaca,
            alinhamento,
            status,
            data_nascimento,
            url_imagem,

            humano,
            documento,
            pais,

            mutante,
            fator_gatilho,
            descricao_mutacao,

            alienigena,
            especie,
            planeta_nativo,

            sintetico,
            fabricante,
            material,
            
            codinomes,
            habilidades,
            equipamentos,
            equipes,
            regioes,
            eventos,
            aliados,
            inimigos
        } = req.body;

        if (
            typeof nome !== "string" || !nome.trim()
            || typeof realidade !== "string" || !realidade.trim()
            || !nivel_ameaca 
            || !alinhamento
            || !status
        )
            return res.status(400).json({
                message: "Missing required fields."
            });

        if (
            !Array.isArray(codinomes)
            || !Array.isArray(habilidades)
            || !Array.isArray(equipamentos)
            || !Array.isArray(equipes)
            || !Array.isArray(regioes)
            || !Array.isArray(eventos)
            || !Array.isArray(aliados)
            || !Array.isArray(inimigos)
        )
            return res.status(400).json({
                message: "Invalid relationship data."
            });

        await client.query("BEGIN");

        const individuoRes = await client.query(
            `
                INSERT INTO individuo (
                    nome,
                    realidade,
                    nivel_ameaca,
                    alinhamento,
                    status,
                    data_nascimento,
                    humano,
                    mutante,
                    alienigena,
                    sintetico,
                    url_imagem
                )
                VALUES (
                    $1,
                    $2,
                    $3::tipo_nivel_ameaca,
                    $4::tipo_alinhamento,
                    $5::tipo_status,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11
                )
                RETURNING id
            `,
            [
                nome.trim(),
                realidade.trim(),
                nivel_ameaca,
                alinhamento,
                status,
                data_nascimento || null,
                Boolean(humano),
                Boolean(mutante),
                Boolean(alienigena),
                Boolean(sintetico),
                url_imagem || null
            ]
        );

        const idIndividuo = individuoRes.rows[0].id;

        if (humano) {
            await client.query(
                `
                    INSERT INTO humano (
                        id_individuo,
                        documento,
                        pais
                    )
                    VALUES ($1, $2, $3)
                `,
                [idIndividuo, documento || null, pais || null]
            );
        }

        if (mutante) {
            await client.query(
                `
                    INSERT INTO mutante (
                        id_individuo,
                        fator_gatilho,
                        descricao_mutacao
                    )
                    VALUES ($1, $2, $3)
                `,
                [idIndividuo, fator_gatilho || null, descricao_mutacao || null]
            );
        }

        if (alienigena) {
            await client.query(
                `
                    INSERT INTO alienigena (
                        id_individuo,
                        especie,
                        planeta_nativo
                    )
                    VALUES ($1, $2, $3)
                `,
                [idIndividuo, especie || null, planeta_nativo || null]
            );
        }

        if (sintetico) {
            await client.query(
                `
                    INSERT INTO sintetico (
                        id_individuo,
                        fabricante,
                        material
                    )
                    VALUES ($1, $2, $3)
                `,
                [idIndividuo, fabricante || null, material || null]
            );
        }

        for (const c of codinomes) {
            if (
                typeof c.codinome !== "string"
                || !c.codinome.trim()
            )
                throw new Error("Invalid codename.");

            await client.query(
                `
                    INSERT INTO codinome (
                        id_individuo,
                        codinome,
                        data_inicio,
                        data_fim
                    )
                    VALUES ($1, $2, $3, $4)
                `,
                [
                    idIndividuo,
                    c.codinome.trim(),
                    c.data_inicio || null,
                    c.data_fim || null
                ]
            );
        }

        for (const h of habilidades) {
            await client.query(
                `
                    INSERT INTO individuo_habilidade (
                        id_individuo,
                        id_habilidade
                    )
                    VALUES ($1, $2)
                `,
                [idIndividuo, h.id]
            );
        }

        for (const e of equipamentos) {
            await client.query(
                `
                    INSERT INTO individuo_equipamento (
                        id_individuo,
                        id_equipamento
                    )
                    VALUES ($1, $2)
                `,
                [idIndividuo, e.id]
            );
        }

        for (const e of equipes) {
            if (
                typeof e.papel !== "string"
                || !e.papel.trim()
            )
                throw new Error("Invalid team.");

            await client.query(
                `
                    INSERT INTO individuo_equipe (
                        id_individuo,
                        id_equipe,
                        papel,
                        data_entrada,
                        data_saida
                    )
                    VALUES ($1, $2, $3, $4, $5)
                `,
                [
                    idIndividuo,
                    e.id,
                    e.papel.trim(),
                    e.data_entrada || null,
                    e.data_saida || null
                ]
            );
        }

        for (const r of regioes) {
            await client.query(
                `
                    INSERT INTO individuo_regiao (
                        id_individuo,
                        id_regiao
                    )
                    VALUES ($1, $2)
                `,
                [idIndividuo, r.id]
            );
        }

        for (const e of eventos) {
            if (
                typeof e.papel !== "string"
                || !e.papel.trim()
                || typeof e.resultado_individual !== "string"
                || !e.resultado_individual.trim()
            )
                throw new Error("Invalid event.");

            await client.query(
                `
                    INSERT INTO individuo_evento (
                        id_individuo,
                        id_evento,
                        papel,
                        resultado_individual
                    )
                    VALUES ($1, $2, $3, $4)
                `,
                [
                    idIndividuo,
                    e.id,
                    e.papel.trim(),
                    e.resultado_individual.trim()
                ]
            );
        }

        for (const a of aliados) {
            await client.query(
                `
                    INSERT INTO aliados (
                        id_individuo1,
                        id_individuo2
                    )
                    VALUES ($1, $2)
                `,
                [idIndividuo, a.id]
            );
        }

        for (const i of inimigos) {
            await client.query(
                `
                    INSERT INTO inimigos (
                        id_individuo1,
                        id_individuo2
                    )
                    VALUES ($1, $2)
                `,
                [idIndividuo, i.id]
            );
        }

        await client.query("COMMIT");

        return res.status(201).json({
            id: idIndividuo,
            message: "Individual created."
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

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const individuo = await pool.query(
            `
                SELECT
                    i.id,
                    i.nome,
                    i.realidade,
                    i.nivel_ameaca,
                    i.alinhamento,
                    i.status,
                    i.data_nascimento,
                    i.humano,
                    i.mutante,
                    i.alienigena,
                    i.sintetico,
                    i.url_imagem
                FROM individuo i
                WHERE i.id = $1
            `,
            [id]
        );

        if (individuo.rows.length === 0) {
            return res.status(404).json({
                error: "Not found"
            });
        }

        const equipamentos = await pool.query(
            `
                SELECT
                    ie.id_equipamento AS id,
                    e.nome,
                    e.tipo,
                    e.url_imagem
                FROM individuo_equipamento ie
                JOIN equipamento e ON e.id = ie.id_equipamento
                WHERE ie.id_individuo = $1
                ORDER BY e.nome
            `,
            [id]
        );

        const equipes = await pool.query(
            `
                SELECT
                    ie.id_equipe AS id,
                    ie.papel,
                    ie.data_entrada,
                    ie.data_saida,
                    e.nome,
                    e.tipo
                FROM individuo_equipe ie
                JOIN equipe e ON e.id = ie.id_equipe
                WHERE ie.id_individuo = $1
                ORDER BY e.nome
            `,
            [id]
        );

        const eventos = await pool.query(
            `
                SELECT
                    ie.id_evento AS id,
                    ie.papel,
                    ie.resultado_individual,
                    e.nome,
                    e.nivel_ameaca,
                    e.data_inicio,
                    e.data_fim
                FROM individuo_evento ie
                JOIN evento e ON e.id = ie.id_evento
                WHERE ie.id_individuo = $1
                ORDER BY e.nome
            `,
            [id]
        );

        const habilidades = await pool.query(
            `
                SELECT
                    ih.id_habilidade AS id,
                    h.nome,
                    h.origem
                FROM individuo_habilidade ih
                JOIN habilidade h ON h.id = ih.id_habilidade
                WHERE ih.id_individuo = $1
                ORDER BY h.nome
            `,
            [id]
        );

        const regioes = await pool.query(
            `
                SELECT
                    ir.id_regiao AS id,
                    r.nome,
                    r.realidade,
                    r.tipo,
                    r.url_imagem
                FROM individuo_regiao ir
                JOIN regiao r ON r.id = ir.id_regiao
                WHERE ir.id_individuo = $1
                ORDER BY r.nome
            `,
            [id]
        );

        const aliados = await pool.query(
            `
                SELECT
                    i.id,
                    i.nome,
                    i.realidade,
                    i.nivel_ameaca,
                    i.alinhamento,
                    i.status,
                    i.url_imagem,
                    c.codinome
                FROM individuo i
                JOIN aliados a 
                    ON (
                        a.id_individuo1 = $1
                        AND i.id = a.id_individuo2
                    )
                    OR (
                        a.id_individuo2 = $1
                        AND i.id = a.id_individuo1
                    )
                LEFT JOIN LATERAL (
                    SELECT codinome
                    FROM codinome
                    WHERE id_individuo = i.id
                        AND data_fim IS NULL
                    ORDER BY data_inicio DESC NULLS LAST, id DESC
                    LIMIT 1
                ) c ON true
                ORDER BY i.nome
            `,
            [id]
        );

        const inimigos = await pool.query(
            `
                SELECT
                    i.id,
                    i.nome,
                    i.realidade,
                    i.nivel_ameaca,
                    i.alinhamento,
                    i.status,
                    i.url_imagem,
                    c.codinome
                FROM individuo i
                JOIN inimigos ini 
                    ON (
                        ini.id_individuo1 = $1
                        AND i.id = ini.id_individuo2
                    )
                    OR (
                        ini.id_individuo2 = $1
                        AND i.id = ini.id_individuo1
                    )
                LEFT JOIN LATERAL (
                    SELECT codinome
                    FROM codinome
                    WHERE id_individuo = i.id
                        AND data_fim IS NULL
                    ORDER BY data_inicio DESC NULLS LAST, id DESC
                    LIMIT 1
                ) c ON true
                ORDER BY i.nome
            `,
            [id]
        );

        const codinomes = await pool.query(
            `
                SELECT
                    c.codinome,
                    c.data_inicio,
                    c.data_fim
                FROM codinome c
                WHERE c.id_individuo = $1
                ORDER BY c.codinome
            `,
            [id]
        );

        const humano = await pool.query(
            `
                SELECT
                    h.documento,
                    h.pais
                FROM humano h
                WHERE h.id_individuo = $1
            `,
            [id]
        );

        const mutante = await pool.query(
            `
                SELECT
                    m.fator_gatilho,
                    m.descricao_mutacao
                FROM mutante m
                WHERE m.id_individuo = $1
            `,
            [id]
        );

        const alienigena = await pool.query(
            `
                SELECT
                    a.especie,
                    a.planeta_nativo
                FROM alienigena a
                WHERE a.id_individuo = $1
            `,
            [id]
        );

        const sintetico = await pool.query(
            `
                SELECT
                    s.fabricante,
                    s.material
                FROM sintetico s
                WHERE s.id_individuo = $1
            `,
            [id]
        );

        
        res.json({
            individuo: individuo.rows[0],
            equipamentos: equipamentos.rows,
            equipes: equipes.rows,
            eventos: eventos.rows,
            habilidades: habilidades.rows,
            regioes: regioes.rows,
            aliados: aliados.rows,
            inimigos: inimigos.rows,
            codinomes: codinomes.rows,
            humano: humano.rows[0],
            mutante: mutante.rows[0],
            alienigena: alienigena.rows[0],
            sintetico: sintetico.rows[0],
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