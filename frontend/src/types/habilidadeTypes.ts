export interface HabilidadesResponse {
    id: number;
    nome: string;
    origem: string;
    qnt_individuo: string;
}

export interface HabilidadeResponse {
    habilidade: Habilidade;
    equips: Equip[];
    habs_dependentes: DepReq[];
    habs_requisitos: DepReq[];
    usuarios: Usuario[];
}

    interface Habilidade {
        id: number;
        nome: string;
        origem: string;
        descricao?: string;
    }

    interface Equip {
        id: number;
        nome: string;
        tipo?: string;
        url_imagem: string;
    }

    interface DepReq {
        id: number;
        nome: string;
        origem: string;
    }

    interface Usuario {
        id: number;
        nome: string;
        realidade: string;
        nivel_ameaca: string;
        url_imagem: string;
        codinome?: string;
    }