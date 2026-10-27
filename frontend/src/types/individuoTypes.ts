export interface IndividuosResponse {
    id: number;
    alinhamento: string;
    codinome: string | null;
    nivel_ameaca: string;
    nome: string;
    realidade: string;
    status: string;
    url_imagem: string;
}

export interface FiltrosIndividuosResponse {
    alinhamentos: string[];
    niveis: string[];
    realidades: string[];
    status: string[];
}