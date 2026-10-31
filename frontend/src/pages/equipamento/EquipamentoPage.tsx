import { CaretLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getEquipamento } from "../../services/equipamentoService";
import { NLButton } from "../../components/Buttons/Buttons";
import "../../components/SinglePage/SinglePage.css";

import type { EquipamentoResponse } from "../../types/equipamentoTypes";

export default function EquipamentoPage() {
    const navigate = useNavigate();

    const [item, setItem] = useState<EquipamentoResponse | null>(null);

    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id)
            return;

        async function Get(id: string) {
            try {
                const res = await getEquipamento(id);
                setItem(res);
            }

            catch (error) {
                if (
                    typeof error === "object"
                    && error !== null
                    && "status" in error
                    && error.status === 404
                ) {
                    navigate("/equipamento");
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

                <h1>EQUIPAMENTO :: {id}</h1>
           </header>

            <div className="__single medium">
                <section className="head row">
                    <img className="square" 
                        src={item.equipamento.url_imagem}
                    />

                    <div>
                        <h1>Nome: <span>{item.equipamento.nome}</span></h1>

                        {item.equipamento.tipo && (
                            <h1>
                                Tipo: <span>
                                    {item.equipamento.tipo}
                                </span>
                            </h1>
                        )}

                        {item.equipamento.origem && (
                            <h1>
                                Origem: <span>
                                    {item.equipamento.origem}
                                </span>
                            </h1>
                        )}

                        {item.equipamento.descricao && (
                            <h1>
                                Descrição: <span>
                                    {item.equipamento.descricao}
                                </span>
                            </h1>
                        )}
                    </div>
                </section>

                {item.donos.length > 0  && (
                    <section className="body">
                        <div className="__head">
                            <h1>Usuários</h1>
                            <p>{item.donos.length}</p>
                        </div>

                        {item.donos.map((dono) => (
                            <NavLink to={`/individuo/${dono.id}`}
                                key={dono.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="vert" 
                                            src={dono.url_imagem}
                                        />

                                        <div>
                                            <h2>{dono.nome}</h2>
                                            <h3>
                                                {dono.codinome
                                                    ? `${dono.codinome}, `
                                                    : ""
                                                }
                                                {dono.realidade}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        {dono.alinhamento && (
                                            <p className={dono.alinhamento}>
                                                {dono.alinhamento}
                                            </p>
                                        )}

                                        {dono.status && (
                                            <p className={dono.status}>
                                                {dono.status}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.dependentes.length > 0  && (
                    <section className="body">
                        <div className="__head">
                            <h1>Habilidades dependentes</h1>
                            <p>{item.dependentes.length}</p>
                        </div>

                        {item.dependentes.map((dependente) => (
                            <NavLink to={`/habilidade/${dependente.id}`}
                                key={dependente.id}
                            >
                                <div className="clickable">
                                    <h2>{dependente.nome}</h2>

                                    {dependente.descricao && (
                                        <h3>Descrição: <span>
                                                {dependente.descricao}
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