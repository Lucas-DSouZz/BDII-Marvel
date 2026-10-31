export interface ColigacoesResponse {
    id: number;
    nome: string;
    qnt_equipe: string;
}

export interface ColigacaoResponse {
    coligacao: Coligacao;
    equipes: Equipe[];
    guerras: Guerra[];
}

    interface Coligacao {
        id: number;
        nome: string;
        ideologia?: string;
        data_fundacao?: string;
    }

    interface Equipe {
        id: number;
        nome: string;
        tipo: string;
        data_afiliacao?: string;
        nivel_influencia?: string; 
    }

    interface Guerra {
        nome: string;
        id_evento_correspondente: number;
        motivo: string;
        coligacao_inimiga: string;
    }