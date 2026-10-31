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

export interface RegiaoResponse {
    regiao: Regiao;
    individuos: Individuo[];
    eventos: Evento[];
}

    interface Regiao {
        id: number;
        nome: string;
        realidade: string;
        tipo: string;
        url_imagem: string;
    }

    interface Individuo {
        id: number;
        nome: string;
        realidade: string;
        nivel_ameaca: string;
        alinhamento: string;
        url_imagem: string;
        codinome?: string;
    }

    interface Evento {
        id: number;
        nome: string;
        nivel_ameaca: string;
        data_inicio?: string;
        data_fim?: string;
    }