import { CaretLeftIcon, CircleNotchIcon } from "@phosphor-icons/react";

import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getIndividuo } from "../../services/individuoService";
import { NLButton } from "../../components/Buttons/Buttons";
import formatDate from "../../utils/formatDate";
import "../../components/SinglePage/SinglePage.css";

import type { IndividuoResponse } from "../../types/individuoTypes";

export default function IndividuoPage() {
    const navigate = useNavigate();
    const [item, setItem] = useState<IndividuoResponse | null>(null);
    const { id } = useParams<{ id: string }>();

    function formatDates(date1: string, date2: string) : string {
        if (date1 === "Invalid Date")
            return "Tempo indefinido";

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
                const res = await getIndividuo(id);
                setItem(res);
            }

            catch (error) {
                if (
                    typeof error === "object"
                    && error !== null
                    && "status" in error
                    && error.status === 404
                ) {
                    navigate("/individuo");
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

                <h1>INDIVIDUO :: {id}</h1>
           </header>

            <div className="__single big">
                <section className="head row">
                    <img className="vert"
                        src={item.individuo.url_imagem}
                    />

                    <div>
                        <h1>Nome: <span>{item.individuo.nome}</span></h1>
                        <h1>Realidade: <span>{item.individuo.realidade}</span></h1>
                        
                        <h1>
                            Nivel de ameaça: <span className={item.individuo.nivel_ameaca}>
                                {item.individuo.nivel_ameaca}
                            </span>
                        </h1>

                        <h1>
                            Alinhamento: <span className={item.individuo.alinhamento}>
                                {item.individuo.alinhamento}
                            </span>
                        </h1>

                        <h1>
                            Status: <span className={item.individuo.status}>
                                {item.individuo.status}
                            </span>
                        </h1>
                        
                        {item.individuo.data_nascimento && (
                            <h1>
                                Data de nascimento: <span>
                                    {formatDate(item.individuo.data_nascimento)}
                                </span>
                            </h1>
                        )}

                        {item.individuo.humano 
                        && item.humano.documento
                        && (
                            <h1>
                                Documento: <span>
                                    {item.humano.documento}
                                </span>
                            </h1>
                        )}

                        {item.individuo.humano 
                        && item.humano.pais
                        && (
                            <h1>
                                País: <span>
                                    {item.humano.pais}
                                </span>
                            </h1>
                        )}

                        {item.individuo.mutante 
                        && item.mutante.descricao_mutacao
                        && (
                            <h1>
                                Descrição da mutação: <span>
                                    {item.mutante.descricao_mutacao}
                                </span>
                            </h1>
                        )}

                        {item.individuo.mutante 
                        && item.mutante.fator_gatilho
                        && (
                            <h1>
                                Fator gatilho: <span>
                                    {item.mutante.fator_gatilho}
                                </span>
                            </h1>
                        )}

                        {item.individuo.alienigena 
                        && item.alienigena.especie
                        && (
                            <h1>
                                Espécie: <span>
                                    {item.alienigena.especie}
                                </span>
                            </h1>
                        )}

                        {item.individuo.alienigena 
                        && item.alienigena.planeta_nativo
                        && (
                            <h1>
                                Planeta nativo: <span>
                                    {item.alienigena.planeta_nativo}
                                </span>
                            </h1>
                        )}

                        {item.individuo.sintetico 
                        && item.sintetico.fabricante
                        && (
                            <h1>
                                Fabricante: <span>
                                    {item.sintetico.fabricante}
                                </span>
                            </h1>
                        )}

                        {item.individuo.sintetico 
                        && item.sintetico.material
                        && (
                            <h1>
                                Material: <span>
                                    {item.sintetico.material}
                                </span>
                            </h1>
                        )}
                    </div>
                </section>

                {item.codinomes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Codinomes</h1>
                            <p>{item.codinomes.length}</p>
                        </div>
                        
                        {item.codinomes.map((cn) => (
                            <div className="basic">
                                <h2>{cn.codinome}</h2>

                                <h3>{formatDates(
                                        formatDate(cn.data_inicio ?? ""), 
                                        formatDate(cn.data_fim ?? "")
                                    )
                                }</h3>
                                    
                            </div>
                        ))}
                            
                    </section>
                )}

                {item.habilidades.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Habilidades</h1>
                            <p>{item.habilidades.length}</p>
                        </div>

                        {item.habilidades.map((hab) => (
                            <NavLink to={`/habilidade/${hab.id}`}
                                key={hab.id}
                            >
                                <div className="clickable">
                                    <h2>{hab.nome}</h2>
                                    <h3>{hab.origem}</h3>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.equipamentos.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Equipamentos</h1>
                            <p>{item.equipamentos.length}</p>
                        </div>

                        {item.equipamentos.map((eqp) => (
                            <NavLink to={`/equipamento/${eqp.id}`}
                                key={eqp.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="square"
                                            src={eqp.url_imagem}
                                        />

                                        <div>
                                            <h2>{eqp.nome}</h2>

                                            {eqp.tipo && (
                                                <h3>{eqp.tipo}</h3>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.equipes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Equipes</h1>
                            <p>{item.equipes.length}</p>
                        </div>

                        {item.equipes.map((eqp) => (
                            <NavLink to={`/equipe/${eqp.id}`}
                                key={eqp.id}
                            >
                                <div className="clickable row">
                                    <div>
                                        <h2>{eqp.nome}</h2>
                                        <h3>{eqp.papel}</h3>
                                        <h3>{formatDates(
                                                formatDate(eqp.data_entrada ?? ""), 
                                                formatDate(eqp.data_saida ?? "")
                                            )
                                        }</h3>
                                    </div>

                                    <div>
                                        <p className={eqp.tipo}>
                                            {eqp.tipo}
                                        </p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.regioes.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Regiões</h1>
                            <p>{item.regioes.length}</p>
                        </div>

                        {item.regioes.map((reg) => (
                            <NavLink to={`/regiao/${reg.id}`}
                                key={reg.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="hor"
                                            src={reg.url_imagem}
                                        />

                                        <div>
                                            <h2>{reg.nome}</h2>
                                            <h3>{reg.realidade}</h3>
                                        </div>
                                    </div>

                                    <div>
                                        <p>{reg.tipo}</p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.eventos.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Eventos</h1>
                            <p>{item.eventos.length}</p>
                        </div>

                        {item.eventos.map((evt) => (
                            <NavLink to={`/evento/${evt.id}`}
                                key={evt.id}
                            >
                                <div className="clickable row">
                                    <div>
                                        <h2>{evt.nome}</h2>
                                        <h3>
                                            Papel: <span>
                                                {evt.papel}
                                            </span>
                                        </h3>
                                        <h3>
                                            Resultado individual: <span>
                                                {evt.resultado_individual}
                                            </span>
                                        </h3>
                                        <h3>
                                            Período: <span>
                                                {formatDates(
                                                    formatDate(evt.data_inicio ?? ""), 
                                                    formatDate(evt.data_fim ?? "")
                                                )}
                                            </span>
                                        </h3>
                                    </div>

                                    <div>
                                        <p className={evt.nivel_ameaca}>
                                            {evt.nivel_ameaca}
                                        </p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.aliados.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Aliados</h1>
                            <p>{item.aliados.length}</p>
                        </div>

                        {item.aliados.map((ali) => (
                            <NavLink to={`/individuo/${ali.id}`}
                                key={ali.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="vert"
                                            src={ali.url_imagem}
                                        />

                                        <div>
                                            <h2>{ali.nome}</h2>
                                            <h3>
                                                {ali.codinome
                                                    ? `${ali.codinome}, `
                                                    : ""
                                                }
                                                {ali.realidade}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        <p className={ali.nivel_ameaca}>
                                            {ali.nivel_ameaca}
                                        </p>
                                        <p className={ali.alinhamento}>
                                            {ali.alinhamento}
                                        </p>
                                        <p className={ali.status}>
                                            {ali.status}
                                        </p>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </section>
                )}

                {item.inimigos.length > 0 && (
                    <section className="body">
                        <div className="__head">
                            <h1>Inimigos</h1>
                            <p>{item.inimigos.length}</p>
                        </div>

                        {item.inimigos.map((ini) => (
                            <NavLink to={`/individuo/${ini.id}`}
                                key={ini.id}
                            >
                                <div className="clickable row">
                                    <div className="aux">
                                        <img className="vert"
                                            src={ini.url_imagem}
                                        />

                                        <div>
                                            <h2>{ini.nome}</h2>
                                            <h3>
                                                {ini.codinome
                                                    ? `${ini.codinome}, `
                                                    : ""
                                                }
                                                {ini.realidade}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="aux">
                                        <p className={ini.nivel_ameaca}>
                                            {ini.nivel_ameaca}
                                        </p>
                                        <p className={ini.alinhamento}>
                                            {ini.alinhamento}
                                        </p>
                                        <p className={ini.status}>
                                            {ini.status}
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