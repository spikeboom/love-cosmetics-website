import { fetchProdutosForDesign } from "@/modules/produto/domain";
import { DetalhesPedidoClient } from "./DetalhesPedidoClient";

export const metadata = {
  title: "Lové Cosméticos - Detalhes do Pedido",
};

export default async function DetalhesPedidoPage() {
  const { data: produtos } = await fetchProdutosForDesign();

  return <DetalhesPedidoClient produtos={produtos || []} />;
}
