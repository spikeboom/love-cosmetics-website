import { ResumoCompraCard } from "@/components/checkout/ResumoCompraCard";
import { ResumoProps } from "./types";

export function PagamentoResumo({
  cartArray,
  subtotal,
  freteGratis,
  valorFrete,
  descontos,
  cupons = [],
  valorTotal,
  enderecoCompleto,
  formatPrice,
  onAlterarProdutos,
  onAlterarEntrega,
}: ResumoProps) {
  return (
    <ResumoCompraCard
      mode="payment"
      cartItems={cartArray}
      frete={valorFrete}
      freteGratis={freteGratis}
      enderecoCompleto={enderecoCompleto}
      cupons={cupons}
      onAlterarProdutos={onAlterarProdutos}
      onAlterarEntrega={onAlterarEntrega}
    />
  );
}
