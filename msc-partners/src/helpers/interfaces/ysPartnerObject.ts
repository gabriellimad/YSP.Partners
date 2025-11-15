export interface Partner{
    id?: number;
    numero_contato: string;
    nome: string;
    email: string;
    data_nascimento: Date;
    idade: number
    nome_ong_pertece: string;
    data_associacao: Date;
    cidade: string;
    estado: string;
    profissao_ocupacao: string;
    tipo: string;
    origem: string;
};

export interface PartnerResponse{
    partners: Partner[];
    row_count: number
};