"use client";

import { useEffect, useState } from "react";
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
  loading?: boolean;
  errorMessage?: string | null;
  onClearError?: () => void;
}

export function PagamentoSelecao({
  valorTotal,
  formatPrice,
  onSelecionarPix,
  onSelecionarCartao,
  onVoltar,
  resumoProps,
  loading = false,
  errorMessage = null,
  onClearError,
}: PagamentoSelecaoProps) {
  const [pulsing, setPulsing] = useState<MetodoPagamento | null>(null);

  // Resetar pulse quando loading acaba (erro ou transição)
  useEffect(() => {
    if (!loading && errorMessage) {
      setPulsing(null);
    }
  }, [loading, errorMessage]);

  const handleSelecionar = (metodo: MetodoPagamento) => {
    if (loading || pulsing) return;
    setPulsing(metodo);
    // Dispara o processamento imediatamente — o pulse roda continuamente
    if (metodo === "pix") {
      onSelecionarPix();
    } else {
      onSelecionarCartao();
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-2 lg:pt-[12px] pb-6 lg:pb-[32px]">
        <div className="flex flex-col gap-2 lg:gap-[32px] w-full max-w-[684px]">
          <BotaoVoltar onClick={onVoltar} />

          <PagamentoResumo {...resumoProps} />

          {/* Secao de Pagamento */}
          <div className="flex flex-col gap-2 pb-4">
            <div className="flex flex-col gap-2">
              <h2 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Pagamento
              </h2>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                Selecione a forma de pagamento:
              </p>
            </div>

            {errorMessage ? (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4 flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <p className="font-cera-pro font-bold text-[14px] text-red-700">
                    Erro no pagamento
                  </p>
                  <p className="font-cera-pro text-[12px] text-red-600">
                    {errorMessage}
                  </p>
                </div>
                {onClearError ? (
                  <button
                    type="button"
                    onClick={onClearError}
                    className="font-cera-pro text-[12px] text-red-700 underline"
                  >
                    Fechar
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* Opcoes de Pagamento — clique já dispara o processamento */}
            <div className="flex flex-col gap-4">
              {/* PIX */}
              <button
                onClick={() => handleSelecionar("pix")}
                disabled={loading || !!pulsing}
                className={`w-full rounded-[8px] border bg-white p-4 text-left transition-all shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)] border-transparent disabled:opacity-70 ${
                  pulsing === "pix" ? "animate-pulse-once border-[#E7A63A] !shadow-[0px_0px_0px_3px_rgba(231,166,58,0.3)]" : ""
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
                  {pulsing === "pix" && (
                    <div className="w-4 h-4 border-2 border-[#254333] border-t-transparent rounded-full animate-spin ml-auto" />
                  )}
                </div>
              </button>

              {/* Cartao de Credito */}
              <button
                onClick={() => handleSelecionar("cartao")}
                disabled={loading || !!pulsing}
                className={`w-full rounded-[8px] border bg-white p-4 text-left transition-all shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)] border-transparent disabled:opacity-70 ${
                  pulsing === "cartao" ? "animate-pulse-once border-[#E7A63A] !shadow-[0px_0px_0px_3px_rgba(231,166,58,0.3)]" : ""
                }`}
              >
                <div className="flex items-start gap-1">
                  <Image src="/icons/card.svg" alt="Cartao" width={24} height={24} />
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
                      Cartao de credito {formatPrice(valorTotal)}
                    </span>
                    <span className="font-cera-pro font-light text-[16px] lg:text-[16px] text-[#333333]">
                      Ate 3x {formatPrice(valorTotal / 3)} sem juros
                    </span>
                  </div>
                  {pulsing === "cartao" && (
                    <div className="w-4 h-4 border-2 border-[#254333] border-t-transparent rounded-full animate-spin self-center" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
