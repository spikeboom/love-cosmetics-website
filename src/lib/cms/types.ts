/**
 * Tipos compartilhados para a camada CMS
 * Formato normalizado que ambas as implementações (Strapi/Directus) devem retornar
 */

export interface ProdutoStrapi {
  id: number;
  documentId: string;
  nome: string;
  slug?: string;
  preco: number;
  preco_de?: number;
  bling_number?: number;
  peso_gramas?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
}

export interface CupomCms {
  codigo: string;
  multiplacar: number;
  diminuir: number;
  ativo?: boolean;
  data_expiracao?: string;
  usos_restantes?: number;
}

export interface CupomValidationResult {
  valido: boolean;
  cupom: CupomCms | null;
  erro?: string;
}
