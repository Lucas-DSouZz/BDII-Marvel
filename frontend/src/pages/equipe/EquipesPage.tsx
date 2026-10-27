import { 
    CircleNotchIcon,
    FunnelIcon,
    MagnifyingGlassIcon, 
    PlusIcon, 
    SortAscendingIcon
} from "@phosphor-icons/react";

import { NavLink } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";

import { CustomButton, NLButton } from "../../components/Buttons/Buttons";
import { getEquipes, getFiltrosEquipes } from "../../services/equipeService";
import "../../components/ListPage/ListPage.css";
import "../../components/Popover/Popover.css";
import ListCard from "../../components/ListCard/ListCard";

import type { EquipesResponse, FiltrosEquipesResponse } from "../../types/equipeTypes";

export default function EquipesPage() {
    const [direcao, setDirecao] = useState<"ASC" | "DESC">("ASC");
    const [error, setError] = useState(false);
    const [filtrar, setFiltrar] = useState(false);
    const [filtros, setFiltros] = useState({
        fundacaoDe: "",
        fundacaoAte: "",
        tipo: ""
    });
    const [hasMore, setHasMore] = useState(true);
    const [items, setItems] = useState<EquipesResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [metadata, setMetadata] = useState<FiltrosEquipesResponse | null>(null);
    const [offset, setOffset] = useState(0);
    const [ordenar, setOrdenar] = useState(false);
    const [ordenarPor, setOrdenarPor] = useState("nome");
    const [q, setQ] = useState("");
    const [total, setTotal] = useState(0);

    const filtrarRef = useRef<HTMLDivElement>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const loadingMoreRef = useRef(false);
    const ordenarRef = useRef<HTMLDivElement>(null);
    const qRef = useRef<HTMLInputElement>(null);
    const requestIdRef = useRef(0);

    const [filtroFundacaoDe, setFiltroFundacaoDe] = useState("");
    const [filtroFundacaoAte, setFiltroFundacaoAte] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");

    const carregar = useCallback(
        async (newOffset : number, sub : boolean, requestId : number) => {
            if (!sub && loadingMoreRef.current)
                return;

            if (sub) {
                setLoading(true);
                setError(false);
            } else {
                loadingMoreRef.current = true;
                setLoadingMore(true);
            }

            try {
                const filtro : Record<string, string> = {
                    q: q,
                    ordenarPor,
                    direcao,
                    limit: "20",
                    offset: String(newOffset),

                    ...(
                        filtros.fundacaoDe
                            ? { fundacaoDe: filtros.fundacaoDe }
                            : {}
                    ),
                    ...(
                        filtros.fundacaoAte
                            ? { fundacaoAte: filtros.fundacaoAte }
                            : {}
                    ),
                    ...(
                        filtros.tipo
                            ? { tipo: filtros.tipo }
                            : {}
                    )
                };

                const res = await getEquipes(filtro);

                if (requestId !== requestIdRef.current)
                    return;

                setItems((atual) => sub
                    ? res.items
                    : [...atual, ...res.items]
                );

                setTotal(res.total);
                setOffset(newOffset + res.items.length);
                setHasMore(res.hasMore);
            }

            catch (error) {
                if (requestId === requestIdRef.current)
                    setError(true);
            }

            finally {
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                    setLoadingMore(false);
                    loadingMoreRef.current = false;
                }
            }
        },
        [q, ordenarPor, direcao, filtros]
    );

    useEffect(() => {
        const requestId = ++requestIdRef.current;

        loadingMoreRef.current = false;

        setOffset(0);
        setHasMore(true);
        setLoading(true);
        setLoadingMore(false);
        setError(false);

        const timeout = setTimeout(async () => {
            carregar(0, true, requestId);
        }, 300);

        return () => clearTimeout(timeout);
    }, [q, ordenarPor, direcao, carregar, filtros]);

    useEffect(() => {
        async function carregarFiltros() {
            try {
                const res = await getFiltrosEquipes();
                setMetadata(res);
            }

            catch (error) {
                console.error(error);
            }
        }

        carregarFiltros();
    }, []);

    useEffect(() => {
        const element = loadMoreRef.current;

        if (!element || !hasMore || loading || loadingMore || error)
            return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loadingMoreRef.current)
                    carregar(offset, false, requestIdRef.current);
            },
            { rootMargin: "300px" }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [offset, hasMore, loading, loadingMore, error, carregar]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ordenarRef.current && !ordenarRef.current.contains(
                event.target as Node
            )) {
                setOrdenar(false);
            }

            if (filtrarRef.current && !filtrarRef.current.contains(
                event.target as Node
            )) {
                setFiltrar(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="list-page">
            <header className="list-page">
                <div>
                    <h1>Equipes</h1>
                    <h2>{total}</h2>
                </div>

                <NLButton 
                    IconLeft={PlusIcon}
                    Text="ADICIONAR"
                    Theme="action"
                    To="/equipe/adicionar"
                />
            </header>

            <div className="__list medium">
                <section className="__search">
                    <div className="search-container"
                        onClick={() => qRef.current?.focus()}
                    >
                        <MagnifyingGlassIcon 
                            size={16}
                            weight="bold"
                        />

                        <input type="text" 
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Pesquisar por nome..."
                            ref={qRef}
                        />
                    </div>

                    <div className="search-actions">
                        <div className="popover__base"
                            ref={filtrarRef}
                        >
                            <CustomButton 
                                IconRight={FunnelIcon}
                                Text="FILTRAR"
                                Theme="action"
                                onClick={() => setFiltrar(atual => !atual)}
                            />

                            {filtrar && (
                                <div className="popover">
                                    <h1>FILTRAR</h1>

                                    <div>
                                        <h2>Tipo</h2>

                                        <select
                                            onChange={(e) => setFiltroTipo(e.target.value)}
                                            value={filtroTipo}
                                        >
                                            <option value="">Todos</option>

                                            {metadata?.tipos.map((data) => (
                                                <option key={data}
                                                    value={data}
                                                >
                                                    {data}
                                                </option>
                                            ))}
                                            
                                        </select>
                                    </div>

                                    <div>
                                        <h2>Data de fundação</h2>

                                        <div className="__two-inputs">
                                            <div className="field">
                                                <h3>De</h3>

                                                <input type="date" 
                                                    onChange={(e) => setFiltroFundacaoDe(e.target.value)}
                                                    value={filtroFundacaoDe}
                                                />
                                            </div>

                                            <div className="field">
                                                <h3>Até</h3>

                                                <input type="date" 
                                                    onChange={(e) => setFiltroFundacaoAte(e.target.value)}
                                                    value={filtroFundacaoAte}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="__buttons">
                                        <CustomButton 
                                            Text="LIMPAR"
                                            Theme="neutral"
                                            onClick={() => { 
                                                setFiltroFundacaoDe("");
                                                setFiltroFundacaoAte("");
                                                setFiltroTipo("");

                                                setFiltros({
                                                    fundacaoDe: "",
                                                    fundacaoAte: "",
                                                    tipo: ""
                                                });
                                            }}
                                        />

                                        <CustomButton 
                                            Text="FILTRAR"
                                            Theme="action"
                                            onClick={() => { 
                                                setFiltrar(false);
                                                setFiltros({
                                                    fundacaoDe: filtroFundacaoDe,
                                                    fundacaoAte: filtroFundacaoAte,
                                                    tipo: filtroTipo
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="popover__base"
                            ref={ordenarRef}
                        >
                            <CustomButton 
                                IconRight={SortAscendingIcon}
                                Text="ORDENAR"
                                Theme="action"
                                onClick={() => setOrdenar(atual => !atual)}
                            />

                            {ordenar && (
                                <div className="popover">
                                    <div>
                                        <h1>ORDENAR POR</h1>

                                        {[
                                            {value: "nome", label: "Nome"},
                                            {value: "tipo", label: "Tipo"},
                                            {value: "fundacao", label: "Data de fundação"},
                                            {value: "qnt_individuo", label: "Número de membros"}
                                        ].map((x) => (
                                            <label className="option"
                                                key={x.value}
                                            >
                                                <input type="radio" 
                                                    checked={ordenarPor === x.value}
                                                    name="ordenarPor"
                                                    onChange={() => setOrdenarPor(x.value)}
                                                    value={x.value}
                                                />

                                                <span className="custom-radio" />
                                                <p>{x.label}</p>
                                            </label>
                                        ))}
                                    </div>

                                    <div>
                                        <h1>DIREÇÃO</h1>

                                        {[
                                            {value: "ASC", label: "Crescente"},
                                            {value: "DESC", label: "Decrescente"}
                                        ].map((x) => (
                                            <label className="option"
                                                key={x.value}
                                            >
                                                <input type="radio" 
                                                    checked={direcao === x.value}
                                                    name="direcao"
                                                    onChange={() => setDirecao(x.value as "ASC" | "DESC")}
                                                    value={x.value}
                                                />

                                                <span className="custom-radio" />
                                                <p>{x.label}</p>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {loading 
                && !error
                && (
                    <section className="__loading">
                        <CircleNotchIcon className="spin"
                            size={24}
                            weight="bold"
                        />

                        <p>Carregando equipes...</p>
                    </section>
                )}

                {error 
                && !loading
                && (
                    <section className="__notice">
                        <h1>ERRO AO CONSULTAR</h1>
                        <p>Tente novamente mais tarde</p>
                    </section>
                )}

                {items.length === 0
                && !loading
                && !error
                && (
                    <section className="__notice">
                        <h1>NENHUM REGISTRO ENCONTRADO</h1>
                        <p>Tente alterar os termos de pesquisa</p>
                    </section>
                )}

                {items.length !== 0
                && !loading
                && !error
                && (
                    <section className="__header">
                        <h1>Equipe</h1>

                        <div className="extras">
                            <h2>Tipo</h2>
                            <h2>Nº Membros</h2>
                        </div>
                    </section>
                )}

                {items.length !== 0
                && !loading
                && !error
                && items.map((item) => (
                    <NavLink to={`/equipe/${item.id}`}
                        key={item.id}
                    >
                        <ListCard Width="medium">
                            <h1>{item.nome}</h1>

                            <div className="__section">
                                <p className={`${item.tipo}`}>
                                    {item.tipo}
                                </p>
                                <p>{item.qnt_individuo}</p>
                            </div>
                        </ListCard>
                    </NavLink>
                ))}

                <div ref={loadMoreRef} />

                <div className="__footer">
                    <p>EOF.</p>
                </div>
            </div>
        </div>
    );
}