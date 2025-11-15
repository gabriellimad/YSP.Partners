export interface PartnersFilter{
    id?: number;
    numero_contato: string;
    nome: string;
    email: string;
    data_nascimento_inicio: Date;
    data_nascimento_fim: Date;
    nome_ong_pertece: string;
    data_associacao_incio: Date;
    data_associacao_fim: Date
    cidade: string;
    estado: string;
    profissao_ocupacao: string;
    tipo: string;
    origem: string;
  };
  
export interface SearchPartnerFilter{
    partnerFilter: PartnersFilter;
    page: number;
    limit: number;
};
  