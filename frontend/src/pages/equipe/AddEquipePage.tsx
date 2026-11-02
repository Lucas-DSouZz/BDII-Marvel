import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { IndividuosResponse } from "../../types/individuoTypes";
import type { ColigacoesResponse } from "../../types/coligacaoTypes";
import { getIndividuos } from "../../services/individuoService";
import { getColigacoes } from "../../services/coligacaoServices";
import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import { CaretDownIcon, CaretLeftIcon, CaretUpIcon, CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";

export default function AddEquipePage() {
    const navigate = useNavigate();

    const descRef = useRef<HTMLTextAreaElement>(null);

    interface Membro {
        id: number;
        nome: string;
        codinome?: string;
        realidade: string;
        papel: string;
        data_entrada?: string;
        data_saida?: string;
        url_imagem: string;
    }

    interface Coligacao {
        id: number;
        nome: string;
        data_afiliacao?: string;
        nivel_influencia: string;
    }

    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("Super-Heróis");
    const [descricao, setDescricao] = useState("");
    const [dataFundacao, setDataFundacao] = useState("");

    const [qM, setQM] = useState("");
    const [resM, setResM] = useState<IndividuosResponse[]>([]);
    const [membros, setMembros] = useState<Membro[]>([]);
    const [loadingM, setLoadingM] = useState(false);

    const [qC, setQC] = useState("");
    const [resC, setResC] = useState<ColigacoesResponse[]>([]);
    const [coligacoes, setColigacoes] = useState<Coligacao[]>([]);
    const [loadingC, setLoadingC] = useState(false);

    const [sMembros, setSMembros] = useState(false);
    const [sColigacoes, setSColigacoes] = useState(false);

    const [submited, setSubmited] = useState(false);

    function handleDescChange(e : React.ChangeEvent<HTMLTextAreaElement>) {
        setDescricao(e.target.value);

        const textarea = descRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function addMembro(membro: IndividuosResponse) {
        setMembros(prev => {
            if (prev.some(item => item.id === membro.id)) return prev;

            return [
                ...prev,
                {
                    id: membro.id,
                    nome: membro.nome,
                    codinome: membro.codinome ?? "",
                    realidade: membro.realidade,
                    papel: "",
                    data_entrada: "",
                    data_saida: "",
                    url_imagem: membro.url_imagem
                }
            ];
        });

        setResM(prev =>
            prev.filter(item => item.id !== membro.id)
        );
    }

    function removeMembro(id: number) {
        setMembros(prev => prev.filter(item => item.id !== id));
    }

    function updateMembro(
        id: number,
        campo: "papel" | "data_entrada" | "data_saida",
        valor: string
    ) {
        setMembros(prev =>
            prev.map(membro =>
                membro.id === id
                    ? { ...membro, [campo]: valor}
                    : membro
            )
        );
    }

    function addColigacao(coligacao: ColigacoesResponse) {
        setColigacoes(prev => {
            if (prev.some(item => item.id === coligacao.id)) return prev;

            return [
                ...prev,
                {
                    id: coligacao.id,
                    nome: coligacao.nome,
                    data_afiliacao: "",
                    nivel_influencia: "Baixo"
                }
            ];
        });

        setResC(prev =>
            prev.filter(item => item.id !== coligacao.id)
        );
    }

    function removeColigacao(id: number) {
        setColigacoes(prev => prev.filter(item => item.id !== id));
    }

    function updateColigacao(
        id: number,
        campo: "data_afiliacao" | "nivel_influencia",
        valor: string
    ) {
        setColigacoes(prev =>
            prev.map(coligacao =>
                coligacao.id === id
                    ? { ...coligacao, [campo]: valor}
                    : coligacao
            )
        );
    }

    useEffect(() => {
        const q = qM.trim();

        if (!q) {
            setResM([]);
            setLoadingM(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingM(true);

            try {
                const res = await getIndividuos({ q: q });

                if (!cancel)
                    setResM(
                        res.items.filter(
                            m => !membros.some(
                                ativo => ativo.id === m.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResM([]);
            }

            finally {
                if (!cancel)
                    setLoadingM(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qM, membros]);

    useEffect(() => {
        const q = qC.trim();

        if (!q) {
            setResC([]);
            setLoadingC(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingC(true);

            try {
                const res = await getColigacoes({ q: q });

                if (!cancel)
                    setResC(
                        res.items.filter(
                            c => !coligacoes.some(
                                ativa => ativa.id === c.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResC([]);
            }

            finally {
                if (!cancel)
                    setLoadingC(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qC, coligacoes]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setSubmited(true);

        if (membros.length === 0)
            return;

        const body = {
            nome,
            tipo,
            descricao,
            data_fundacao: dataFundacao,

            membros: membros.map(item => ({
                id: item.id,
                papel: item.papel,
                data_entrada: item.data_entrada || null,
                data_saida: item.data_saida || null
            })),

            coligacoes: coligacoes.map(item => ({
                id: item.id,
                data_afiliacao: item.data_afiliacao || null,
                nivel_influencia: item.nivel_influencia
            }))
        };

        try {
            const rsp = await fetch("http://localhost:1629/api/equipe", {
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

            navigate(`/equipe/${res.id}`);
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

                <h1>EQUIPE :: ADICIONAR</h1>
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
                                placeholder="Informe o nome da equipe"
                                value={nome}
                            />
                        </div>

                        <div className="field">
                            <label>Tipo</label>
                            <select
                                onChange={(e) => setTipo(e.target.value)}
                                value={tipo}
                            >
                                <option value="Super-Heróis">Super-Heróis</option>
                                <option value="Operações Táticas">Operações Táticas</option>
                                <option value="Ameaça Criminosa">Ameaça Criminosa</option>
                                <option value="Ameaça Global">Ameaça Global</option>
                                <option value="Governamental">Governamental</option>
                                <option value="Mercenários">Mercenários</option>
                                <option value="Científica">Científica</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Descrição</label>
                            <textarea 
                                onChange={handleDescChange}
                                placeholder="Descreva a equipe"
                                ref={descRef}
                                rows={1}
                                value={descricao}
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
                            className={submited && membros.length === 0
                                ? "error"
                                : ""
                            }
                        >
                            Membros
                        </h1>
                        <button className="tilt ui"
                            onClick={() => setSMembros(x => !x)}
                            type="button"
                        >
                            {sMembros && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sMembros && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sMembros && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQM(e.target.value)}
                                    placeholder="Digite o nome do indivíduo"
                                    value={qM}
                                />
                            </div>

                            {qM && (
                                <div className="add-popover">
                                    {loadingM && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingM && resM.length == 0 && (
                                        <p className="notice">Nenhum indivíduo encontrada.</p>
                                    )} 

                                    {!loadingM && resM.map((item) => (
                                        <div key={item.id}>
                                            <section className="auxx">
                                                <img src={item.url_imagem} />

                                                <section>
                                                    <h1>{item.nome}</h1>
                                                    <h2>
                                                        {item.codinome
                                                            ? `${item.codinome}, `
                                                            : ""
                                                        }
                                                        {item.realidade}
                                                    </h2>
                                                </section>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addMembro(item);
                                                    setQM("");
                                                    setSubmited(false);
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

                    {sMembros && membros.length > 0 && membros.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <div className="auxx">
                                    <img src={item.url_imagem} />

                                    <div>
                                        <h1>{item.nome}</h1>
                                        <h2>
                                            {item.codinome
                                                ? `${item.codinome}, `
                                                : ""
                                            }
                                            {item.realidade}
                                        </h2>
                                    </div>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeMembro(item.id)}
                                    type="button"
                                >
                                    <XIcon size={20} weight="bold" />
                                </button>
                            </div>

                            <div className="bruhhh">
                                <div className="field">
                                    <label>Papel</label>
                                    <input type="text" 
                                        className={submited && !item.papel.trim()
                                            ? "error"
                                            : ""
                                        }
                                        maxLength={64}
                                        onChange={(e) => {
                                            updateMembro(
                                                item.id,
                                                "papel",
                                                e.target.value
                                            );
                                            setSubmited(false);
                                        }}
                                        placeholder="Informe o papel do indivíduo"
                                        value={item.papel}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <label>Data de entrada</label>
                                <input type="date"
                                    onChange={(e) => 
                                        updateMembro(
                                            item.id,
                                            "data_entrada",
                                            e.target.value
                                        )
                                    }
                                    value={item.data_entrada}
                                />
                            </div>

                            <div className="field">
                                <label>Data de saída</label>
                                <input type="date"
                                    onChange={(e) => 
                                        updateMembro(
                                            item.id,
                                            "data_saida",
                                            e.target.value
                                        )
                                    }
                                    value={item.data_saida}
                                />
                            </div>
                        </div>
                    ))}
                </section>

                <section>
                    <div className="__head">
                        <h1>Coligações</h1>
                        <button className="tilt ui"
                            onClick={() => setSColigacoes(x => !x)}
                            type="button"
                        >
                            {sColigacoes && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sColigacoes && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sColigacoes && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQC(e.target.value)}
                                    placeholder="Digite o nome da coligação"
                                    value={qC}
                                />
                            </div>

                            {qC && (
                                <div className="add-popover">
                                    {loadingC && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingC && resC.length == 0 && (
                                        <p className="notice">Nenhuma coligação encontrada.</p>
                                    )} 

                                    {!loadingC && resC.map((item) => (
                                        <div key={item.id}>
                                            <h1>{item.nome}</h1>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addColigacao(item);
                                                    setQC("");
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

                    {sColigacoes && coligacoes.length > 0 && coligacoes.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <h1>{item.nome}</h1>

                                <button className="tilt danger"
                                    onClick={() => removeColigacao(item.id)}
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
                                            updateColigacao(
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
                                        updateColigacao(
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
                            Text="ADICIONAR EQUIPE"
                            Theme="action"
                            type="submit"
                        />
                    </div>
                </footer>
            </form>
        </div>
    );
}