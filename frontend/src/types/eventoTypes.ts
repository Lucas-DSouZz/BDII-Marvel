export interface EventosResponse {
    id: number;
    nivel_ameaca: string;
    nome: string;
    qnt_individuo: string;
}

export interface FiltrosEventosResponse {
    niveis: string[];
}

export interface EventoResponse {
    evento: Evento;
    regioes: Regiao[];
    participantes: Participante[];
    guerra: Guerra[];
}

    interface Evento {
        id: number;
        nome: string;
        nivel_ameaca: string;
        descricao: string;
        data_inicio?: string;
        data_fim?: string;
    }

    interface Regiao {
        id: number;
        nome: string;
        realidade: string;
        tipo: string;
        url_imagem: string;
    }

    interface Participante {
        id: number;
        papel: string;
        resultado_individual: string;
        nome: string;
        realidade: string;
        alinhamento: string;
        url_imagem: string;
        codinome?: string;
    }

    interface Guerra {
        nome: string;
        motivo: string;
        id_coligacao1: number;
        nome_coligacao1: string;
        id_coligacao2: number;
        nome_coligacao2: string;
    }