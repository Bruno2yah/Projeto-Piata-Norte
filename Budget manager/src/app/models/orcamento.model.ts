export interface ItemOrcamento {
  id_item?: string;
  descricao: string;
  med_largura: number;
  med_altura: number;
  med_profundidade: number;
  material_por_metro3: number;
  metro_movel3: number;
  insumos: number;
  taxa_mao_de_obra: number;
  valor: number;
}

export interface Orcamento {
  id_orcamento?: string;
  nome_projeto: string;
  data_orcamento: string;
  arquiteto?: string;
  cliente: string;
  prazo_de_entrega?: string;
  pagamento?: string;
  valor_total: number;
  status: string;
  itens: ItemOrcamento[];
}

export interface OrcamentoFormDraft {
  cliente: string;
  arquiteto: string;
  projeto: string;
  pagamento: string;
  prazo: string;
  itens: {
    nome: string;
    descricao: string;
    comprimento: string;
    altura: string;
    profundidade: string;
    madeira: string;
    insumos: string;
    maoDeObra: string;
  }[];
}