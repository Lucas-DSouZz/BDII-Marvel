import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout/AppLayout";

import ColigacoesPage from "./pages/coligacao/ColigacoesPage";
import EquipamentosPage from "./pages/equipamento/EquipamentosPage";
import EquipesPage from "./pages/equipe/EquipesPage";
import EventosPage from "./pages/evento/EventosPage";
import HabilidadesPage from "./pages/habilidade/HabilidadesPage";
import IndividuosPage from "./pages/individuo/IndividuosPage";
import RegioesPage from "./pages/regiao/RegioesPage";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route path="coligacao" element={<ColigacoesPage />} />

                <Route path="equipamento" element={<EquipamentosPage />} />

                <Route path="equipe" element={<EquipesPage />} />

                <Route path="evento" element={<EventosPage />} />
                
                <Route path="habilidade" element={<HabilidadesPage />} />

                <Route path="individuo" element={<IndividuosPage />} />

                <Route path="regiao" element={<RegioesPage />} />
            </Route>
        </Routes>
    )
}