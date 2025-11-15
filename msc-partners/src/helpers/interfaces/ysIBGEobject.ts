export interface Regiao {
    id: number;
    nome: string;
    sigla: string;
  }
  
  export interface UF {
    id: number;
    nome: string;
    sigla: string;
    regiao: Regiao;
  }
  
  export interface RegiaoIntermediaria {
    id: number;
    nome: string;
    UF: UF;
  }
  
  export interface RegiaoImediata {
    id: number;
    nome: string;
    regiaoIntermediaria: RegiaoIntermediaria;
  }
  
  export interface Mesorregiao {
    id: number;
    nome: string;
  }
  
  export interface Microrregiao {
    id: number;
    nome: string;
    mesorregiao: Mesorregiao;
    regiaoImediata: RegiaoImediata;
  }
  
  export interface Municipio {
    id: number;
    nome: string;
    microrregiao: Microrregiao;
  }
  