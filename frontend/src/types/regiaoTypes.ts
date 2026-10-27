export interface RegioesResponse {
    id: number;
    nome: string;
    qnt_evento: string;
    qnt_individuo: string;
    realidade: string;
    tipo: string;
    url_imagem: string;
}

export interface FiltrosRegioesResponse {
    realidades: string[];
    tipos: string[];
}