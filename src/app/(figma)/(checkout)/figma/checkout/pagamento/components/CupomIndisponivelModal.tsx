"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "@/lib/formatters";

interface CupomIndisponivelModalProps {
  cupom: string | null;
  novoTotal?: number;
  totalAtual?: number;
  onContinueWithoutCoupon: () => void;
  onClose: () => void;
}

export function CupomIndisponivelModal({
  cupom,
  novoTotal,
  totalAtual,
  onContinueWithoutCoupon,
  onClose,
}: CupomIndisponivelModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cupom-indisp-titulo"
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
        <h2
          id="cupom-indisp-titulo"
          className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#111111]"
        >
          Cupom indisponivel
        </h2>

        <p className="font-cera-pro text-[14px] text-[#333333] leading-relaxed">
          O cupom {cupom ? <strong>{cupom}</strong> : "aplicado"} esgotou enquanto
          voce tentava pagar. Quer seguir sem o desconto?
        </p>

        {typeof totalAtual === "number" && typeof novoTotal === "number" ? (
          <div className="bg-[#f8f3ed] border border-[#e7d9c6] rounded-[8px] p-3 flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <span className="font-cera-pro text-[13px] text-[#666666]">Com cupom</span>
              <span className="font-cera-pro text-[14px] line-through text-[#999999]">
                {formatPrice(totalAtual)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-cera-pro font-bold text-[14px] text-[#254333]">Sem cupom</span>
              <span className="font-cera-pro font-bold text-[16px] text-[#254333]">
                {formatPrice(novoTotal)}
              </span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 mt-2">
          <button
            type="button"
            onClick={onContinueWithoutCoupon}
            className="w-full h-[48px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
          >
            <span className="font-cera-pro font-bold text-[16px] text-white">
              Continuar sem o cupom
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-[40px] flex items-center justify-center"
          >
            <span className="font-cera-pro text-[14px] text-[#666666] underline">
              Cancelar
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
