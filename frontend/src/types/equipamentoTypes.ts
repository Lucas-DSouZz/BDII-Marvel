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

export interface EquipamentoResponse {
    equipamento: Equipamento;
    dependentes: Dependente[];
    donos: Dono[];
}

    interface Equipamento {
        id: number;
        nome: string;
        tipo?: string;
        origem?: string;
        descricao?: string;
        url_imagem: string;
    }

    interface Dependente {
        id: number;
        nome: string;
        descricao?: string;
    }

    interface Dono {
        id: number;
        nome: string;
        realidade: string;
        alinhamento: string;
        status: string;
        url_imagem: string;
        codinome?: string;
    }