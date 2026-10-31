import { CaretLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getRegiao } from "../../services/regiaoService";
import { NLButton } from "../../components/Buttons/Buttons";
import formatDate from "../../utils/formatDate";
import "../../components/SinglePage/SinglePage.css";

import type { RegiaoResponse } from "../../types/regiaoTypes";

export default function RegiaoPage() {
    const navigate = useNavigate();
    const [item, setItem] = useState<RegiaoResponse | null>(null);
    const { id } = useParams<{ id: string }>();

    function formatDates(date1: string, date2: string) : string {
        if (date1 === "Invalid Date")
            return "";

        if (date2 === "Invalid Date")
            return `${date1} — Hoje`;

        if (date2 !== "Invalid Date")
            return `${date1} — ${date2}`;

        return "";
    }

    useEffect(() => {
        if (!id)
            return;

        async function Get(id: string) {
            try {
                const res = await getRegiao(id);
                setItem(res);
            }

            catch (error) {
                if (
                    typeof error === "object"
                    && error !== null
                    && "status" in error
                    && error.status === 404
                ) {
                    navigate("/regiao");
                    return;
                }

                console.error("Unable to query.");
            }
        }

        Get(id);
    }, [id]);

    if (!item)
        return (
            <section className="__loading">
                <CircleNotchIcon className="spin"
                    size={24}
                    weight="bold"
                />
            </section>
        );

    return (
        <div className="single-page">
           <header className="single-page">
                <NLButton 
                    IconLeft={CaretLeftIcon}
                    Theme="ui"
                    Back
                />

                <h1>REGIÃO :: {id}</h1>
           </header>

            <div className="__single medium">
                <section className="head row">
                    <img className="hor"
                        src={item.regiao.url_imagem}
                    />

                    <div>
                        <h1>Nome: <span>{item.regiao.nome}</span></h1>

                        <h1>Realidade: <span>
                                {item.regiao.realidade}
                            </span>
                        </h1>

                        <h1>Tipo: <span>
                                {item.regiao.tipo}
                            </span>
                        </h1>
                    </div>
                </section>
                
                {item.eventos.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Eventos</h1>
                            <p>{item.eventos.length}</p>
                        </div>

                        {item.eventos.map((evento) => (
                            <NavLink to={`/evento/${evento.id}`}
                                key={evento.id}
                            >
                                <div className="clickable"> 
                                    <h2>{evento.nome}</h2>

                                    <h3>
                                        Nível de ameaça: <span className={evento.nivel_ameaca}>
                                            {evento.nivel_ameaca}
                                        </span>
                                    </h3>

                                    <h3>{formatDates(
                                            formatDate(evento.data_inicio ?? ""), 
                                            formatDate(evento.data_fim ?? "")
                                        )
                                    }</h3>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.individuos.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Indivíduos</h1>
                            <p>{item.individuos.length}</p>
                        </div>

                        {item.individuos.map((individuo) => (
                            <NavLink to={`/individuo/${individuo.id}`}
                                key={individuo.id}
                            >
                                <div className="clickable row"> 
                                    <div className="aux">
                                        <img className="vert"
                                            src={individuo.url_imagem}
                                        />

                                        <div>
                                            <h2>{individuo.nome}</h2>

                                            <h3>
                                                {individuo.codinome
                                                    ? `${individuo.codinome}, `
                                                    : ""
                                                }
                                                {individuo.realidade}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        <p className={individuo.nivel_ameaca}>
                                            {individuo.nivel_ameaca}
                                        </p>
                                        <p className={individuo.alinhamento}>
                                            {individuo.alinhamento}
                                        </p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                <div className="__footer">
                    <p>EOF.</p>
                </div>
            </div>
        </div>
    );
}