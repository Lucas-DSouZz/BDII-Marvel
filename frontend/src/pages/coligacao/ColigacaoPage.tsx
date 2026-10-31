import { CaretLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getColigacao } from "../../services/coligacaoServices";
import { NLButton } from "../../components/Buttons/Buttons";
import formatDate from "../../utils/formatDate";
import "../../components/SinglePage/SinglePage.css";

import type { ColigacaoResponse } from "../../types/coligacaoTypes";

export default function ColigacaoPage() {
    const navigate = useNavigate();

    const [item, setItem] = useState<ColigacaoResponse | null>(null);

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id)
            return;

        async function Get(id: string) {
            try {
                const res = await getColigacao(id);
                setItem(res);
            }

            catch (error) {
                if (
                    typeof error === "object"
                    && error !== null
                    && "status" in error
                    && error.status === 404
                ) {
                    navigate("/coligacao");
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

                <h1>COLIGAÇÃO :: {id}</h1>
           </header>

            <div className="__single small">
                <section className="head">
                    <h1>Nome: <span>{item.coligacao.nome}</span></h1>

                    {item.coligacao.ideologia && (
                        <h1>
                            Ideologia: <span>
                                {item.coligacao.ideologia}
                            </span>
                        </h1>
                    )}

                    {item.coligacao.data_fundacao && (
                            <h1>
                                Data de fundação: <span>
                                    {formatDate(item.coligacao.data_fundacao)}
                                </span>
                            </h1>
                    )}
                </section>

                {item.equipes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Equipes</h1>
                            <p>{item.equipes.length}</p>
                        </div>

                        {item.equipes.map((equipe) => (
                            <NavLink to={`/equipe/${equipe.id}`}>
                                <div className="clickable"
                                    key={equipe.id}
                                >
                                    <h2>{equipe.nome}</h2>

                                    <h3>
                                        Tipo: <span className={equipe.tipo}>
                                            {equipe.tipo}
                                        </span>
                                    </h3>

                                    {equipe.nivel_influencia && (
                                        <h3>
                                            Nível de influência: <span className={equipe.nivel_influencia}>
                                                {equipe.nivel_influencia}
                                            </span>
                                        </h3>
                                    )}

                                    {equipe.data_afiliacao && (
                                        <h3>
                                            Data de afiliação: <span>
                                                {formatDate(equipe.data_afiliacao)}
                                            </span>
                                        </h3>
                                    )}
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.guerras.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Guerras</h1>
                            <p>{item.guerras.length}</p>
                        </div>

                        {item.guerras.map((guerra) => (
                            <NavLink to={`/evento/${guerra.id_evento_correspondente}`}
                                key={guerra.id_evento_correspondente}
                            >
                                <div className="clickable">
                                    <h2>{guerra.nome}</h2>

                                    <h3>
                                        Coligacão inimiga: <span>
                                            {guerra.coligacao_inimiga}
                                        </span>
                                    </h3>

                                    <h3>
                                        Motivo: <span>
                                            {guerra.motivo}
                                        </span>
                                    </h3>
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