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
import { getFiltrosIndividuos, getIndividuos } from "../../services/individuoService";
import "../../components/ListPage/ListPage.css";
import "../../components/Popover/Popover.css";
import ListCard from "../../components/ListCard/ListCard";

import type { FiltrosIndividuosResponse, IndividuosResponse } from "../../types/individuoTypes";

export default function IndividuosPage() {
    const [direcao, setDirecao] = useState<"ASC" | "DESC">("ASC");
    const [error, setError] = useState(false);
    const [filtrar, setFiltrar] = useState(false);
    const [filtros, setFiltros] = useState({
        alienigena: false,
        alinhamento: "",
        humano: false,
        mutante: false,
        nascimentoDe: "",
        nascimentoAte: "",
        nivelAmeaca: "",
        realidade: "",
        sintetico: false,
        status: ""
    });
    const [hasMore, setHasMore] = useState(true);
    const [items, setItems] = useState<IndividuosResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [metadata, setMetadata] = useState<FiltrosIndividuosResponse | null>(null);
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

    const [filtroAlinhamento, setFiltroAlinhamento] = useState("");
    const [filtroBio, setFIltroBio] = useState({
        alienigena: false,
        humano: false,
        mutante: false,
        sintetico: false
    })
    const [filtroNascimentoDe, setFiltroNascimentoDe] = useState("");
    const [filtroNascimentoAte, setFiltroNascimentoAte] = useState("");
    const [filtroNivelAmeaca, setFiltroNivelAmeaca] = useState("");
    const [filtroRealidade, setFiltroRealidade] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

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
                        filtros.alienigena
                            ? { alienigena: "true" }
                            : {}
                    ),
                    ...(
                        filtros.alinhamento
                            ? { alinhamento: filtros.alinhamento }
                            : {}
                    ),
                    ...(
                        filtros.humano
                            ? { humano: "true" }
                            : {}
                    ),
                    ...(
                        filtros.mutante
                            ? { mutante: "true" }
                            : {}
                    ),
                    ...(
                        filtros.nascimentoDe
                            ? { nascimentoDe: filtros.nascimentoDe }
                            : {}
                    ),
                    ...(
                        filtros.nascimentoAte
                            ? { nascimentoAte: filtros.nascimentoAte }
                            : {}
                    ),
                    ...(
                        filtros.nivelAmeaca
                            ? { nivelAmeaca: filtros.nivelAmeaca }
                            : {}
                    ),
                    ...(
                        filtros.realidade
                            ? { realidade: filtros.realidade }
                            : {}
                    ),
                    ...(
                        filtros.sintetico
                            ? { sintetico: "true" }
                            : {}
                    ),
                    ...(
                        filtros.status
                            ? { status: filtros.status }
                            : {}
                    )
                };

                const res = await getIndividuos(filtro);

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
                const res = await getFiltrosIndividuos();
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
                    <h1>Indivíduos</h1>
                    <h2>{total}</h2>
                </div>

                <NLButton 
                    IconLeft={PlusIcon}
                    Text="ADICIONAR"
                    Theme="action"
                    To="/individuo/adicionar"
                />
            </header>

            <div className="__list big">
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
                            placeholder="Pesquisar por nome ou codinome..."
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
                                        <h2>Realidade</h2>

                                        <select
                                            onChange={(e) => setFiltroRealidade(e.target.value)}
                                            value={filtroRealidade}
                                        >
                                            <option value="">Todas</option>

                                            {metadata?.realidades.map((data) => (
                                                <option key={data}
                                                    value={data}
                                                >
                                                    {data}
                                                </option>
                                            ))}
                                            
                                        </select>
                                    </div>

                                    <div>
                                        <h2>Nível de ameaça</h2>

                                        <select
                                            onChange={(e) => setFiltroNivelAmeaca(e.target.value)}
                                            value={filtroNivelAmeaca}
                                        >
                                            <option value="">Todos</option>

                                            {metadata?.niveis.map((data) => (
                                                <option key={data}
                                                    value={data}
                                                >
                                                    {data}
                                                </option>
                                            ))}
                                            
                                        </select>
                                    </div>

                                    <div>
                                        <h2>Alinhamento</h2>

                                        <select
                                            onChange={(e) => setFiltroAlinhamento(e.target.value)}
                                            value={filtroAlinhamento}
                                        >
                                            <option value="">Todos</option>

                                            {metadata?.alinhamentos.map((data) => (
                                                <option key={data}
                                                    value={data}
                                                >
                                                    {data}
                                                </option>
                                            ))}
                                            
                                        </select>
                                    </div>

                                    <div>
                                        <h2>Status</h2>

                                        <select
                                            onChange={(e) => setFiltroStatus(e.target.value)}
                                            value={filtroStatus}
                                        >
                                            <option value="">Todos</option>

                                            {metadata?.status.map((data) => (
                                                <option key={data}
                                                    value={data}
                                                >
                                                    {data}
                                                </option>
                                            ))}
                                            
                                        </select>
                                    </div>

                                    <div>
                                        <h2>Data de nascimento</h2>

                                        <div className="__two-inputs">
                                            <div className="field">
                                                <h3>De</h3>

                                                <input type="date" 
                                                    onChange={(e) => setFiltroNascimentoDe(e.target.value)}
                                                    value={filtroNascimentoDe}
                                                />
                                            </div>

                                            <div className="field">
                                                <h3>Até</h3>

                                                <input type="date" 
                                                    onChange={(e) => setFiltroNascimentoAte(e.target.value)}
                                                    value={filtroNascimentoAte}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h2>Categorias biológicas</h2>

                                        {(
                                            [
                                                ["humano", "Humano"],
                                                ["mutante", "Mutante"],
                                                ["alienigena", "Alienígena"],
                                                ["sintetico", "Sintético"]
                                            ] as const
                                        ).map(([categoria, texto]) => (
                                            <label className="option"
                                                key={categoria}
                                            >
                                                <input type="checkbox"
                                                    checked={filtroBio[categoria]}
                                                    onChange={(e) => setFIltroBio((atual) => ({...atual, [categoria]: e.target.checked})
                                                    )}
                                                />

                                                <span className="custom-check" />
                                                <p>{texto}</p>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="__buttons">
                                        <CustomButton 
                                            Text="LIMPAR"
                                            Theme="neutral"
                                            onClick={() => { 
                                                setFiltroRealidade("");
                                                setFiltroNivelAmeaca("");
                                                setFiltroAlinhamento("");
                                                setFiltroStatus("");
                                                setFiltroNascimentoDe("");
                                                setFiltroNascimentoAte("");

                                                setFIltroBio({
                                                    humano: false,
                                                    mutante: false,
                                                    alienigena: false,
                                                    sintetico: false
                                                });

                                                setFiltros({
                                                    alienigena: false,
                                                    alinhamento: "",
                                                    humano: false,
                                                    mutante: false,
                                                    nascimentoDe: "",
                                                    nascimentoAte: "",
                                                    nivelAmeaca: "",
                                                    realidade: "",
                                                    sintetico: false,
                                                    status: ""
                                                });
                                            }}
                                        />

                                        <CustomButton 
                                            Text="FILTRAR"
                                            Theme="action"
                                            onClick={() => { 
                                                setFiltrar(false);
                                                setFiltros({
                                                    alinhamento: filtroAlinhamento,
                                                    nascimentoDe: filtroNascimentoDe,
                                                    nascimentoAte: filtroNascimentoAte,
                                                    nivelAmeaca: filtroNivelAmeaca,
                                                    realidade: filtroRealidade,
                                                    status: filtroStatus,
                                                    ...filtroBio
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
                                            {value: "codinome", label: "Codinome"},
                                            {value: "realidade", label: "Realidade"},
                                            {value: "nivel_ameaca", label: "Nível de ameaça"},
                                            {value: "alinhamento", label: "Alinhamento"},
                                            {value: "status", label: "Status"},
                                            {value: "nascimento", label: "Data de nascimento"}
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

                        <p>Carregando indivíduos...</p>
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
                        <h1>Indivíduo</h1>

                        <div className="extras">
                            <h2>Nível de amaça</h2>
                            <h2>Alinhamento</h2>
                            <h2>Status</h2>
                        </div>
                    </section>
                )}

                {items.length !== 0
                && !loading
                && !error
                && items.map((item) => (
                    <NavLink to={`/individuo/${item.id}`}
                        key={item.id}
                    >
                        <ListCard Width="big">
                            <div className="__section">
                                <img className="vert"
                                    src={item.url_imagem}
                                />

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

                            <div className="__section">
                                <p className={`${item.nivel_ameaca}`}>
                                    {item.nivel_ameaca}
                                </p>
                                <p className={`${item.alinhamento}`}>
                                    {item.alinhamento}
                                </p>
                                <p className={`${item.status}`}>
                                    {item.status}
                                </p>
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