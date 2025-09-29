// Mapeamento de produtos Strapi -> Bling IDs
export const PRODUCT_MAPPING: Record<string, number> = {
  "252": 16496689667,    // Caixa presente mais brindes
  "8": 16341911311,      // Espuma Facial
  "4": 16341911312,      // Hidratante Facial
  "280": 16341911312,    // Hidratante Facial (outro ID)
  "112": 16341911314,    // Manteiga Corporal
  "107": 16341911315,    // Máscara de Argila
  "10": 16341911316,     // Sérum Facial
  // CAIXA DE ENVIO - CORREIOS
  "shipping_box": 16362290307, // CAIXA DE ENVIO - CORREIOS
};

// ID padrão do contato no Bling (temporário)
export const DEFAULT_CONTACT_ID = 17090490270;

// Função para mapear produto do Bling (id e codigo)
export function mapProductToBling(strapiId: string | number): { id: number; codigo: string } {
  const strapiIdStr = String(strapiId);
  const blingId = PRODUCT_MAPPING[strapiIdStr];

  // Mapeamento de ID para código
  const idToCode: Record<number, string> = {
    16496689667: "01",      // Caixa presente mais brindes
    16341911311: "8",       // Espuma Facial
    16341911312: "4",       // Hidratante Facial
    16341911314: "112",     // Manteiga Corporal
    16341911315: "107",     // Máscara de Argila
    16341911316: "10",      // Sérum Facial
    16362290307: "0010",    // CAIXA DE ENVIO - CORREIOS
  };

  if (blingId) {
    return {
      id: blingId,
      codigo: idToCode[blingId] || String(blingId)
    };
  }

  // Fallback se não encontrar mapeamento
  const fallbackId = parseInt(strapiIdStr) || 0;
  return {
    id: fallbackId,
    codigo: strapiIdStr
  };
}

// Função para verificar se um produto existe no mapeamento
export function isProductMapped(strapiId: string | number): boolean {
  const strapiIdStr = String(strapiId);
  return strapiIdStr in PRODUCT_MAPPING;
}

// Função para obter todos os produtos mapeados
export function getAllMappedProducts(): Array<{ strapiId: string; blingCode: string }> {
  return Object.entries(PRODUCT_MAPPING).map(([strapiId, blingId]) => ({
    strapiId,
    blingCode: String(blingId)
  }));
}