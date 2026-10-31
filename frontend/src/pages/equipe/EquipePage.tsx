import { CaretLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getEquipe } from "../../services/equipeService";
import { NLButton } from "../../components/Buttons/Buttons";
import formatDate from "../../utils/formatDate";
import "../../components/SinglePage/SinglePage.css";

import type { EquipeResponse } from "../../types/equipeTypes";

export default function EquipePage() {
    const navigate = useNavigate();
    const [item, setItem] = useState<EquipeResponse | null>(null);
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
                const res = await getEquipe(id);
                setItem(res);
            }

            catch (error) {
                if (
                    typeof error === "object"
                    && error !== null
                    && "status" in error
                    && error.status === 404
                ) {
                    navigate("/equipe");
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

                <h1>EQUIPE :: {id}</h1>
           </header>

            <div className="__single medium">
                <section className="head">
                    <h1>Nome: <span>{item.equipe.nome}</span></h1>

                    <h1>Tipo: <span className={item.equipe.tipo}>
                            {item.equipe.tipo}
                        </span>
                    </h1>

                    {item.equipe.descricao && (
                        <h1>
                            Descrição: <span>
                                {item.equipe.descricao}
                            </span>
                        </h1>
                    )}

                    {item.equipe.data_fundacao && (
                            <h1>
                                Data de fundação: <span>
                                    {formatDate(item.equipe.data_fundacao)}
                                </span>
                            </h1>
                    )}
                </section>

                {item.membros.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Membros</h1>
                            <p>{item.membros.length}</p>
                        </div>

                        {item.membros.map((membro) => (
                            <NavLink to={`/individuo/${membro.id}`}
                                key={membro.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="vert" 
                                            src={membro.url_imagem}
                                        />

                                        <div>
                                            <h2>{membro.nome}</h2>
                                            <h3>
                                                {membro.codinome
                                                    ? `${membro.codinome}, `
                                                    : ""
                                                }
                                                {membro.realidade}
                                            </h3>
                                            
                                            <h3>{membro.papel}</h3>
                                            <h3>{formatDates(
                                                    formatDate(membro.data_entrada ?? ""), 
                                                    formatDate(membro.data_saida ?? "")
                                                )
                                            }</h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        <p className={membro.nivel_ameaca}>
                                            {membro.nivel_ameaca}
                                        </p>
                                        <p className={membro.status}>
                                            {membro.status}
                                        </p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.coligacoes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Coligações</h1>
                            <p>{item.coligacoes.length}</p>
                        </div>

                        {item.coligacoes.map((coligacao) => (
                            <NavLink to={`/coligacao/${coligacao.id}`}
                                key={coligacao.id}
                            >
                                <div className="clickable">
                                    <h2>{coligacao.nome}</h2>

                                    <h3>
                                        Nível de influência: <span className={coligacao.nivel_influencia}>
                                            {coligacao.nivel_influencia}
                                        </span>
                                    </h3>

                                    {coligacao.data_afiliacao && (
                                        <h3>
                                            Data de afiliação: <span>
                                                {formatDate(coligacao.data_afiliacao)}
                                            </span>
                                        </h3>
                                    )}
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