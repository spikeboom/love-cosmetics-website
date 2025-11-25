"use client";

import { useState, useEffect, useRef } from "react";
import { CheckoutStepper } from "../../CheckoutStepper";
import { BotaoVoltar } from "./BotaoVoltar";
import { QRCodePlaceholder } from "./QRCodePlaceholder";
import { PagamentoResumo } from "./PagamentoResumo";
import { ResumoProps } from "./types";

const CODIGO_PIX =
  "00020101021226770014BR.GOV.BCB.PIX2555api.itau/pix/qr/v2/b90561cd-fd67-4e1e-a660-df6964a6aadd5204000053039865802BR5925SBF COMERCIO DE PRODUTOS 6009SAO PAULO62070503***63043F02";

interface PagamentoPixProps {
  valorPix: number;
  formatPrice: (price: number) => string;
  onVoltar: () => void;
  onFinalizar: () => void;
  onIrParaHome: () => void;
  resumoProps: ResumoProps;
}

export function PagamentoPix({
  valorPix,
  formatPrice,
  onVoltar,
  onFinalizar,
  onIrParaHome,
  resumoProps,
}: PagamentoPixProps) {
  const [tempoRestante, setTempoRestante] = useState(59 * 60 + 59);
  const [copiado, setCopiado] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tempoRestante > 0) {
      timerRef.current = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tempoRestante]);

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}m ${segs.toString().padStart(2, "0")}s`;
  };

  const copiarCodigoPix = async () => {
    try {
      await navigator.clipboard.writeText(CODIGO_PIX);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = CODIGO_PIX;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <BotaoVoltar onClick={onVoltar} />

          {/* Header com QR Code */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Informacoes */}
            <div className="flex flex-col gap-6 flex-1">
              <h2 className="font-cera-pro font-bold text-[24px] text-black">
                Falta pouco!
              </h2>
              <div className="font-cera-pro font-light text-[16px] text-[#111111]">
                <p>
                  Pague{" "}
                  <span className="font-bold">{formatPrice(valorPix)}</span>{" "}
                  para garantir sua compra.
                </p>
                <p>Seu codigo expira em:</p>
              </div>
              {/* Timer */}
              <div className="border border-[#d2d2d2] rounded-[24px] px-3 py-2 inline-flex items-center gap-2 w-fit">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="13" r="8" stroke="#e7a63a" strokeWidth="1.5" />
                  <path
                    d="M12 9V13L14 15"
                    stroke="#e7a63a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 3H15"
                    stroke="#e7a63a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 3V5"
                    stroke="#e7a63a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-cera-pro font-bold text-[20px] text-[#254333]">
                  {formatarTempo(tempoRestante)}
                </span>
              </div>

              {/* Instrucoes QR Code */}
              <div className="flex flex-col gap-4">
                <p className="font-cera-pro font-medium text-[16px] text-black">
                  Pagar com QR Code
                </p>
                <div className="font-cera-pro font-light text-[14px] text-black leading-relaxed">
                  <p>
                    <span className="font-bold">1.</span> Acesse o app do seu
                    banco ou de pagamentos.
                  </p>
                  <p>
                    <span className="font-bold">2.</span> Escolha pagar via Pix.
                  </p>
                  <p>
                    <span className="font-bold">3.</span> Selecione &quot;Codigo
                    QR&quot; ou &quot;QR Code&quot;.
                  </p>
                  <p>
                    <span className="font-bold">4.</span> Aponte a camera do
                    celular para o codigo.
                  </p>
                </div>
              </div>
            </div>

            <QRCodePlaceholder />
          </div>

          {/* Codigo PIX Copia e Cola */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#f3f3f3] p-4 rounded-[8px]">
              <p className="font-cera-pro font-light text-[14px] text-black text-center break-all">
                {CODIGO_PIX}
              </p>
            </div>
            <button
              onClick={copiarCodigoPix}
              className="w-full h-[64px] bg-[#254333] rounded-[8px] flex items-center justify-center gap-2 hover:bg-[#1a2e24] transition-colors"
            >
              <span className="font-cera-pro font-bold text-[24px] text-white">
                {copiado ? "Codigo copiado!" : "Copiar codigo Pix"}
              </span>
              {!copiado && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5 15V5C5 3.89543 5.89543 3 7 3H15"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Instrucoes Copia e Cola */}
          <div className="flex flex-col gap-4">
            <p className="font-cera-pro font-medium text-[16px] text-black">
              Para pagar com o codigo siga as instrucoes abaixo:
            </p>
            <div className="font-cera-pro font-light text-[14px] text-[#333333] leading-relaxed">
              <p>
                <span className="font-bold">1.</span> Copie o codigo no botao
                acima.
              </p>
              <p>
                <span className="font-bold">2.</span> Acesse o app do seu banco
                ou de pagamentos.
              </p>
              <p>
                <span className="font-bold">3.</span> Escolha pagar via Pix
                &quot;Copia e Cola&quot;.
              </p>
              <p>
                <span className="font-bold">4.</span> Cole o codigo copiado e
                realize o pagamento.
              </p>
            </div>
            <p className="font-cera-pro font-light text-[14px] text-[#333333]">
              Limites do Pix: por padrao do Banco Central, transacoes realizadas
              entre as 20h e 6h tem limite de R$1mil. Verifique os limites junto
              ao seu banco.
            </p>
          </div>

          {/* Botoes de acao */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-[32px]">
            <button
              onClick={onIrParaHome}
              className="flex-1 h-[60px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0d9] transition-colors"
            >
              <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-[#254333]">
                Ir para pagina inicial
              </span>
            </button>
            <button
              onClick={onFinalizar}
              className="flex-1 h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
            >
              <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
                Ja realizei o Pix
              </span>
            </button>
          </div>

          <PagamentoResumo {...resumoProps} />
        </div>
      </div>
    </div>
  );
}
