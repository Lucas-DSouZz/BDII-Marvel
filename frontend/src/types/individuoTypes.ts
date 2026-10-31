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

export interface IndividuoResponse {
    individuo: Individuo;
    equipamentos: Equipamento[];
    equipes: Equipe[];
    eventos: Evento[];
    habilidades: Habilidade[];
    regioes: Regiao[];
    aliados: Outro[];
    inimigos: Outro[];
    codinomes: Codinome[];
    humano: Humano;
    mutante: Mutante;
    alienigena: Alienigena;
    sintetico: Sintetico;
}

    interface Individuo {
        id: number;
        nome: string;
        realidade: string;
        nivel_ameaca: string;
        alinhamento: string;
        status: string;
        data_nascimento?: string;
        humano: boolean;
        mutante: boolean;
        alienigena: boolean;
        sintetico: boolean;
        url_imagem: string;
    }

    interface Equipamento {
        id: number;
        nome: string;
        tipo?: string;
        url_imagem: string;
    }

    interface Equipe {
        id: number;
        papel: string;
        data_entrada?: string;
        data_saida?: string;
        nome: string;
        tipo: string;
    }

    interface Evento {
        id: number;
        papel: string;
        resultado_individual: string;
        nome: string;
        nivel_ameaca: string;
        data_inicio?: string;
        data_fim?: string;
    }

    interface Habilidade {
        id: number;
        nome: string;
        origem: string;
    }

    interface Regiao {
        id: number;
        nome: string;
        realidade: string;
        tipo: string;
        url_imagem: string;
    }

    interface Outro {
        id: number;
        nome: string;
        realidade: string;
        nivel_ameaca: string;
        alinhamento: string;
        status: string;
        url_imagem: string;
        codinome?: string;
    }

    interface Codinome {
        codinome: string;
        data_inicio?: string;
        data_fim?: string;
    }

    interface Humano {
        documento?: string;
        pais?: string;
    }

    interface Mutante {
        fator_gatilho?: string;
        descricao_mutacao: string;
    }

    interface Alienigena {
        especie?: string;
        planeta_nativo?: string;
    }

    interface Sintetico {
        fabricante?: string;
        material?: string;
    }