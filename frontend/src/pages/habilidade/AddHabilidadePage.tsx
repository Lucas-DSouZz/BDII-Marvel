import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { IndividuosResponse } from "../../types/individuoTypes";
import { getIndividuos } from "../../services/individuoService";
import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import { CaretDownIcon, CaretLeftIcon, CaretUpIcon, CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import type { HabilidadesResponse } from "../../types/habilidadeTypes";
import { getHabilidades } from "../../services/habilidadeService";
import type { EquipamentosResponse } from "../../types/equipamentoTypes";
import { getEquipamentos } from "../../services/equipamentoService";

export default function AddHabilidadePage() {
    const navigate = useNavigate();

    const descRef = useRef<HTMLTextAreaElement>(null);

    const [nome, setNome] = useState("");
    const [origem, setOrigem] = useState("");
    const [descricao, setDescricao] = useState("");

    const [qE, setQE] = useState("");
    const [resE, setResE] = useState<EquipamentosResponse[]>([]);
    const [equips, setEquips] = useState<EquipamentosResponse[]>([]);
    const [loadingE, setLoadingE] = useState(false);

    const [qD, setQD] = useState("");
    const [resD, setResD] = useState<HabilidadesResponse[]>([]);
    const [dependentes, setDependentes] = useState<HabilidadesResponse[]>([]);
    const [loadingD, setLoadingD] = useState(false);

    const [qR, setQR] = useState("");
    const [resR, setResR] = useState<HabilidadesResponse[]>([]);
    const [requisitos, setRequisitos] = useState<HabilidadesResponse[]>([]);
    const [loadingR, setLoadingR] = useState(false);

    const [qU, setQU] = useState("");
    const [resU, setResU] = useState<IndividuosResponse[]>([]);
    const [usuarios, setUsuarios] = useState<IndividuosResponse[]>([]);
    const [loadingU, setLoadingU] = useState(false);

    const [sEquips, setSEquips] = useState(false);
    const [sDependentes, setSDependentes] = useState(false);
    const [sRequisitos, setSRequisitos] = useState(false);
    const [sUsuarios, setSUsuarios] = useState(false);

    const [submited, setSubmited] = useState(false);

    function handleDescChange(e : React.ChangeEvent<HTMLTextAreaElement>) {
        setDescricao(e.target.value);

        const textarea = descRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function addEquip(equip: EquipamentosResponse) {
        setEquips(prev => {
            if (prev.some(item => item.id === equip.id)) return prev;

            return [...prev, equip];
        });

        setResE(prev =>
            prev.filter(item => item.id !== equip.id)
        );
    }

    function removeEquip(id: number) {
        setEquips(prev => prev.filter(item => item.id !== id));
    }

    function addDependente(hab: HabilidadesResponse) {
        setDependentes(prev => {
            if (prev.some(item => item.id === hab.id)) return prev;

            return [...prev, hab];
        });

        setResD(prev =>
            prev.filter(item => item.id !== hab.id)
        );
    }

    function removeDependente(id: number) {
        setDependentes(prev => prev.filter(item => item.id !== id));
    }

    function addRequisito(hab: HabilidadesResponse) {
        setRequisitos(prev => {
            if (prev.some(item => item.id === hab.id)) return prev;

            return [...prev, hab];
        });

        setResR(prev =>
            prev.filter(item => item.id !== hab.id)
        );
    }

    function removeRequisito(id: number) {
        setRequisitos(prev => prev.filter(item => item.id !== id));
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
                const res = await getEquipamentos({ q: q });

                if (!cancel)
                    setResE(
                        res.items.filter(
                            e => !equips.some(
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
    }, [qE, equips]);

    useEffect(() => {
        const q = qD.trim();

        if (!q) {
            setResD([]);
            setLoadingD(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingD(true);

            try {
                const res = await getHabilidades({ q: q });

                if (!cancel) {
                    setResD(
                        res.items.filter(
                            h => !dependentes.some(
                                ativa => ativa.id === h.id
                            )
                        )
                    );

                    setResD(
                        res.items.filter(
                            h => !requisitos.some(
                                ativa => ativa.id === h.id
                            )
                        )
                    );
                }
            }

            catch (error) {
                if (!cancel)
                    setResD([]);
            }

            finally {
                if (!cancel)
                    setLoadingD(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qD, dependentes]);

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
                const res = await getHabilidades({ q: q });

                if (!cancel) {
                    setResR(
                        res.items.filter(
                            h => !requisitos.some(
                                ativa => ativa.id === h.id
                            )
                        )
                    );

                    setResR(
                        res.items.filter(
                            h => !dependentes.some(
                                ativa => ativa.id === h.id
                            )
                        )
                    );
                }
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
    }, [qR, requisitos]);

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

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setSubmited(true);

        if (usuarios.length === 0)
            return;

        const body = {
            nome,
            origem,
            descricao,

            equipamentos: equips.map(item => ({
                id: item.id
            })),

            dependentes: dependentes.map(item => ({
                id: item.id
            })),

            requisitos: requisitos.map(item => ({
                id: item.id
            })),

            usuarios: usuarios.map(item => ({
                id: item.id
            }))
        };

        try {
            const rsp = await fetch("http://localhost:1629/api/habilidade", {
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

            navigate(`/habilidade/${res.id}`);
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

                <h1>HABILIDADE :: ADICIONAR</h1>
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
                                placeholder="Informe o nome da habilidade"
                                value={nome}
                            />
                        </div>

                        <div className="field">
                            <label>Origem</label>
                            <input type="text"
                                className={submited && !origem.trim()
                                    ? "error"
                                    : ""
                                }
                                maxLength={128}
                                onChange={(e) => {
                                    setOrigem(e.target.value);
                                    setSubmited(false);
                                }}
                                placeholder="Informe a origem da habilidade"
                                value={origem}
                            />
                        </div>

                        <div className="field">
                            <label>Descrição</label>
                            <textarea 
                                onChange={handleDescChange}
                                placeholder="Descreva a habilidade"
                                ref={descRef}
                                rows={1}
                                value={descricao}
                            />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="__head">
                        <h1>Equipamentos requisitos</h1>
                        <button className="tilt ui"
                            onClick={() => setSEquips(x => !x)}
                            type="button"
                        >
                            {sEquips && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sEquips && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sEquips && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQE(e.target.value)}
                                    placeholder="Digite o nome do equipamento"
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
                                        <p className="notice">Nenhum equipamento encontrado.</p>
                                    )} 

                                    {!loadingE && resE.map((item) => (
                                        <div key={item.id}>
                                            <section className="auxx">
                                                <img src={item.url_imagem} />

                                                <section>
                                                    <h1>{item.nome}</h1>
                                                    <h2>{item.tipo}</h2>
                                                </section>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addEquip(item);
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

                    {sEquips && equips.length > 0 && equips.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <div className="auxx">
                                    <img src={item.url_imagem} />

                                    <div>
                                        <h1>{item.nome}</h1>
                                        <h2>{item.tipo}</h2>
                                    </div>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeEquip(item.id)}
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
                        <h1>Habilidades requisitos</h1>
                        <button className="tilt ui"
                            onClick={() => setSRequisitos(x => !x)}
                            type="button"
                        >
                            {sRequisitos && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sRequisitos && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sRequisitos && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQR(e.target.value)}
                                    placeholder="Digite o nome da habilidade"
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
                                        <p className="notice">Nenhuma habilidade encontrada.</p>
                                    )} 

                                    {!loadingR && resR.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.origem}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addRequisito(item);
                                                    setQR("");
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

                    {sRequisitos && requisitos.length > 0 && requisitos.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <div>
                                    <h1>{item.nome}</h1>
                                    <h2>{item.origem}</h2>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeRequisito(item.id)}
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
                            onClick={() => setSDependentes(x => !x)}
                            type="button"
                        >
                            {sDependentes && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sDependentes && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>

                    {sDependentes && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text"
                                    onChange={(e) => setQD(e.target.value)}
                                    placeholder="Digite o nome da habilidade"
                                    value={qD}
                                />
                            </div>

                            {qD && (
                                <div className="add-popover">
                                    {loadingD && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingD && resD.length == 0 && (
                                        <p className="notice">Nenhuma habilidade encontrada.</p>
                                    )} 

                                    {!loadingD && resD.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.origem}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addDependente(item);
                                                    setQD("");
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

                    {sDependentes && dependentes.length > 0 && dependentes.map(item => (
                        <div className="__body">
                            <div className="item"
                                key={item.id}
                            >
                                <div>
                                    <h1>{item.nome}</h1>
                                    <h2>{item.origem}</h2>
                                </div>

                                <button className="tilt danger"
                                    onClick={() => removeDependente(item.id)}
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

                <footer>
                    <div>
                        <CustomButton
                            Text="ADICIONAR HABILIDADE"
                            Theme="action"
                            type="submit"
                        />
                    </div>
                </footer>
            </form>
        </div>
    );
}