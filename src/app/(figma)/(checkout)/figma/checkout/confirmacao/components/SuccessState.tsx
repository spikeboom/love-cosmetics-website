import Link from "next/link";
import { ConfirmacaoStepper } from "../ConfirmacaoStepper";
import { VerifiedIcon } from "@/components/figma-shared/icons";
import { formatCurrency } from "@/lib/formatters";
import { PedidoDetalhes } from "./types";

interface SuccessStateProps {
  pedidoDetalhes: PedidoDetalhes | null;
}

export function SuccessState({ pedidoDetalhes }: SuccessStateProps) {
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
          <div className="bg-[#f8f3ed] rounded-[8px] overflow-hidden">
            {/* Produtos */}
            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                  Produtos
                </p>
                <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  {pedidoDetalhes ? formatCurrency(pedidoDetalhes.produtos.subtotal) : "-"}
                </p>
              </div>
              <div className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111]">
                {pedidoDetalhes?.produtos.nomes.map((nome, i) => (
                  <p key={i}>{nome}</p>
                ))}
              </div>
            </div>

            <div className="bg-white h-px" />

            {/* Entrega */}
            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                  Entrega
                </p>
                <p className={`font-cera-pro font-bold text-[18px] lg:text-[20px] ${pedidoDetalhes?.entrega.gratis ? "text-[#009142]" : "text-black"}`}>
                  {pedidoDetalhes?.entrega.gratis ? "Gratis" : pedidoDetalhes ? formatCurrency(pedidoDetalhes.entrega.valor) : "-"}
                </p>
              </div>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111]">
                {pedidoDetalhes?.endereco.completo}
              </p>
            </div>

            <div className="bg-white h-px" />

            {/* Descontos */}
            {(pedidoDetalhes?.descontos ?? 0) > 0 && (
              <>
                <div className="p-4 flex justify-between items-center">
                  <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                    Descontos
                  </p>
                  <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#009142]">
                    - {formatCurrency(pedidoDetalhes?.descontos ?? 0)}
                  </p>
                </div>
                <div className="bg-white h-px" />
              </>
            )}

            {/* Valor Total */}
            <div className="p-4 flex justify-between items-center">
              <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111]">
                Valor total
              </p>
              <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                {pedidoDetalhes ? formatCurrency(pedidoDetalhes.total) : "-"}
              </p>
            </div>
          </div>

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
