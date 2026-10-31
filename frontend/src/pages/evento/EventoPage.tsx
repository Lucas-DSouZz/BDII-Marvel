import { CaretLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getEvento } from "../../services/eventoService";
import { NLButton } from "../../components/Buttons/Buttons";
import formatDate from "../../utils/formatDate";
import "../../components/SinglePage/SinglePage.css";

import type { EventoResponse } from "../../types/eventoTypes";

export default function EventoPage() {
    const navigate = useNavigate();
    const [item, setItem] = useState<EventoResponse | null>(null);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id)
            return;

        async function Get(id: string) {
            try {
                const res = await getEvento(id);
                setItem(res);
            }

            catch (error) {
                if (
                    typeof error === "object"
                    && error !== null
                    && "status" in error
                    && error.status === 404
                ) {
                    navigate("/evento");
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

                <h1>EVENTO :: {id}</h1>
           </header>

            <div className="__single medium">
                <section className="head">
                    <h1>Nome: <span>{item.evento.nome}</span></h1>

                    <h1>Nível de ameaça: <span className={item.evento.nivel_ameaca}>
                            {item.evento.nivel_ameaca}
                        </span>
                    </h1>

                    {item.evento.data_inicio && (
                        <h1>
                            Data do início: <span>
                                {formatDate(item.evento.data_inicio)}
                            </span>
                        </h1>
                    )}

                    {item.evento.data_fim && (
                        <h1>
                            Data do fim: <span>
                                {formatDate(item.evento.data_fim)}
                            </span>
                        </h1>
                    )}

                    <h1>
                        Descrição: <span>
                            {item.evento.descricao}
                        </span>
                    </h1>
                </section>
                
                {item.guerra.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Guerra correspondente</h1>
                        </div>

                        {item.guerra.map((guerra) => (
                            <div className="basic"
                                key={guerra.nome}
                            >
                                <h2>{guerra.nome}</h2>

                                <h3>
                                    Motivo: <span>
                                        {guerra.motivo}
                                    </span>
                                </h3>

                                <h3>
                                    Coligações: <NavLink to={`/coligacao/${guerra.id_coligacao1}`}>
                                        {guerra.nome_coligacao1}
                                    </NavLink> <span>
                                        e
                                    </span> <NavLink to={`/coligacao/${guerra.id_coligacao2}`}>
                                        {guerra.nome_coligacao2}
                                    </NavLink>
                                </h3>
                            </div>
                        ))}
                    </section>
                )}

                {item.regioes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Regiões</h1>
                            <p>{item.regioes.length}</p>
                        </div>

                        {item.regioes.map((regiao) => (
                            <NavLink to={`/regiao/${regiao.id}`}
                                key={regiao.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="hor"
                                            src={regiao.url_imagem}
                                        />

                                        <div>
                                            <h2>{regiao.nome}</h2>
                                            <h3>{regiao.realidade}</h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        <p>{regiao.tipo}</p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.participantes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Indivíduos envolvidos</h1>
                            <p>{item.participantes.length}</p>
                        </div>

                        {item.participantes.map((part) => (
                            <NavLink to={`/individuo/${part.id}`}
                                key={part.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="vert"
                                            src={part.url_imagem}
                                        />

                                        <div>
                                            <h2>{part.nome}</h2>
                                            <h3>
                                                {part.codinome
                                                    ? `${part.codinome}, `
                                                    : ""
                                                }
                                                {part.realidade}
                                            </h3>
                                            <h3>{part.papel}</h3>
                                            <h3>{part.resultado_individual}</h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        <p className={part.alinhamento}>
                                            {part.alinhamento}
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