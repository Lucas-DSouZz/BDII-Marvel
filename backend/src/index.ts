import express from "express";
import cors from "cors";

import coligacaoRouter from "./routes/coligacaoRouter.js";
import equipamentoRouter from "./routes/equipamentoRouter.js";
import equipeRouter from "./routes/equipeRouter.js";
import eventoRouter from "./routes/eventoRouter.js";
import habilidadeRouter from "./routes/habilidadeRouter.js";
import individuoRouter from "./routes/individuoRouter.js";
import regiaoRouter from "./routes/regiaoRouter.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/coligacao", coligacaoRouter);
app.use("/api/equipamento", equipamentoRouter);
app.use("/api/equipe", equipeRouter);
app.use("/api/evento", eventoRouter);
app.use("/api/habilidade", habilidadeRouter);
app.use("/api/individuo", individuoRouter);
app.use("/api/regiao", regiaoRouter);

const port = Number(process.env.PORT) || 1629;

app.listen(port, "0.0.0.0", () => {
    console.log(`API running. Port: ${port}`);
});