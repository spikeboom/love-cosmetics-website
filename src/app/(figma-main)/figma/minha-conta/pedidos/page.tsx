import { fetchProdutosForDesign } from "@/modules/produto/domain";
import { MeusPedidosClient } from "./MeusPedidosClient";

export const metadata = {
  title: "Lové Cosméticos - Meus Pedidos",
};

export default async function MeusPedidosPage() {
  const { data: produtos } = await fetchProdutosForDesign();

  return <MeusPedidosClient produtos={produtos || []} />;
}
