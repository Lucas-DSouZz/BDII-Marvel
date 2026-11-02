import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import { CaretDownIcon, CaretLeftIcon, CaretUpIcon, CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";

import { getEquipes } from "../../services/equipeService";

import type { EquipesResponse } from "../../types/equipeTypes";

export default function AddColigacaoPage() {
    const navigate = useNavigate();

    const ideologiaRef = useRef<HTMLTextAreaElement>(null);

    interface Equipe {
        id: number;
        nome: string;
        tipo: string;
        data_afiliacao?: string;
        nivel_influencia: string;
    }

    const [nome, setNome] = useState("");
    const [ideologia, setIdeologia] = useState("");
    const [dataFundacao, setDataFundacao] = useState("");

    const [qE, setQE] = useState("");
    const [resE, setResE] = useState<EquipesResponse[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [loadingE, setLoadingE] = useState(false);

    const [sEquipes, setSEquipes] = useState(false);

    const [submited, setSubmited] = useState(false);

    function handleIdeologiaChange(e : React.ChangeEvent<HTMLTextAreaElement>) {
        setIdeologia(e.target.value);

        const textarea = ideologiaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function addEquipe(equipe: EquipesResponse) {
        setEquipes(prev => {
            if (prev.some(item => item.id === equipe.id)) return prev;

            return [
                ...prev,
                {
                    id: equipe.id,
                    nome: equipe.nome,
                    tipo: equipe.tipo,
                    data_afiliacao: "",
                    nivel_influencia: "Baixo"
                }
            ];
        });

        setResE(prev =>
            prev.filter(item => item.id !== equipe.id)
        );
    }

    function removeEquipe(id: number) {
        setEquipes(prev => prev.filter(item => item.id !== id));
    }

    function updateEquipe(
        id: number,
        campo: "data_afiliacao" | "nivel_influencia",
        valor: string
    ) {
        setEquipes(prev =>
            prev.map(equipe =>
                equipe.id === id
                    ? { ...equipe, [campo]: valor}
                    : equipe
            )
        );
    }

    useEffect(() => {
        const q = qE.trim();

        if (!q) {
            setResE([]);
            setLoadingE(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingE(true);

            try {
                const res = await getEquipes({ q: q });

                if (!cancel)
                    setResE(
                        res.items.filter(
                            e => !equipes.some(
                                ativa => ativa.id === e.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResE([]);
            }

            finally {
                if (!cancel)
                    setLoadingE(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qE, equipes]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setSubmited(true);

        if (equipes.length === 0)
            return;

        const body = {
            nome,
            ideologia,
            data_fundacao: dataFundacao,

            equipes: equipes.map(item => ({
                id: item.id,
                data_afiliacao: item.data_afiliacao || null,
                nivel_influencia: item.nivel_influencia
            }))
        };

        try {
            const rsp = await fetch(`https://bdii-marvel.onrender.com/api/coligacao`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            const res = await rsp.json();

            if (!rsp.ok) {
                console.error(res.message);
                return;
            }

            navigate(`/coligacao/${res.id}`);
        }

        catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="add-page">
            <header className="add-page">
                <NLButton
                    IconLeft={CaretLeftIcon}
                    Theme="ui"
                    Back
                />

                <h1>COLIGAÇÃO :: ADICIONAR</h1>
            </header>

            <form className="add-page"
                onSubmit={handleSubmit}
            >
                <section>
                    <div className="__head">
                        <h1>Informações básicas</h1>
                    </div>

                    <div className="__body">
                        <div className="field">
                            <label>Nome</label>
                            <input type="text"
                                className={submited && !nome.trim()
                                    ? "error"
                                    : ""
                                }
                                maxLength={128}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    setSubmited(false);
                                }}
                                placeholder="Informe o nome da coligacão"
                                value={nome}
                            />
                        </div>

                        <div className="field">
                            <label>Ideologia</label>
                            <textarea 
                                onChange={handleIdeologiaChange}
                                placeholder="Descreva a ideologia da coligação"
                                ref={ideologiaRef}
                                rows={1}
                                value={ideologia}
                            />
                        </div>

                        <div className="field">
                            <label>Data de fundação</label>
                            <input type="date"
                                onChange={(e) => {
                                    setDataFundacao(e.target.value);
                                }}
                                value={dataFundacao}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="__head">
                        <h1
                            className={submited && equipes.length === 0
                                ? "error"
                                : ""
                            }
                        >
                            Equipes
                            </h1>
                        <button className="tilt ui"
                            onClick={() => setSEquipes(x => !x)}
                            type="button"
                        >
                            {sEquipes && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sEquipes && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sEquipes && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQE(e.target.value)}
                                    placeholder="Digite o nome da equipe"
                                    value={qE}
                                />
                            </div>

                            {qE && (
                                <div className="add-popover">
                                    {loadingE && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingE && resE.length == 0 && (
                                        <p className="notice">Nenhuma equipe encontrada.</p>
                                    )} 

                                    {!loadingE && resE.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.tipo}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addEquipe(item);
                                                    setQE("");
                                                }}
                                                type="button"
                                            >
                                                <PlusIcon size={20} weight="bold" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {sEquipes && equipes.length > 0 && equipes.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >   
                                <div>
                                    <h1>{item.nome}</h1>
                                    <h2>{item.tipo}</h2>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeEquipe(item.id)}
                                    type="button"
                                >
                                    <XIcon size={20} weight="bold" />
                                </button>
                            </div>

                            <div className="bruhhh">
                                <div className="field">
                                    <label>Data de afiliação</label>
                                    <input type="date" 
                                        onChange={(e) => {
                                            updateEquipe(
                                                item.id,
                                                "data_afiliacao",
                                                e.target.value
                                            );
                                        }}
                                        value={item.data_afiliacao}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label>Nível de influência</label>
                                <select
                                    onChange={(e) => {
                                        updateEquipe(
                                            item.id,
                                            "nivel_influencia",
                                            e.target.value
                                        );
                                    }}
                                    value={item.nivel_influencia}
                                >
                                    <option value="Baixo">Baixo</option>
                                    <option value="Médio">Médio</option>
                                    <option value="Alto">Alto</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </section>

                <footer>
                    <div>
                        <CustomButton
                            Text="ADICIONAR COLIGAÇÃO"
                            Theme="action"
                            type="submit"
                        />
                    </div>
                </footer>
            </form>
        </div>
    );
}