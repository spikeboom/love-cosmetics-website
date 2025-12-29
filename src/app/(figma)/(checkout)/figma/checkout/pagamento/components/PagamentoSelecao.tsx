"use client";

import { CheckoutStepper } from "../../CheckoutStepper";
import { PagamentoResumo } from "./PagamentoResumo";
import { ResumoProps } from "./types";

interface PagamentoSelecaoProps {
  valorTotal: number;
  formatPrice: (price: number) => string;
  onSelecionarPix: () => void;
  onSelecionarCartao: () => void;
  resumoProps: ResumoProps;
}

export function PagamentoSelecao({
  valorTotal,
  formatPrice,
  onSelecionarPix,
  onSelecionarCartao,
  resumoProps,
}: PagamentoSelecaoProps) {
  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
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
                onClick={onSelecionarPix}
                className="w-full rounded-[8px] border border-transparent shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] bg-white p-4 text-left transition-all hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.365 21.8271C12.9966 22.1955 12.5048 22.4017 11.9922 22.4017C11.4797 22.4017 10.9879 22.1955 10.6195 21.8271L6.17285 17.3804C5.80445 17.012 5.59824 16.5202 5.59824 16.0076C5.59824 15.4951 5.80445 15.0033 6.17285 14.6349L8.80635 12L6.17285 9.36555C5.80445 8.99715 5.59824 8.50535 5.59824 7.99285C5.59824 7.48035 5.80445 6.98855 6.17285 6.62015L10.6195 2.17285C10.9879 1.80445 11.4797 1.59824 11.9922 1.59824C12.5048 1.59824 12.9966 1.80445 13.365 2.17285L17.8271 6.62015C18.1955 6.98855 18.4017 7.48035 18.4017 7.99285C18.4017 8.50535 18.1955 8.99715 17.8271 9.36555L15.1936 12L17.8271 14.6349C18.1955 15.0033 18.4017 15.4951 18.4017 16.0076C18.4017 16.5202 18.1955 17.012 17.8271 17.3804L13.365 21.8271Z"
                        stroke="#32BCAD"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
                      Pix {formatPrice(valorTotal)}
                    </span>
                  </div>
                  <div className="bg-[#f8f3ed] px-4 py-1 rounded flex items-center gap-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.5 8L7.5 9L9.5 7M8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14Z"
                        stroke="#b3261e"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#b3261e]">
                      Aprovacao imediata
                    </span>
                  </div>
                </div>
              </button>

              {/* Cartao de Credito */}
              <button
                onClick={onSelecionarCartao}
                className="w-full rounded-[8px] border border-transparent shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] bg-white p-4 text-left transition-all hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]"
              >
                <div className="flex items-start gap-1">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      stroke="#666"
                      strokeWidth="1.5"
                    />
                    <path d="M2 10H22" stroke="#666" strokeWidth="1.5" />
                    <path
                      d="M6 15H10"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
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
          </div>
        </div>
      </div>
    </div>
  );
}
