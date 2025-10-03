import { processProdutos } from "@/modules/produto/domain";

// MOVIDO do context.jsx linhas 53-65
// NOTA: Adicionado 'cart' como parâmetro pois antes usava closure
export const processProdutosComOuSemCupom = (data: any, cupom: any, cart: any) => {
  const produtosNoCarrinho = Object.keys(cart);

  const novosProdutos = data.data.filter(
    (item: any) => !produtosNoCarrinho.includes(item.id.toString()),
  );

  const enviarComCupom = novosProdutos.length > 0;

  return enviarComCupom
    ? processProdutos(data, cupom)
    : processProdutos(data, "sem-cupom");
};

// MOVIDO do context.jsx linhas 107-119
export function processProdutosRevert(rawData: any) {
  rawData = Object.values(rawData.data);

  const processedToReturn = rawData?.map((p: any) => {
    const { quantity: backupQuantity, ...backupWithoutQuantity } = p?.backup || {};
    
    return {
      ...p,
      ...backupWithoutQuantity,
      backup: p?.backup,
    };
  });

  return { data: processedToReturn };
}