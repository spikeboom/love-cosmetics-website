import { fetchProdutosForDesign } from "@/modules/produto/domain";
import { CartPageClient } from "./CartPageClient";

export const metadata = {
  title: "Lové Cosméticos - Carrinho",
};

export default async function CartPage() {
  const { data: produtos } = await fetchProdutosForDesign();

  return <CartPageClient produtos={produtos || []} />;
}
