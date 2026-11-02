import { CaretDownIcon, CaretLeftIcon, CaretUpIcon, CircleNotchIcon, PlusIcon, XIcon } from "@phosphor-icons/react";

import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import "../../components/AddPage/AddPage.css";
import "../../components/AddPage/AddPopover.css";
import { useEffect, useRef, useState } from "react";

import { getHabilidades } from "../../services/habilidadeService";
import { getEquipamentos } from "../../services/equipamentoService";
import { getEquipes } from "../../services/equipeService";
import { getRegioes } from "../../services/regiaoService";
import { getEventos } from "../../services/eventoService";
import { getIndividuos } from "../../services/individuoService"

import type { HabilidadesResponse } from "../../types/habilidadeTypes";
import type { EquipamentosResponse } from "../../types/equipamentoTypes";
import type { EquipesResponse } from "../../types/equipeTypes";
import type { RegioesResponse } from "../../types/regiaoTypes";
import type { EventosResponse } from "../../types/eventoTypes";
import type { IndividuosResponse } from "../../types/individuoTypes";
import { useNavigate } from "react-router-dom";

export default function AddIndividuoPage() {
    const navigate = useNavigate();

    const descMutanteRef = useRef<HTMLTextAreaElement>(null);

    interface Codinome {
        codinome: string;
        data_inicio?: string;
        data_fim?: string;
    }

    interface Equipe {
        id: number;
        nome: string;
        tipo: string;
        papel: string;
        data_entrada?: string;
        data_saida?: string;
    }

    interface Evento {
        id: number;
        nome: string;
        nivel_ameaca: string;
        papel: string;
        resultado_individual: string;
    }

    const [alinhamento, setAlinhamento] = useState("Herói");
    const [dataNascimento, setDataNascimento] = useState("");
    const [imagemIndividuo, setImagemIndividuo] = useState("");
    const [nivelAmeaca, setNivelAmeaca] = useState("Baixa");
    const [nome, setNome] = useState("");
    const [realidade, setRealidade] = useState("");
    const [status, setStatus] = useState("Ativo");
    
    const [humano, setHumano] = useState(false);
    const [documento, setDocumento] = useState("");
    const [pais, setPais] = useState("");

    const [mutante, setMutante] = useState(false);
    const [fator, setFator] = useState("");
    const [descricaoMutante, setDescricaoMutante] = useState("");

    const [alienigena, setAlienigena] = useState(false);
    const [especie, setEspecie] = useState("");
    const [planeta, setPlaneta] = useState("");

    const [sintetico, setSintetico] = useState(false);
    const [fabricante, setFabricante] = useState("");
    const [material, setMaterial] = useState("");

    const [codinomes, setCodinomes] = useState<Codinome[]>([]);

    const [qHab, setQHab] = useState("");
    const [resHab, setResHab] = useState<HabilidadesResponse[]>([]);
    const [habilidades, setHabilidades] = useState<HabilidadesResponse[]>([]);
    const [loadingHab, setLoadingHab] = useState(false);

    const [qEqpa, setQEqpa] = useState("");
    const [resEqpa, setResEqpa] = useState<EquipamentosResponse[]>([]);
    const [equipamentos, setEquipamentos] = useState<EquipamentosResponse[]>([]);
    const [loadingEqpa, setLoadingEqpa] = useState(false);

    const [qEqp, setQEqp] = useState("");
    const [resEqp, setResEqp] = useState<EquipesResponse[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [loadingEqp, setLoadingEqp] = useState(false);

    const [qReg, setQReg] = useState("");
    const [resReg, setResReg] = useState<RegioesResponse[]>([]);
    const [regioes, setRegioes] = useState<RegioesResponse[]>([]);
    const [loadingReg, setLoadingReg] = useState(false);

    const [qEvt, setQEvt] = useState("");
    const [resEvt, setResEvt] = useState<EventosResponse[]>([]);
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loadingEvt, setLoadingEvt] = useState(false);

    const [qAli, setQAli] = useState("");
    const [resAli, setResAli] = useState<IndividuosResponse[]>([]);
    const [aliados, setAliados] = useState<IndividuosResponse[]>([]);
    const [loadingAli, setLoadingAli] = useState(false);

    const [qIni, setQIni] = useState("");
    const [resIni, setResIni] = useState<IndividuosResponse[]>([]);
    const [inimigos, setInimigos] = useState<IndividuosResponse[]>([]);
    const [loadingIni, setLoadingIni] = useState(false);

    const [sCodinomes, setSCodinomes] = useState(false);
    const [sHabilidades, setSHabilidades] = useState(false);
    const [sEquipamentos, setSEquipamentos] = useState(false);
    const [sEquipes, setSEquipes] = useState(false);
    const [sRegioes, setSRegioes] = useState(false);
    const [sEventos, setSEventos] = useState(false);
    const [sAliados, setSAliados] = useState(false);
    const [sInimigos, setSInimigos] = useState(false);

    const [submited, setSubmited] = useState(false);

    function handleDescMutanteChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setDescricaoMutante(e.target.value);

        const textarea = descMutanteRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function addCodinome() {
        const existsEmptyForm = codinomes.some(
            codinome => !codinome.codinome.trim()
        );

        if (existsEmptyForm) return;

        setCodinomes(prev => [
            ...prev,
            {
                codinome: "",
                data_inicio: "",
                data_fim: ""
            }
        ]);
    }

    function addHabilidade(habilidade: HabilidadesResponse) {
        setHabilidades(prev => {
            if (prev.some(item => item.id === habilidade.id)) return prev;
            return [...prev, habilidade];
        });

        setResHab(prev =>
            prev.filter(item => item.id !== habilidade.id)
        );
    }

    function removeHabilidade(id: number) {
        setHabilidades(prev => prev.filter(item => item.id !== id));
    }

    function addEquipamento(equipamento: EquipamentosResponse) {
        setEquipamentos(prev => {
            if (prev.some(item => item.id === equipamento.id)) return prev;
            return [...prev, equipamento];
        });

        setResEqpa(prev =>
            prev.filter(item => item.id !== equipamento.id)
        );
    }

    function removeEquipamento(id: number) {
        setEquipamentos(prev => prev.filter(item => item.id !== id));
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
                    papel: "",
                    data_entrada: "",
                    data_saida: ""
                }
            ];
        });

        setResEqp(prev =>
            prev.filter(item => item.id !== equipe.id)
        );
    }

    function removeEquipe(id: number) {
        setEquipes(prev => prev.filter(item => item.id !== id));
    }

    function updateEquipe(
        id: number,
        campo: "papel" | "data_entrada" | "data_saida",
        valor: string
    ) {
        setEquipes(prev =>
            prev.map(equipe =>
                equipe.id === id
                    ? { ...equipe, [campo]: valor }
                    : equipe
            )
        );
    }

    function addRegiao(regiao: RegioesResponse) {
        setRegioes(prev => {
            if (prev.some(item => item.id === regiao.id)) return prev;
            return [...prev, regiao];
        });

        setResReg(prev =>
            prev.filter(item => item.id !== regiao.id)
        );
    }

    function removeRegiao(id: number) {
        setRegioes(prev => prev.filter(item => item.id !== id));
    }

    function addEvento(evento: EventosResponse) {
        setEventos(prev => {
            if (prev.some(item => item.id === evento.id)) return prev;
            return [
                ...prev,
                {
                    id: evento.id,
                    nome: evento.nome,
                    nivel_ameaca: evento.nivel_ameaca,
                    papel: "",
                    resultado_individual: ""
                }
            ];
        });

        setResEvt(prev =>
            prev.filter(item => item.id !== evento.id)
        );
    }

    function removeEvento(id: number) {
        setEventos(prev => prev.filter(item => item.id !== id));
    }

    function updateEvento(
        id: number,
        campo: "papel" | "resultado_individual",
        valor: string
    ) {
        setEventos(prev =>
            prev.map(evento =>
                evento.id === id
                    ? { ...evento, [campo]: valor }
                    : evento
            )
        );
    }

    function addAliado(aliado: IndividuosResponse) {
        setAliados(prev => {
            if (prev.some(item => item.id === aliado.id)) return prev;
            return [...prev, aliado];
        });

        setResAli(prev =>
            prev.filter(item => item.id !== aliado.id)
        );
    }

    function removeAliado(id: number) {
        setAliados(prev => prev.filter(item => item.id !== id));
    }

    function addInimigo(inimigo: IndividuosResponse) {
        setInimigos(prev => {
            if (prev.some(item => item.id === inimigo.id)) return prev;
            return [...prev, inimigo];
        });

        setResIni(prev =>
            prev.filter(item => item.id !== inimigo.id)
        );
    }

    function removeInimigo(id: number) {
        setInimigos(prev => prev.filter(item => item.id !== id));
    }

    useEffect(() => {
        const q = qHab.trim();

        if (!q) {
            setResHab([]);
            setLoadingHab(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingHab(true);

            try {
                const res = await getHabilidades({ q: q });

                if (!cancel)
                    setResHab(
                        res.items.filter(
                            hab => !habilidades.some(
                                ativa => ativa.id === hab.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResHab([]);
            }

            finally {
                if (!cancel)
                    setLoadingHab(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qHab, habilidades]);

    useEffect(() => {
        const q = qEqpa.trim();

        if (!q) {
            setResEqpa([]);
            setLoadingEqpa(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingEqpa(true);

            try {
                const res = await getEquipamentos({ q: q });

                if (!cancel)
                    setResEqpa(
                        res.items.filter(
                            eqpa => !equipamentos.some(
                                ativo => ativo.id === eqpa.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResEqpa([]);
            }

            finally {
                if (!cancel)
                    setLoadingEqpa(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qEqpa, equipamentos]);

    useEffect(() => {
        const q = qEqp.trim();

        if (!q) {
            setResEqp([]);
            setLoadingEqp(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingEqp(true);

            try {
                const res = await getEquipes({ q: q });

                if (!cancel)
                    setResEqp(
                        res.items.filter(
                            eqp => !equipes.some(
                                ativa => ativa.id === eqp.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResEqp([]);
            }

            finally {
                if (!cancel)
                    setLoadingEqp(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qEqp, equipes]);

    useEffect(() => {
        const q = qReg.trim();

        if (!q) {
            setResReg([]);
            setLoadingReg(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingReg(true);

            try {
                const res = await getRegioes({ q: q });

                if (!cancel)
                    setResReg(
                        res.items.filter(
                            reg => !regioes.some(
                                ativa => ativa.id === reg.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResReg([]);
            }

            finally {
                if (!cancel)
                    setLoadingReg(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qReg, regioes]);

    useEffect(() => {
        const q = qEvt.trim();

        if (!q) {
            setResEvt([]);
            setLoadingEvt(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingEvt(true);

            try {
                const res = await getEventos({ q: q });

                if (!cancel)
                    setResEvt(
                        res.items.filter(
                            evt => !eventos.some(
                                ativo => ativo.id === evt.id
                            )
                        )
                    );
            }

            catch (error) {
                if (!cancel)
                    setResEvt([]);
            }

            finally {
                if (!cancel)
                    setLoadingEvt(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qEvt, eventos]);

    useEffect(() => {
        const q = qAli.trim();

        if (!q) {
            setResAli([]);
            setLoadingAli(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingAli(true);

            try {
                const res = await getIndividuos({ q: q });

                if (!cancel) {
                    setResAli(
                        res.items.filter(
                            ali => !aliados.some(
                                ativo => ativo.id === ali.id
                            )
                        )
                    );

                    setResAli(
                        res.items.filter(
                            ali => !inimigos.some(
                                ativo => ativo.id === ali.id
                            )
                        )
                    );
                }
            }

            catch (error) {
                if (!cancel)
                    setResAli([]);
            }

            finally {
                if (!cancel)
                    setLoadingAli(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qAli, aliados]);

    useEffect(() => {
        const q = qIni.trim();

        if (!q) {
            setResIni([]);
            setLoadingIni(false);
            return;
        }

        let cancel = false;

        const timeout = setTimeout(async () => {
            setLoadingIni(true);

            try {
                const res = await getIndividuos({ q: q });

                if (!cancel) {
                    setResIni(
                        res.items.filter(
                            ini => !inimigos.some(
                                ativo => ativo.id === ini.id
                            )
                        )
                    );

                    setResIni(
                        res.items.filter(
                            ini => !aliados.some(
                                ativo => ativo.id === ini.id
                            )
                        )
                    );
                }
            }

            catch (error) {
                if (!cancel)
                    setResIni([]);
            }

            finally {
                if (!cancel)
                    setLoadingIni(false);
            }
        }, 300);

        return () => {
            cancel = true;
            clearTimeout(timeout);
        };
    }, [qIni, inimigos]);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        setSubmited(true);

        if (regioes.length == 0)
            return;

        const body = {
            nome,
            realidade,
            nivel_ameaca: nivelAmeaca,
            alinhamento,
            status,
            data_nascimento: dataNascimento || null,
            url_imagem: imagemIndividuo || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",

            humano,
            documento: humano ? documento : null,
            pais: humano ? pais : null,

            mutante,
            fator_gatilho: mutante ? fator : null,
            descricao_mutacao: mutante ? descricaoMutante : null,

            alienigena,
            especie: alienigena ? especie : null,
            planeta_nativo: alienigena ? planeta : null,

            sintetico,
            fabricante: sintetico ? fabricante : null,
            material: sintetico ? material : null,

            codinomes: codinomes
                .filter(item => item.codinome.trim())
                .map(item => ({
                    codinome: item.codinome,
                    data_inicio: item.data_inicio || null,
                    data_fim: item.data_fim || null
                })),

            habilidades: habilidades.map(item => ({
                id: item.id
            })),

            equipamentos: equipamentos.map(item => ({
                id: item.id
            })),

            equipes: equipes.map(item => ({
                id: item.id,
                papel: item.papel,
                data_entrada: item.data_entrada || null,
                data_saida: item.data_saida || null
            })),

            regioes: regioes.map(item => ({
                id: item.id
            })),

            eventos: eventos.map(item => ({
                id: item.id,
                papel: item.papel,
                resultado_individual: item.papel,
            })),

            aliados: aliados.map(item => ({
                id: item.id
            })),
            
            inimigos: inimigos.map(item => ({
                id: item.id
            }))
        };

        try {
            const rsp = await fetch(`https://bdii-marvel.onrender.com/api/individuo`, {
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

            navigate(`/individuo/${res.id}`);
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

                <h1>INDIVÍDUO :: ADICIONAR</h1>
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
                                placeholder="Informe o nome do indivíduo"
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
                                placeholder="Informe a realidade do indivíduo"
                                value={realidade}
                            />
                        </div>

                        <div className="field">
                            <label>Nível de ameaça</label>
                            <select
                                onChange={(e) => setNivelAmeaca(e.target.value)}
                                value={nivelAmeaca}
                            >
                                <option value="Baixa">Baixa</option>
                                <option value="Média">Média</option>
                                <option value="Alta">Alta</option>
                                <option value="Global">Global</option>
                                <option value="Cósmica">Cósmica</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Alinhamento</label>
                            <select
                                onChange={(e) => setAlinhamento(e.target.value)}
                                value={alinhamento}
                            >
                                <option value="Herói">Herói</option>
                                <option value="Anti-herói">Anti-herói</option>
                                <option value="Vilão">Vilão</option>
                                <option value="Neutro">Neutro</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Status</label>
                            <select
                                onChange={(e) => setStatus(e.target.value)}
                                value={status}
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                                <option value="Falecido">Falecido</option>
                                <option value="Desaparecido">Desaparecido</option>
                            </select>
                        </div>

                        <div className="field">
                            <label>Data de nascimento</label>
                            <input type="date" 
                                onChange={(e) => setDataNascimento(e.target.value)}
                                value={dataNascimento}
                            />
                        </div>

                        <div className="field">
                            <label>Imagem (URL)</label>
                            <input type="text"
                                onChange={(e) => setImagemIndividuo(e.target.value)}
                                placeholder="Informe a URL da imagem do indivíduo"
                                value={imagemIndividuo}
                            />
                        </div>

                        <div className="field">
                            <span>Categorias biológicas</span>
                            
                            <div className="multi">
                                <label className="check-field">
                                    <input type="checkbox" 
                                        checked={humano}
                                        onChange={() => setHumano(x => !x)}
                                    />
                                    <span className="custom-check" />
                                    <p>Humano</p>
                                </label>

                                {humano && (
                                    <div className="aux">
                                        <div className="field">
                                            <label>Documento</label>
                                            <input type="text"
                                                maxLength={128}
                                                onChange={(e) => setDocumento(e.target.value)}
                                                placeholder="Informe o documento do indivíduo"
                                                value={documento}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>País</label>
                                            <input type="text"
                                                maxLength={256}
                                                onChange={(e) => setPais(e.target.value)}
                                                placeholder="Informe o país do indivíduo"
                                                value={pais}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="multi">
                                <label className="check-field">
                                    <input type="checkbox" 
                                        checked={mutante}
                                        onChange={() => setMutante(x => !x)}
                                    />
                                    <span className="custom-check" />
                                    <p>Mutante</p>
                                </label>
                                
                                {mutante && (
                                    <div className="aux">
                                        <div className="field">
                                            <label>Fator gatilho</label>
                                            <input type="text"
                                                maxLength={128}
                                                onChange={(e) => setFator(e.target.value)}
                                                placeholder="Informe o fator gatilho do indivíduo"
                                                value={fator}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Descrição da mutação</label>
                                            <textarea 
                                                maxLength={256}
                                                onChange={handleDescMutanteChange}
                                                placeholder="Descreva a mutação do indivíduo"
                                                ref={descMutanteRef}
                                                rows={1}
                                                value={descricaoMutante}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="multi">
                                <label className="check-field">
                                    <input type="checkbox" 
                                        checked={alienigena}
                                        onChange={() => setAlienigena(x => !x)}
                                    />
                                    <span className="custom-check" />
                                    <p>Alienígena</p>
                                </label>
                                
                                {alienigena && (
                                    <div className="aux">
                                        <div className="field">
                                            <label>Espécie</label>
                                            <input type="text"
                                                maxLength={32}
                                                onChange={(e) => setEspecie(e.target.value)}
                                                placeholder="Informe a espécie do indivíduo"
                                                value={especie}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Planeta nativo</label>
                                            <input type="text" 
                                                maxLength={128}
                                                onChange={(e) => setPlaneta(e.target.value)}
                                                placeholder="Informe o planeta nativo do indivíduo"
                                                value={planeta}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="multi">
                                <label className="check-field">
                                    <input type="checkbox" 
                                        checked={sintetico}
                                        onChange={() => setSintetico(x => !x)}
                                    />
                                    <span className="custom-check" />
                                    <p>Sintético</p>
                                </label>
                                
                                {sintetico && (
                                    <div className="aux">
                                        <div className="field">
                                            <label>Fabricante</label>
                                            <input type="text" 
                                                maxLength={128}
                                                onChange={(e) => setFabricante(e.target.value)}
                                                placeholder="Informe o fabricante do indivíduo"
                                                value={fabricante}
                                            />
                                        </div>

                                        <div className="field">
                                            <label>Material</label>
                                            <input type="text"
                                                maxLength={128}
                                                onChange={(e) => setMaterial(e.target.value)}
                                                placeholder="Informe o material do indivíduo"
                                                value={material}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="__head">
                        <h1>Codinomes</h1>
                        <button className="tilt ui"
                            onClick={() => setSCodinomes(x => !x)}
                            type="button"
                        >
                            {sCodinomes && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sCodinomes && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>
                    
                    {sCodinomes && codinomes.map((codinome, i) => (
                        <div className="__body"
                            key={i}
                        >
                            <div className="field">
                                <label>Codinome</label>
                                <input type="text"
                                    className={submited && !codinome.codinome.trim()
                                        ? "error"
                                        : ""
                                    }
                                    maxLength={128}
                                    onChange={(e) => {
                                        const novo = e.target.value;

                                        setCodinomes(prev => prev.map((item, j) =>
                                            j === i
                                                ? {...item, codinome: novo}
                                                : item 
                                        ));

                                        setSubmited(false);
                                    }}
                                    placeholder="Informe o codinome"
                                    value={codinome.codinome}
                                />
                            </div>

                            <div className="field">
                                <label>Data de início de uso</label>
                                <input type="date"
                                    onChange={(e) => {
                                        const novo = e.target.value;

                                        setCodinomes(prev => prev.map((item, j) =>
                                            j === i
                                                ? {...item, data_inicio: novo}
                                                : item 
                                        ));
                                    }}
                                    value={codinome.data_inicio}
                                />
                            </div>

                            <div className="field">
                                <label>Data de fim de uso</label>
                                <input type="date"
                                    onChange={(e) => {
                                        const novo = e.target.value;

                                        setCodinomes(prev => prev.map((item, j) =>
                                            j === i
                                                ? {...item, data_fim: novo}
                                                : item 
                                        ));
                                    }}
                                    value={codinome.data_fim}
                                />
                            </div>
                        </div>
                    ))}

                    {sCodinomes && (
                        <div className="__body">
                            <div className="button-aux">
                                <CustomButton 
                                    Text="ADICIONAR CODINOME"
                                    Theme="neutral"
                                    type="button"
                                    onClick={addCodinome}
                                />
                            </div>
                        </div>
                    )}
                </section>

                <section>
                    <div className="__head">
                        <h1>Habilidades</h1>
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
                                    onChange={(e) => setQHab(e.target.value)}
                                    placeholder="Digite o nome da habilidade"
                                    value={qHab}
                                />
                            </div>
                        
                            {qHab && (
                                <div className="add-popover">
                                    {loadingHab && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingHab && resHab.length == 0 && (
                                        <p className="notice">Nenhuma habilidade encontrada.</p>
                                    )} 

                                    {!loadingHab && resHab.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.origem}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => { 
                                                    addHabilidade(item);
                                                    setQHab("");
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

                    {sHabilidades && habilidades.length > 0 && (
                        <div className="__body">
                            {habilidades.map(item => (
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
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="__head">
                        <h1>Equipamentos</h1>
                        <button className="tilt ui"
                            onClick={() => setSEquipamentos(x => !x)}
                            type="button"
                        >
                            {sEquipamentos && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sEquipamentos && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>
                    
                    {sEquipamentos && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text" 
                                    onChange={(e) => setQEqpa(e.target.value)}
                                    placeholder="Digite o nome do equipamento"
                                    value={qEqpa}
                                />
                            </div>
                        
                            {qEqpa && (
                                <div className="add-popover">
                                    {loadingEqpa && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingEqpa && resEqpa.length == 0 && (
                                        <p className="notice">Nenhum equipamento encontrado.</p>
                                    )} 

                                    {!loadingEqpa && resEqpa.map((item) => (
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
                                                    addEquipamento(item);
                                                    setQEqpa("");
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

                    {sEquipamentos && equipamentos.length > 0 && (
                        <div className="__body">
                            {equipamentos.map(item => (
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
                                        onClick={() => removeEquipamento(item.id)}
                                        type="button"
                                    > 
                                        <XIcon size={20} weight="bold" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="__head">
                        <h1>Equipes</h1>
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
                                    onChange={(e) => setQEqp(e.target.value)}
                                    placeholder="Digite o nome da equipe"
                                    value={qEqp}
                                />
                            </div>
                        
                            {qEqp && (
                                <div className="add-popover">
                                    {loadingEqp && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingEqp && resEqp.length == 0 && (
                                        <p className="notice">Nenhuma equipe encontrada.</p>
                                    )} 

                                    {!loadingEqp && resEqp.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.tipo}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addEquipe(item);
                                                    setQEqp("");
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
                                    <label>Papel</label>
                                    <input type="text"
                                        className={submited && !item.papel.trim()
                                            ? "error"
                                            : ""
                                        }
                                        maxLength={64}
                                        onChange={(e) => {
                                            updateEquipe(
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
                                    <label>Data de entrada</label>
                                    <input type="date"
                                        onChange={(e) => 
                                            updateEquipe(
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
                                            updateEquipe(
                                                item.id,
                                                "data_saida",
                                                e.target.value
                                            )
                                        }
                                        value={item.data_saida}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <section>
                    <div className="__head">
                        <h1 className={
                            submited && regioes.length == 0
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
                                    onChange={(e) => setQReg(e.target.value)}
                                    placeholder="Digite o nome da região"
                                    value={qReg}
                                />
                            </div>
                        
                            {qReg && (
                                <div className="add-popover">
                                    {loadingReg && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingReg && resReg.length == 0 && (
                                        <p className="notice">Nenhuma região encontrada.</p>
                                    )} 

                                    {!loadingReg && resReg.map((item) => (
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
                                                    setQReg("");
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

                    {sRegioes && regioes.length > 0 && (
                        <div className="__body">
                            {regioes.map(item => (
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
                            ))}
                        </div>
                    )}
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
                                    onChange={(e) => setQEvt(e.target.value)}
                                    placeholder="Digite o nome do evento"
                                    value={qEvt}
                                />
                            </div>
                        
                            {qEvt && (
                                <div className="add-popover">
                                    {loadingEvt && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingEvt && resEvt.length == 0 && (
                                        <p className="notice">Nenhum evento encontrado.</p>
                                    )} 

                                    {!loadingEvt && resEvt.map((item) => (
                                        <div key={item.id}>
                                            <section>
                                                <h1>{item.nome}</h1>
                                                <h2>{item.nivel_ameaca}</h2>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addEvento(item);
                                                    setQEvt("");
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
                                            updateEvento(
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
                                            updateEvento( 
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

                <section>
                    <div className="__head">
                        <h1>Aliados</h1>
                        <button className="tilt ui"
                            onClick={() => setSAliados(x => !x)}
                            type="button"
                        >
                            {sAliados && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sAliados && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>
                    
                    {sAliados && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text" 
                                    onChange={(e) => setQAli(e.target.value)}
                                    placeholder="Digite o nome do aliado"
                                    value={qAli}
                                />
                            </div>
                        
                            {qAli && (
                                <div className="add-popover">
                                    {loadingAli && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingAli && resAli.length == 0 && (
                                        <p className="notice">Nenhum indivíduo encontrado.</p>
                                    )} 

                                    {!loadingAli && resAli.map((item) => (
                                        <div key={item.id}>
                                            <section className="auxx">
                                                <img src={item.url_imagem} />

                                                <section>
                                                    <h1>{item.nome}</h1>
                                                    <h2>{item.codinome 
                                                            ? `${item.codinome}, `
                                                            : ""
                                                        } 
                                                        {item.realidade}
                                                    </h2>
                                                </section>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addAliado(item);
                                                    setQAli("");
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

                    {sAliados && aliados.length > 0 && (
                        <div className="__body">
                            {aliados.map(item => (
                                <div className="item" 
                                    key={item.id}
                                >
                                    <div className="auxx">
                                        <img src={item.url_imagem} />

                                        <div>
                                            <h1>{item.nome}</h1>
                                            <h2>{item.codinome 
                                                    ? `${item.codinome}, `
                                                    : ""
                                                } 
                                                {item.realidade}
                                            </h2>
                                        </div>
                                    </div>

                                    <button className="tilt danger" 
                                        onClick={() => removeAliado(item.id)}
                                        type="button"
                                    > 
                                        <XIcon size={20} weight="bold" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <div className="__head">
                        <h1>Inimigos</h1>
                        <button className="tilt ui"
                            onClick={() => setSInimigos(x => !x)}
                            type="button"
                        >
                            {sInimigos && (<CaretUpIcon size={20} weight="bold" />)}
                            {!sInimigos && (<CaretDownIcon size={20} weight="bold" />)}
                        </button>
                    </div>
                    
                    {sInimigos && (
                        <div className="add-popover__base">
                            <div className="__body">
                                <input className="search"
                                    type="text" 
                                    onChange={(e) => setQIni(e.target.value)}
                                    placeholder="Digite o nome do inimigo"
                                    value={qIni}
                                />
                            </div>
                        
                            {qIni && (
                                <div className="add-popover">
                                    {loadingIni && (
                                        <section className="__loading">
                                            <CircleNotchIcon className="spin"
                                                size={24}
                                                weight="bold"
                                            />
                                        </section>
                                    )}

                                    {!loadingIni && resIni.length == 0 && (
                                        <p className="notice">Nenhum indivíduo encontrado.</p>
                                    )} 

                                    {!loadingIni && resIni.map((item) => (
                                        <div key={item.id}>
                                            <section className="auxx">
                                                <img src={item.url_imagem} />

                                                <section>
                                                    <h1>{item.nome}</h1>
                                                    <h2>{item.codinome 
                                                            ? `${item.codinome}, `
                                                            : ""
                                                        } 
                                                        {item.realidade}
                                                    </h2>
                                                </section>
                                            </section>

                                            <button className="tilt neutral"
                                                onClick={() => {
                                                    addInimigo(item);
                                                    setQIni("");
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

                    {sInimigos && inimigos.length > 0 && (
                        <div className="__body">
                            {inimigos.map(item => (
                                <div className="item" 
                                    key={item.id}
                                >
                                    <div className="auxx">
                                        <img src={item.url_imagem} />

                                        <div>
                                            <h1>{item.nome}</h1>
                                            <h2>{item.codinome 
                                                    ? `${item.codinome}, `
                                                    : ""
                                                } 
                                                {item.realidade}
                                            </h2>
                                        </div>
                                    </div>

                                    <button className="tilt danger" 
                                        onClick={() => removeInimigo(item.id)}
                                        type="button"
                                    > 
                                        <XIcon size={20} weight="bold" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <footer>
                    <div>
                        <CustomButton 
                            Text="ADICIONAR INDIVÍDUO"
                            Theme="action"
                            type="submit"
                        />
                    </div>
                </footer>
            </form>
        </div>
    );
}