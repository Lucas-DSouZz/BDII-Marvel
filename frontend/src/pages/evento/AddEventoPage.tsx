import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { IndividuosResponse } from "../../types/individuoTypes";
import { getIndividuos } from "../../services/individuoService";
import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import { CaretDownIcon, CaretLeftIcon, CaretUpIcon, CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import type { RegioesResponse } from "../../types/regiaoTypes";
import { getRegioes } from "../../services/regiaoService";
import type { ColigacoesResponse } from "../../types/coligacaoTypes";
import { getColigacoes } from "../../services/coligacaoServices";

export default function AddEventoPage() {
    const navigate = useNavigate();

    const descRef = useRef<HTMLTextAreaElement>(null);

    interface Individuo {
        id: number;
        nome: string;
        codinome?: string;
        realidade: string;
        papel: string;
        resultado_individual: string;
        url_imagem: string;
    }

    const [nome, setNome] = useState("");
    const [nivel, setNivel] = useState("Baixa");
    const [descricao, setDescricao] = useState("");
    const [inicio, setInicio] = useState("");
    const [fim, setFim] = useState("");

    const [qR, setQR] = useState("");
    const [resR, setResR] = useState<RegioesResponse[]>([]);
    const [regioes, setRegioes] = useState<RegioesResponse[]>([]);
    const [loadingR, setLoadingR] = useState(false);

    const [qI, setQI] = useState("");
    const [resI, setResI] = useState<IndividuosResponse[]>([]);
    const [individuos, setIndividuos] = useState<Individuo[]>([]);
    const [loadingI, setLoadingI] = useState(false);

    const [q1, setQ1] = useState("");
    const [res1, setRes1] = useState<ColigacoesResponse[]>([]);
    const [c1, setC1] = useState<ColigacoesResponse>();
    const [loading1, setLoading1] = useState(false);

    const [q2, setQ2] = useState("");
    const [res2, setRes2] = useState<ColigacoesResponse[]>([]);
    const [c2, setC2] = useState<ColigacoesResponse>();
    const [loading2, setLoading2] = useState(false);

    const [sGuerra, setSGuerra] = useState(false);
    const [sRegioes, setSRegioes] = useState(false);
    const [sIndividuos, setSIndividuos] = useState(false);

    const [submited, setSubmited] = useState(false);

    const [nomeGuerra, setNomeGuerra] = useState("");
    const [motivoGuerra, setMotivoGuerra] = useState("");
    const [id1Guerra, setId1] = useState(-1);
    const [id2Guerra, setId2] = useState(-1);


    function handleDescChange(e : React.ChangeEvent<HTMLTextAreaElement>) {
        setDescricao(e.target.value);

        const textarea = descRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function addRegiao(regiao: RegioesResponse) {
        setRegioes(prev => {
            if (prev.some(item => item.id === regiao.id)) return prev;

            return [...prev, regiao];
        });

        setResR(prev =>
            prev.filter(item => item.id !== regiao.id)
        );
    }

    function removeRegiao(id: number) {
        setRegioes(prev => prev.filter(item => item.id !== id));
    }

    function addInd(ind: IndividuosResponse) {
        setIndividuos(prev => {
            if (prev.some(item => item.id === ind.id)) return prev;

            return [
                ...prev,
                {
                    id: ind.id,
                    nome: ind.nome,
                    codinome: ind.codinome ?? "",
                    realidade: ind.realidade,
                    papel: "",
                    resultado_individual: "",
                    url_imagem: ind.url_imagem
                }
            ];
        });

        setResI(prev =>
            prev.filter(item => item.id !== ind.id)
        );
    }

    function removeInd(id: number) {
        setIndividuos(prev => prev.filter(item => item.id !== id));
    }

    function updateIndividuo(
        id: number,
        campo: "papel" | "resultado_individual",
        valor: string
    ) {
        setIndividuos(prev =>
            prev.map(ind =>
                ind.id === id
                    ? { ...ind, [campo]: valor}
                    : ind
            )
        );
    }

    useEffect(() => {
        const q = qR.trim();

        if (!q) {
            setResR([]);
            setLoadingR(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingR(true);

            try {
                const res = await getRegioes({ q: q });

                if (!cancel)
                    setResR(
                        res.items.filter(
                            r => !regioes.some(
                                ativo => ativo.id === r.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResR([]);
            }

            finally {
                if (!cancel)
                    setLoadingR(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qR, regioes]);

    useEffect(() => {
        const q = qI.trim();

        if (!q) {
            setResI([]);
            setLoadingI(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingI(true);

            try {
                const res = await getIndividuos({ q: q });

                if (!cancel)
                    setResI(
                        res.items.filter(
                            i => !individuos.some(
                                ativa => ativa.id === i.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResI([]);
            }

            finally {
                if (!cancel)
                    setLoadingI(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qI, individuos]);

    useEffect(() => {
        const q = q1.trim();

        if (!q) {
            setRes1([]);
            setLoading1(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoading1(true);

            try {
                const res = await getColigacoes({ q: q });

                if (!cancel)
                    setRes1(
                        res.items.filter(
                            i => c2?.id !== i.id
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setRes1([]);
            }

            finally {
                if (!cancel)
                    setLoading1(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [q1, c1]);

    useEffect(() => {
        const q = q2.trim();

        if (!q) {
            setRes2([]);
            setLoading2(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoading2(true);

            try {
                const res = await getColigacoes({ q: q });

                if (!cancel)
                    setRes2(
                        res.items.filter(
                            i => c1?.id !== i.id
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setRes2([]);
            }

            finally {
                if (!cancel)
                    setLoading2(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [q2, c2]);

    function handleGuerra() {
        let total = 0;
        
        if (id1Guerra !== -1)
            total++;

        if (id2Guerra !== -1)
            total++;

        if (nomeGuerra !== "")
            total++;

        if (motivoGuerra !== "")
            total++

        if (total === 0)
            return 0;

        if (total === 4)
            return 1;

        return 2;
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setSubmited(true);

        if (individuos.length === 0 || regioes.length === 0)
            return;

        const guerra = {
            id1: id1Guerra,
            id2: id2Guerra,
            nome: nomeGuerra,
            motivo: motivoGuerra
        };
        
        let aux = handleGuerra();
        let hasGuerra;

        if (aux === 0)
            hasGuerra = false;

        if (aux === 1)
            hasGuerra = true;

        if (aux === 2)
            return;

        const body = {
            nome,
            nivel_ameaca: nivel,
            descricao,
            data_inicio: inicio,
            data_fim: fim,

            regioes: regioes.map(item => ({
                id: item.id
            })),

            individuos: individuos.map(item => ({
                id: item.id,
                papel: item.papel,
                resultado_individual: item.resultado_individual
            })),

            guerra,
            hasGuerra
        };

        try {
            const rsp = await fetch(`https://bdii-marvel.onrender.com/api/evento`, {
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

            navigate(`/evento/${res.id}`);
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

                <h1>EVENTO :: ADICIONAR</h1>
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
                                placeholder="Informe o nome do evento"
                                value={nome}
                            />
                        </div>

                        <div className="field">
                            <label>Nível de ameaça</label>
                            <select
                                onChange={(e) => setNivel(e.target.value)}
                                value={nivel}
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Global">Global</option>
                                <option value="Cósmica">Cósmica</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Descrição</label>
                            <textarea 
                                maxLength={256}
                                onChange={handleDescChange}
                                placeholder="Descreva o evento"
                                ref={descRef}
                                rows={1}
                                value={descricao}
                            />
                        </div>

                        <div className="field">
                            <label>Data de início</label>
                            <input type="date"
                                onChange={(e) => {
                                    setInicio(e.target.value);
                                }}
                                value={inicio}
                            />
                        </div>

                        <div className="field">
                            <label>Data do fim</label>
                            <input type="date"
                                onChange={(e) => {
                                    setFim(e.target.value);
                                }}
                                value={fim}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="__head">
                        <h1>Guerra correspondente</h1>
                        <button className="tilt ui"
                            onClick={() => setSGuerra(x => !x)}
                            type="button"
                        >
                            {sGuerra && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sGuerra && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sGuerra && (
                        <div className="__body">
                            <div className="field">
                                <div className="field">
                                    <label>Nome</label>
                                    <input type="text"
                                        className={submited && !nomeGuerra.trim()
                                            ? "error"
                                            : ""
                                        }
                                        maxLength={256}
                                        onChange={(e) => {
                                            setNomeGuerra(e.target.value);
                                            setSubmited(false);
                                        }}
                                        placeholder="Informe o nome da guerra"
                                        value={nomeGuerra}
                                    />
                                </div>
                            </div>

                            <div className="field">
                                <div className="field">
                                    <label>Motivo</label>
                                    <input type="text"
                                        className={submited && !motivoGuerra.trim()
                                            ? "error"
                                            : ""
                                        }
                                        maxLength={256}
                                        onChange={(e) => {
                                            setMotivoGuerra(e.target.value);
                                            setSubmited(false);
                                        }}
                                        placeholder="Informe o motivo da guerra"
                                        value={motivoGuerra}
                                    />
                                </div>
                            </div>
                            
                            <div className="field">
                                <div className="field">
                                    <label>Coligação 1</label>
                                    {id1Guerra === -1 && (
                                        <div className="add-popover__base">
                                            <input className="search"
                                                type="text"
                                                onChange={(e) => setQ1(e.target.value)}
                                                placeholder="Digite o nome da primeira coligação"
                                                value={q1}
                                            />

                                            {q1 && (
                                                <div className="add-popover">
                                                    {loading1 && (
                                                        <section className="__loading">
                                                            <CircleNotchIcon className="spin"
                                                                size={24}
                                                                weight="bold"
                                                            />
                                                        </section>
                                                    )}

                                                    {!loading1 && res1.length == 0 && (
                                                        <p className="notice">Nenhuma coligação encontrada.</p>
                                                    )} 

                                                    {!loading1 && res1.map((item) => (
                                                        <div key={item.id}>
                                                            <h1>{item.nome}</h1>

                                                            <button className="tilt neutral"
                                                                onClick={() => {
                                                                    setC1(item);
                                                                    setId1(item.id);
                                                                    setQ1("");
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
                                    {id1Guerra !== -1 && (
                                        <div className="item">
                                            <h1>{c1?.nome}</h1>

                                            <button className="tilt danger"
                                                onClick={() => {
                                                    setId1(-1);
                                                }}
                                                type="button"
                                            >
                                                <XIcon size={20} weight="bold" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="field">
                                <div className="field">
                                    <label>Coligação 2</label>
                                    {id2Guerra === -1 && (
                                        <div className="add-popover__base">
                                            <input className="search"
                                                type="text"
                                                onChange={(e) => setQ2(e.target.value)}
                                                placeholder="Digite o nome da segunda coligação"
                                                value={q2}
                                            />

                                            {q2 && (
                                                <div className="add-popover">
                                                    {loading2 && (
                                                        <section className="__loading">
                                                            <CircleNotchIcon className="spin"
                                                                size={24}
                                                                weight="bold"
                                                            />
                                                        </section>
                                                    )}

                                                    {!loading2 && res2.length == 0 && (
                                                        <p className="notice">Nenhuma coligação encontrada.</p>
                                                    )} 

                                                    {!loading2 && res2.map((item) => (
                                                        <div key={item.id}>
                                                            <h1>{item.nome}</h1>

                                                            <button className="tilt neutral"
                                                                onClick={() => {
                                                                    setC2(item);
                                                                    setId2(item.id);
                                                                    setQ2("");
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
                                    {id2Guerra !== -1 && (
                                        <div className="item">
                                            <h1>{c2?.nome}</h1>

                                            <button className="tilt danger"
                                                onClick={() => {
                                                    setId2(-1);
                                                }}
                                                type="button"
                                            >
                                                <XIcon size={20} weight="bold" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                <section>
                    <div className="__head">
                        <h1
                            className={submited && regioes.length === 0
                                ? "error"
                                : ""
                            }
                        >
                            Regiões
                        </h1>
                        <button className="tilt ui"
                            onClick={() => setSRegioes(x => !x)}
                            type="button"
                        >
                            {sRegioes && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sRegioes && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sRegioes && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQR(e.target.value)}
                                    placeholder="Digite o nome da região"
                                    value={qR}
                                />
                            </div>

                            {qR && (
                                <div className="add-popover">
                                    {loadingR && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingR && resR.length == 0 && (
                                        <p className="notice">Nenhuma região encontrada.</p>
                                    )} 

                                    {!loadingR && resR.map((item) => (
                                        <div key={item.id}>
                                            <section className="auxx">
                                                <img src={item.url_imagem} />

                                                <section>
                                                    <h1>{item.nome}</h1>
                                                    <h2>{item.tipo}, {item.realidade}</h2>
                                                </section>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addRegiao(item);
                                                    setQR("");
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

                    {sRegioes && regioes.length > 0 && regioes.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <div className="auxx">
                                    <img src={item.url_imagem} />

                                    <div>
                                        <h1>{item.nome}</h1>
                                        <h2>{item.tipo}, {item.realidade}</h2>
                                    </div>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeRegiao(item.id)}
                                    type="button"
                                >
                                    <XIcon size={20} weight="bold" />
                                </button>
                            </div>
                        </div>
                    ))}
                </section>

                <section>
                    <div className="__head">
                        <h1>Indivíduos</h1>
                        <button className="tilt ui"
                            onClick={() => setSIndividuos(x => !x)}
                            type="button"
                        >
                            {sIndividuos && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sIndividuos && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sIndividuos && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQI(e.target.value)}
                                    placeholder="Digite o nome do indivíduo"
                                    value={qI}
                                />
                            </div>

                            {qI && (
                                <div className="add-popover">
                                    {loadingI && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingI && resI.length == 0 && (
                                        <p className="notice">Nenhum indivíduo encontrado.</p>
                                    )} 

                                    {!loadingI && resI.map((item) => (
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
                                                    addInd(item);
                                                    setQI("");
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

                    {sIndividuos && individuos.length > 0 && individuos.map(item => (
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
                                    onClick={() => removeInd(item.id)}
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
                                        maxLength={128}
                                        onChange={(e) => {
                                            updateIndividuo(
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
                                <div className="field">
                                    <label>Resultado individual</label>
                                    <input type="text"
                                        className={submited && !item.resultado_individual.trim()
                                            ? "error"
                                            : ""
                                        }
                                        maxLength={128}
                                        onChange={(e) => {
                                            updateIndividuo(
                                                item.id,
                                                "resultado_individual",
                                                e.target.value
                                            );
                                            setSubmited(false);
                                        }}
                                        placeholder="Informe o resultado individual"
                                        value={item.resultado_individual}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <footer>
                    <div>
                        <CustomButton
                            Text="ADICIONAR EVENTO"
                            Theme="action"
                            type="submit"
                        />
                    </div>
                </footer>
            </form>
        </div>
    );
}