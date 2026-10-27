import { 
    CrosshairIcon, 
    GlobeIcon, 
    LightningIcon, 
    LinkIcon, 
    MapPinAreaIcon, 
    SuitcaseSimpleIcon, 
    UserIcon, 
    UsersThreeIcon 
} from "@phosphor-icons/react";

import { NavLink, Outlet } from "react-router-dom";

import "./AppLayout.css";
import LogoBranco from "../../assets/logo-branco.svg";

export default function AppLayout() {
    return(
        <>
            <header className="layout">
                <div className="__left">
                    <img src={LogoBranco}
                        alt="Logo da SHIELD"
                    />

                    <div>
                        <h1>S.H.I.E.L.D.</h1>
                        <h2>STRATEGIC HOMELAND INTERVENTION,</h2>
                        <h2>ENFORCEMENT AND LOGISTIC DIVISION</h2>
                    </div>
                </div>

                <div className="__center">
                    <GlobeIcon 
                        size={20}
                        weight="regular"
                    />

                    <p>REDE DE INTELIGÊNCIA GLOBAL / TERRA 616</p>
                </div>

                <div className="__right">
                    <div className="profile-picture">NF</div>

                    <div>
                        <h1>Nicholas Fury</h1>
                        <h2>Administrador</h2>
                    </div>
                </div>
            </header>

            <div className="layout">
                <aside className="layout">
                    <nav>
                        <NavLink to="/individuo">
                            {({isActive}) => (
                                <>
                                    <UserIcon
                                        size={16}
                                        weight={isActive
                                            ? "bold"
                                            : "regular"
                                        }
                                    />

                                    <p>Indivíduos</p>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/equipe">
                            {({isActive}) => (
                                <>
                                    <UsersThreeIcon
                                        size={16}
                                        weight={isActive
                                            ? "bold"
                                            : "regular"
                                        }
                                    />

                                    <p>Equipes</p>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/coligacao">
                            {({isActive}) => (
                                <>
                                    <LinkIcon
                                        size={16}
                                        weight={isActive
                                            ? "bold"
                                            : "regular"
                                        }
                                    />

                                    <p>Coligações</p>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/evento">
                            {({isActive}) => (
                                <>
                                    <CrosshairIcon
                                        size={16}
                                        weight={isActive
                                            ? "bold"
                                            : "regular"
                                        }
                                    />

                                    <p>Eventos</p>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/regiao">
                            {({isActive}) => (
                                <>
                                    <MapPinAreaIcon
                                        size={16}
                                        weight={isActive
                                            ? "bold"
                                            : "regular"
                                        }
                                    />

                                    <p>Regiões</p>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/equipamento">
                            {({isActive}) => (
                                <>
                                    <SuitcaseSimpleIcon
                                        size={16}
                                        weight={isActive
                                            ? "bold"
                                            : "regular"
                                        }
                                    />

                                    <p>Equipamentos</p>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/habilidade">
                            {({isActive}) => (
                                <>
                                    <LightningIcon
                                        size={16}
                                        weight={isActive
                                            ? "bold"
                                            : "regular"
                                        }
                                    />

                                    <p>Habilidades</p>
                                </>
                            )}
                        </NavLink>
                    </nav>

                    <footer className="layout">
                        <h1>TRISKELION / MÓDULO 4</h1>
                        <h2>SYS v.5.16.29</h2>
                    </footer>
                </aside>

                <main>
                    <Outlet />
                </main>
            </div>
        </>
    );
}