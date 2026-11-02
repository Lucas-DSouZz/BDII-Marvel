import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { IndividuosResponse } from "../../types/individuoTypes";
import { getIndividuos } from "../../services/individuoService";
import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import { CaretDownIcon, CaretLeftIcon, CaretUpIcon, CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import type { HabilidadesResponse } from "../../types/habilidadeTypes";
import { getHabilidades } from "../../services/habilidadeService";

import { API_URL } from "../../services/apiServices";

export default function AddEquipamentoPage() {
    const navigate = useNavigate();

    const descRef = useRef<HTMLTextAreaElement>(null);

    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("");
    const [origem, setOrigem] = useState("");
    const [descricao, setDescricao] = useState("");
    const [urlImagem, setUrlImagem] = useState("");

    const [qU, setQU] = useState("");
    const [resU, setResU] = useState<IndividuosResponse[]>([]);
    const [usuarios, setUsuarios] = useState<IndividuosResponse[]>([]);
    const [loadingU, setLoadingU] = useState(false);

    const [qH, setQH] = useState("");
    const [resH, setResH] = useState<HabilidadesResponse[]>([]);
    const [habilidades, setHabilidades] = useState<HabilidadesResponse[]>([]);
    const [loadingH, setLoadingH] = useState(false);

    const [sUsuarios, setSUsuarios] = useState(false);
    const [sHabilidades, setSHabilidades] = useState(false);

    const [submited, setSubmited] = useState(false);

    function handleDescChange(e : React.ChangeEvent<HTMLTextAreaElement>) {
        setDescricao(e.target.value);

        const textarea = descRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function addUsuario(usuario: IndividuosResponse) {
        setUsuarios(prev => {
            if (prev.some(item => item.id === usuario.id)) return prev;

            return [...prev, usuario];
        });

        setResU(prev =>
            prev.filter(item => item.id !== usuario.id)
        );
    }

    function removeUsuario(id: number) {
        setUsuarios(prev => prev.filter(item => item.id !== id));
    }

    function addHabilidade(hab: HabilidadesResponse) {
        setHabilidades(prev => {
            if (prev.some(item => item.id === hab.id)) return prev;

            return [...prev, hab];
        });

        setResH(prev =>
            prev.filter(item => item.id !== hab.id)
        );
    }

    function removeHabilidade(id: number) {
        setHabilidades(prev => prev.filter(item => item.id !== id));
    }

    useEffect(() => {
        const q = qU.trim();

        if (!q) {
            setResU([]);
            setLoadingU(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingU(true);

            try {
                const res = await getIndividuos({ q: q });

                if (!cancel)
                    setResU(
                        res.items.filter(
                            u => !usuarios.some(
                                ativo => ativo.id === u.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResU([]);
            }

            finally {
                if (!cancel)
                    setLoadingU(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qU, usuarios]);

    useEffect(() => {
        const q = qH.trim();

        if (!q) {
            setResH([]);
            setLoadingH(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingH(true);

            try {
                const res = await getHabilidades({ q: q });

                if (!cancel)
                    setResH(
                        res.items.filter(
                            h => !habilidades.some(
                                ativa => ativa.id === h.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResH([]);
            }

            finally {
                if (!cancel)
                    setLoadingH(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qH, habilidades]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setSubmited(true);

        if (usuarios.length === 0)
            return;

        const body = {
            nome,
            tipo,
            origem,
            descricao,
            url_imagem: urlImagem,

            usuarios: usuarios.map(item => ({
                id: item.id
            })),

            habilidades: habilidades.map(item => ({
                id: item.id
            }))
        };

        try {
            const rsp = await fetch(`${API_URL}/api/equipamento`, {
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

            navigate(`/equipamento/${res.id}`);
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

                <h1>EQUIPAMENTO :: ADICIONAR</h1>
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
                                maxLength={64}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    setSubmited(false);
                                }}
                                placeholder="Informe o nome do equipamento"
                                value={nome}
                            />
                        </div>

                        <div className="field">
                            <label>Tipo</label>
                            <input type="text"
                                maxLength={128}
                                onChange={(e) => {
                                    setTipo(e.target.value);
                                }}
                                placeholder="Informe o tipo do equipamento"
                                value={tipo}
                            />
                        </div>

                        <div className="field">
                            <label>Origem</label>
                            <input type="text"
                                maxLength={128}
                                onChange={(e) => {
                                    setOrigem(e.target.value);
                                }}
                                placeholder="Informe a origem do equipamento"
                                value={origem}
                            />
                        </div>

                        <div className="field">
                            <label>Descrição</label>
                            <textarea 
                                onChange={handleDescChange}
                                placeholder="Descreva o equipamento"
                                ref={descRef}
                                rows={1}
                                value={descricao}
                            />
                        </div>

                        <div className="field">
                            <label>Imagem (URL)</label>
                            <input type="text"
                                onChange={(e) => {
                                    setUrlImagem(e.target.value);
                                }}
                                placeholder="Informe a URL da imaegm do equipamento"
                                value={urlImagem}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="__head">
                        <h1
                            className={submited && usuarios.length === 0
                                ? "error"
                                : ""
                            }
                        >
                            Usuários
                        </h1>
                        <button className="tilt ui"
                            onClick={() => setSUsuarios(x => !x)}
                            type="button"
                        >
                            {sUsuarios && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sUsuarios && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sUsuarios && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQU(e.target.value)}
                                    placeholder="Digite o nome do indivíduo"
                                    value={qU}
                                />
                            </div>

                            {qU && (
                                <div className="add-popover">
                                    {loadingU && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingU && resU.length == 0 && (
                                        <p className="notice">Nenhum indivíduo encontrado.</p>
                                    )} 

                                    {!loadingU && resU.map((item) => (
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
                                                    addUsuario(item);
                                                    setQU("");
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

                    {sUsuarios && usuarios.length > 0 && usuarios.map(item => (
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
                                    onClick={() => removeUsuario(item.id)}
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
                        <h1>Habilidades dependentes</h1>
                        <button className="tilt ui"
                            onClick={() => setSHabilidades(x => !x)}
                            type="button"
                        >
                            {sHabilidades && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sHabilidades && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sHabilidades && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQH(e.target.value)}
                                    placeholder="Digite o nome da habilidade"
                                    value={qH}
                                />
                            </div>

                            {qH && (
                                <div className="add-popover">
                                    {loadingH && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingH && resH.length == 0 && (
                                        <p className="notice">Nenhuma habilidade encontrada.</p>
                                    )} 

                                    {!loadingH && resH.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.origem}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addHabilidade(item);
                                                    setQH("");
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

                    {sHabilidades && habilidades.length > 0 && habilidades.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <div>
                                    <h1>{item.nome}</h1>
                                    <h2>{item.origem}</h2>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeHabilidade(item.id)}
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
                            Text="ADICIONAR EQUIPAMENTO"
                            Theme="action"
                            type="submit"
                        />
                    </div>
                </footer>
            </form>
        </div>
    );
}