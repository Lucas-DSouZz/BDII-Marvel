export interface EquipesResponse {
    id: number;
    nome: string;
    tipo: string;
    qnt_individuo: string;
}

export interface FiltrosEquipesResponse {
    tipos: string[];
}

export interface EquipeResponse {
    equipe: Equipe;
    coligacoes: Coligacao[];
    membros: Membro[];
}

    interface Equipe {
        id: number;
        nome: string;
        tipo: string;
        descricao?: string;
        data_fundacao: string;
    }

    interface Coligacao {
        id: number;
        data_afiliacao?: string;
        nivel_influencia: string;
        nome: string;
    }

    interface Membro {
        id: number;
        papel: string;
        data_entrada?: string;
        data_saida?: string;
        nome: string;
        realidade: string;
        nivel_ameaca: string;
        status: string;
        url_imagem: string;
        codinome?: string;
    }