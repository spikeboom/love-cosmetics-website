import Link from "next/link";
import { ConfirmacaoStepper } from "../ConfirmacaoStepper";
import { VerifiedIcon } from "@/components/figma-shared/icons";
import { ResumoCompraCard } from "@/components/checkout/ResumoCompraCard";
import { PedidoDetalhes } from "./types";

interface SuccessStateProps {
  pedidoDetalhes: PedidoDetalhes | null;
}

export function SuccessState({ pedidoDetalhes }: SuccessStateProps) {
  // Montar objeto pedido para o ResumoCompraCard
  const pedidoParaResumo = pedidoDetalhes ? {
    items: pedidoDetalhes.produtos.items.map(item => ({
      ...item,
      name: item.name,
      preco: item.preco,
      preco_de: item.preco_de,
      quantity: item.quantity,
      desconto_percentual: item.desconto_percentual,
      imagem: item.imagem,
    })),
    subtotal_produtos: pedidoDetalhes.produtos.subtotal,
    total_pedido: pedidoDetalhes.total,
    frete_calculado: pedidoDetalhes.entrega.valor,
    cupom_valor: pedidoDetalhes.cupom_valor,
    cupom_descricao: pedidoDetalhes.cupom_descricao,
  } : null;

  // Montar label de pagamento com parcelas
  const getMetodoPagamentoLabel = () => {
    if (!pedidoDetalhes) return undefined;
    const metodo = pedidoDetalhes.metodoPagamento;
    if (metodo === "credit_card") {
      const parcelas = pedidoDetalhes.parcelas;
      if (parcelas && parcelas > 1) return `Cartao ${parcelas}x`;
      return "Cartao";
    }
    return "Pix";
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <ConfirmacaoStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          {/* Banner de sucesso do pagamento */}
          <div className="bg-[#f8f3ed] rounded-[16px] h-[64px] p-4 flex gap-2 items-center">
            <VerifiedIcon className="w-8 h-8 shrink-0" variant="gold" />
            <div className="flex flex-col flex-1 gap-1">
              <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                Pagamento aprovado!
              </p>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                Boas noticias, seu pagamento foi confirmado!
              </p>
            </div>
          </div>

          {/* Card com resumo do pedido */}
          {pedidoParaResumo && (
            <ResumoCompraCard
              mode="order"
              pedido={pedidoParaResumo}
              frete={pedidoDetalhes?.entrega.valor ?? 0}
              freteGratis={pedidoDetalhes?.entrega.gratis}
              enderecoCompleto={pedidoDetalhes?.endereco.completo}
              cupomDescricao={pedidoDetalhes?.cupom_descricao ?? undefined}
              metodoPagamento={getMetodoPagamentoLabel()}
            />
          )}

          {/* Botoes */}
          <div className="flex gap-4">
            <Link
              href="/figma/minha-conta/pedidos"
              className="flex-1 h-[56px] lg:h-[64px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[16px] text-white">
                Ver meus pedidos
              </span>
            </Link>
            <Link
              href="/figma"
              className="flex-1 h-[56px] lg:h-[64px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0d8] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[16px] text-[#254333]">
                Ir para pagina inicial
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
