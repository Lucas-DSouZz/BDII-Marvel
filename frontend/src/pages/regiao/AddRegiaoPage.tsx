import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getIndividuos } from "../../services/individuoService";
import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import { CaretDownIcon, CaretLeftIcon, CaretUpIcon, CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { getEventos } from "../../services/eventoService";

import type { EventosResponse } from "../../types/eventoTypes";
import type { IndividuosResponse } from "../../types/individuoTypes";

export default function AddRegiaoPage() {
    const navigate = useNavigate();

    const [nome, setNome] = useState("");
    const [realidade, setRealidade] = useState("");
    const [tipo, setTipo] = useState("");
    const [urlImagem, setUrlImgem] = useState("");

    const [qE, setQE] = useState("");
    const [resE, setResE] = useState<EventosResponse[]>([]);
    const [eventos, setEventos] = useState<EventosResponse[]>([]);
    const [loadingE, setLoadingE] = useState(false);

    const [qI, setQI] = useState("");
    const [resI, setResI] = useState<IndividuosResponse[]>([]);
    const [individuos, setIndividuos] = useState<IndividuosResponse[]>([]);
    const [loadingI, setLoadingI] = useState(false);

    const [sEventos, setSEventos] = useState(false);
    const [sIndividuos, setSIndividuos] = useState(false);

    const [submited, setSubmited] = useState(false);

    function addEvento(evento: EventosResponse) {
        setEventos(prev => {
            if (prev.some(item => item.id === evento.id)) return prev;

            return [ ...prev, evento ];
        });

        setResE(prev =>
            prev.filter(item => item.id !== evento.id)
        );
    }

    function removeEvento(id: number) {
        setEventos(prev => prev.filter(item => item.id !== id));
    }

    function addIndividuo(individuo: IndividuosResponse) {
        setIndividuos(prev => {
            if (prev.some(item => item.id === individuo.id)) return prev;

            return [...prev, individuo];
        });

        setResI(prev =>
            prev.filter(item => item.id !== individuo.id)
        );
    }

    function removeIndividuo(id: number) {
        setIndividuos(prev => prev.filter(item => item.id !== id));
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
                const res = await getEventos({ q: q });

                if (!cancel)
                    setResE(
                        res.items.filter(
                            e => !eventos.some(
                                ativo => ativo.id === e.id
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
    }, [qE, eventos]);

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

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setSubmited(true);

        const body = {
            nome,
            realidade,
            tipo,
            url_imagem: urlImagem,

            eventos: eventos.map(item => ({
                id: item.id
            })),

            individuos: individuos.map(item => ({
                id: item.id
            }))
        };

        try {
            const rsp = await fetch(`https://bdii-marvel.onrender.com/api/regiao`, {
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

            navigate(`/regiao/${res.id}`);
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

                <h1>REGIÃO :: ADICIONAR</h1>
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
                                placeholder="Informe o nome da região"
                                value={nome}
                            />
                        </div>

                        <div className="field">
                            <label>Realidade</label>
                            <input type="text"
                                className={submited && !realidade.trim()
                                    ? "error"
                                    : ""
                                }
                                maxLength={32}
                                onChange={(e) => {
                                    setRealidade(e.target.value);
                                    setSubmited(false);
                                }}
                                placeholder="Informe a realidade da região"
                                value={realidade}
                            />
                        </div>

                        <div className="field">
                            <label>Tipo</label>
                            <input type="text"
                                className={submited && !tipo.trim()
                                    ? "error"
                                    : ""
                                }
                                maxLength={64}
                                onChange={(e) => {
                                    setTipo(e.target.value);
                                    setSubmited(false);
                                }}
                                placeholder="Informe o tipo da região"
                                value={tipo}
                            />
                        </div>

                        <div className="field">
                            <label>Imagem (URL)</label>
                            <input type="text"
                                onChange={(e) => {
                                    setUrlImgem(e.target.value);
                                }}
                                placeholder="Informe a URL da imagem da região"
                                value={urlImagem}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="__head">
                        <h1>Eventos</h1>
                        <button className="tilt ui"
                            onClick={() => setSEventos(x => !x)}
                            type="button"
                        >
                            {sEventos && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sEventos && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sEventos && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQE(e.target.value)}
                                    placeholder="Digite o nome do evento"
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
                                        <p className="notice">Nenhum evento encontrado.</p>
                                    )} 

                                    {!loadingE && resE.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.nivel_ameaca}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addEvento(item);
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

                    {sEventos && eventos.length > 0 && eventos.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <div>
                                    <h1>{item.nome}</h1>
                                    <h2>{item.nivel_ameaca}</h2>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeEvento(item.id)}
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
                                                    addIndividuo(item);
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
                                    onClick={() => removeIndividuo(item.id)}
                                    type="button"
                                >
                                    <XIcon size={20} weight="bold" />
                                </button>
                            </div>
                        </div>
                    ))}
                </section>

                <footer>
                    <div>
                        <CustomButton
                            Text="ADICIONAR REGIÃO"
                            Theme="action"
                            type="submit"
                        />
                    </div>
                </footer>
            </form>
        </div>
    );
}