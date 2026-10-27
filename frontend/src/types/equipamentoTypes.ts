export interface EquipamentosResponse {
    id: number;
    nome: string;
    origem: string;
    tipo: string;
    url_imagem: string;
}

export interface FiltrosEquipamentosResponse {
    tipos: string[];
}