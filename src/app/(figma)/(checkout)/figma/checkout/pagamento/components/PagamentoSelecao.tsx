"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckoutStepper } from "../../CheckoutStepper";
import { BotaoVoltar } from "./BotaoVoltar";
import { PagamentoResumo } from "./PagamentoResumo";
import { ResumoProps } from "./types";

type MetodoPagamento = "pix" | "cartao";

interface PagamentoSelecaoProps {
  valorTotal: number;
  formatPrice: (price: number) => string;
  onSelecionarPix: () => void;
  onSelecionarCartao: () => void;
  onVoltar: () => void;
  resumoProps: ResumoProps;
}

export function PagamentoSelecao({
  valorTotal,
  formatPrice,
  onSelecionarPix,
  onSelecionarCartao,
  onVoltar,
  resumoProps,
}: PagamentoSelecaoProps) {
  const [selecionado, setSelecionado] = useState<MetodoPagamento>("pix");

  const handleFinalizar = () => {
    if (selecionado === "pix") {
      onSelecionarPix();
    } else {
      onSelecionarCartao();
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <BotaoVoltar onClick={onVoltar} />

          <PagamentoResumo {...resumoProps} />

          {/* Secao de Pagamento */}
          <div className="flex flex-col gap-6 py-6">
            <div className="flex flex-col gap-4">
              <h2 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Pagamento
              </h2>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                Informe qual vai ser a forma de pagamento:
              </p>
            </div>

            {/* Opcoes de Pagamento */}
            <div className="flex flex-col gap-4">
              {/* PIX */}
              <button
                onClick={() => setSelecionado("pix")}
                className={`w-full rounded-[8px] border bg-white p-4 text-left transition-all shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)] ${
                  selecionado === "pix" ? "border-[#E7A63A]" : "border-transparent"
                }`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Image src="/icons/pix.svg" alt="Pix" width={24} height={24} />
                    <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
                      Pix {formatPrice(valorTotal)}
                    </span>
                  </div>
                  <div className="bg-[#f8f3ed] px-4 py-1 rounded flex items-center gap-1">
                    <Image src="/icons/verified.svg" alt="" width={16} height={16} />
                    <span className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#b3261e]">
                      Aprovacao imediata
                    </span>
                  </div>
                </div>
              </button>

              {/* Cartao de Credito */}
              <button
                onClick={() => setSelecionado("cartao")}
                className={`w-full rounded-[8px] border bg-white p-4 text-left transition-all shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)] ${
                  selecionado === "cartao" ? "border-[#E7A63A]" : "border-transparent"
                }`}
              >
                <div className="flex items-start gap-1">
                  <Image src="/icons/card.svg" alt="Cartao" width={24} height={24} />
                  <div className="flex flex-col gap-2">
                    <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
                      Cartao de credito {formatPrice(valorTotal)}
                    </span>
                    <span className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#333333]">
                      Ate 3x {formatPrice(valorTotal / 3)} sem juros
                    </span>
                  </div>
                </div>
              </button>
            </div>

            {/* Botao Finalizar compra */}
            <button
              onClick={handleFinalizar}
              className="w-full h-[56px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a3025] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[16px] text-white">
                Finalizar compra
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
