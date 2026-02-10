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
    return {
      ...p,
      cupom_applied: null,
      cupom_applied_codigo: null,
      tag_desconto_1: null,
      tag_desconto_2: null,
    };
  });

  return { data: processedToReturn };
}
