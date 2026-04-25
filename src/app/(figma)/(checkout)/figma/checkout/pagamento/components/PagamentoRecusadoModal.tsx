"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getDeclineInfo } from "@/lib/pagbank/decline-reasons";

interface PagamentoRecusadoModalProps {
  paymentResponse: {
    code?: string;
    message?: string;
    reference?: string;
    raw_data?: { reason_code?: string; nsu?: string; authorization_code?: string };
  } | null;
  pedidoId: string;
  onTryOtherCard: () => void;
  onUsePix: () => void;
  onClose: () => void;
}

export function PagamentoRecusadoModal({
  paymentResponse,
  pedidoId,
  onTryOtherCard,
  onUsePix,
  onClose,
}: PagamentoRecusadoModalProps) {
  const info = getDeclineInfo({
    code: paymentResponse?.code ?? null,
    message: paymentResponse?.message ?? null,
  });

  // Referencia que o cliente pode citar no SAC do banco / atendimento da loja.
  const referencia =
    paymentResponse?.reference ||
    paymentResponse?.raw_data?.nsu ||
    paymentResponse?.raw_data?.authorization_code ||
    null;

  // Portal evita que ancestrais com transform/filter/contain afetem o
  // posicionamento `fixed inset-0` do overlay.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recusa-titulo"
      // Inline style necessario porque globals.css define um override em
      // `.fixed { left: auto; right: auto }` que neutraliza o `inset-0` do Tailwind.
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="bg-white rounded-[12px] shadow-xl max-w-[480px] w-full p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0L3.16 16.25A2 2 0 005 19z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2
              id="recusa-titulo"
              className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]"
            >
              Pagamento recusado
            </h2>
            <p className="font-cera-pro text-[14px] text-[#666666] mt-1">
              {info.titulo}
            </p>
          </div>
        </div>

        <p className="font-cera-pro text-[14px] lg:text-[15px] text-[#333333] leading-relaxed">
          {info.acao}
        </p>

        {referencia ? (
          <div className="bg-[#f8f3ed] border border-[#e7d9c6] rounded-[8px] p-3">
            <p className="font-cera-pro text-[12px] text-[#666666]">
              Em caso de duvidas com seu banco, use a referencia:
            </p>
            <p className="font-cera-pro font-bold text-[14px] text-[#254333] mt-1 select-all">
              #{referencia}
            </p>
            <p className="font-cera-pro text-[11px] text-[#999999] mt-1">
              Pedido: <span className="select-all">{pedidoId}</span>
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 mt-2">
          {!info.doNotRetry || info.suggestions.includes("TRY_OTHER_CARD") ? (
            <button
              type="button"
              onClick={onTryOtherCard}
              className="w-full h-[48px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
            >
              <span className="font-cera-pro font-bold text-[16px] text-white">
                Tentar outro cartao
              </span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={onUsePix}
            className="w-full h-[48px] bg-white border border-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#f8f3ed] transition-colors"
          >
            <span className="font-cera-pro font-bold text-[16px] text-[#254333]">
              Pagar com Pix
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-[40px] flex items-center justify-center"
          >
            <span className="font-cera-pro text-[14px] text-[#666666] underline">
              Voltar e revisar pedido
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
