import { CaretLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getHabilidade } from "../../services/habilidadeService";
import { NLButton } from "../../components/Buttons/Buttons";
import "../../components/SinglePage/SinglePage.css";

import type { HabilidadeResponse } from "../../types/habilidadeTypes";

export default function HabilidadePage() {
    const navigate = useNavigate();
    const [item, setItem] = useState<HabilidadeResponse | null>(null);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id)
            return;

        async function Get(id: string) {
            try {
                const res = await getHabilidade(id);
                setItem(res);
            }

            catch (error) {
                if (
                    typeof error === "object"
                    && error !== null
                    && "status" in error
                    && error.status === 404
                ) {
                    navigate("/habilidade");
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

                <h1>HABILIDADE :: {id}</h1>
           </header>

            <div className="__single medium">
                <section className="head">
                    <h1>Nome: <span>{item.habilidade.nome}</span></h1>

                    <h1>Origem: <span>
                            {item.habilidade.origem}
                        </span>
                    </h1>

                    {item.habilidade.descricao && (
                        <h1>
                            Descrição: <span>
                                {item.habilidade.descricao}
                            </span>
                        </h1>
                    )}
                        
                </section>
                
                {item.equips.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Equipamentos requeridos</h1>
                            <p>{item.equips.length}</p>
                        </div>

                        {item.equips.map((equip) => (
                            <NavLink to={`/equipamento/${equip.id}`}
                                key={equip.id}
                            >
                                <div className="clickable row"> 
                                    <div className="aux">
                                        <img className="square"
                                            src={equip.url_imagem}
                                        />

                                        <div>
                                            <h2>{equip.nome}</h2>

                                            {equip.tipo && (
                                                <h3>{equip.tipo}</h3>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.habs_requisitos.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Habilidades requeridas</h1>
                            <p>{item.habs_requisitos.length}</p>
                        </div>

                        {item.habs_requisitos.map((req) => (
                            <NavLink to={`/habilidade/${req.id}`}
                                key={req.id}
                            >
                                <div className="clickable"> 
                                    <h2>{req.nome}</h2>
                                    <h3>{req.origem}</h3>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.habs_dependentes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Habilidades dependentes</h1>
                            <p>{item.habs_dependentes.length}</p>
                        </div>

                        {item.habs_dependentes.map((dep) => (
                            <NavLink to={`/habilidade/${dep.id}`}
                                key={dep.id}
                            >
                                <div className="clickable"> 
                                    <h2>{dep.nome}</h2>
                                    <h3>{dep.origem}</h3>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.usuarios.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Usuários</h1>
                            <p>{item.usuarios.length}</p>
                        </div>

                        {item.usuarios.map((usuario) => (
                            <NavLink to={`/individuo/${usuario.id}`}
                                key={usuario.id}
                            >
                                <div className="clickable row"> 
                                    <div className="aux">
                                        <img className="vert"
                                            src={usuario.url_imagem}
                                        />

                                        <div>
                                            <h2>{usuario.nome}</h2>

                                            <h3>
                                                {usuario.codinome
                                                    ? `${usuario.codinome}, `
                                                    : ""
                                                }
                                                {usuario.realidade}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        <p className={usuario.nivel_ameaca}>
                                            {usuario.nivel_ameaca}
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