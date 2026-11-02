import { Route, Routes, useNavigate } from "react-router-dom";

import FingerprintScanner from "./components/FingerprintScanner/FingerprintScanner";
import AppLayout from "./components/AppLayout/AppLayout";

import ColigacoesPage from "./pages/coligacao/ColigacoesPage";
import EquipamentosPage from "./pages/equipamento/EquipamentosPage";
import EquipesPage from "./pages/equipe/EquipesPage";
import EventosPage from "./pages/evento/EventosPage";
import HabilidadesPage from "./pages/habilidade/HabilidadesPage";
import IndividuosPage from "./pages/individuo/IndividuosPage";
import RegioesPage from "./pages/regiao/RegioesPage";

import ColigacaoPage from "./pages/coligacao/ColigacaoPage";
import EquipamentoPage from "./pages/equipamento/EquipamentoPage";
import EquipePage from "./pages/equipe/EquipePage";
import EventoPage from "./pages/evento/EventoPage";
import HabilidadePage from "./pages/habilidade/HabilidadePage";
import RegiaoPage from "./pages/regiao/RegiaoPage";
import IndividuoPage from "./pages/individuo/IndividuoPage";

import AddColigacaoPage from "./pages/coligacao/AddColigacaoPage";
import AddEquipamentoPage from "./pages/equipamento/AddEquipamentoPage";
import AddEquipePage from "./pages/equipe/AddEquipePage";
import AddEventoPage from "./pages/evento/AddEventoPage";
import AddHabilidadePage from "./pages/habilidade/AddHabilidadePage";
import AddIndividuoPage from "./pages/individuo/AddIndividuoPage";
import AddRegiaoPage from "./pages/regiao/AddRegiaoPage";

export default function App() {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={
                <FingerprintScanner 
                    onSuccess={() => navigate("/individuo")}
                />
            }/>

            <Route element={<AppLayout />}>
                <Route path="coligacao" element={<ColigacoesPage />} />
                <Route path="coligacao/adicionar" element={<AddColigacaoPage />} />
                <Route path="coligacao/:id" element={<ColigacaoPage />} />

                <Route path="equipamento" element={<EquipamentosPage />} />
                <Route path="equipamento/adicionar" element={<AddEquipamentoPage />} />
                <Route path="equipamento/:id" element={<EquipamentoPage />} />
                
                <Route path="equipe" element={<EquipesPage />} />
                <Route path="equipe/adicionar" element={<AddEquipePage />} />
                <Route path="equipe/:id" element={<EquipePage />} />

                <Route path="evento" element={<EventosPage />} />
                <Route path="evento/adicionar" element={<AddEventoPage />} />
                <Route path="evento/:id" element={<EventoPage />} />
                
                <Route path="habilidade" element={<HabilidadesPage />} />
                <Route path="habilidade/adicionar" element={<AddHabilidadePage />} />
                <Route path="habilidade/:id" element={<HabilidadePage />} />

                <Route path="individuo" element={<IndividuosPage />} />
                <Route path="individuo/adicionar" element={<AddIndividuoPage />} />
                <Route path="individuo/:id" element={<IndividuoPage />} />

                <Route path="regiao" element={<RegioesPage />} />
                <Route path="regiao/adicionar" element={<AddRegiaoPage />} />
                <Route path="regiao/:id" element={<RegiaoPage />} />
            </Route>
        </Routes>
    )
}