"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConfirmacaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!pedidoId) {
      router.push("/figma");
      return;
    }

    // Verificar status do pedido
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/pedido/status?pedidoId=${pedidoId}`);
        const result = await response.json();

        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    checkStatus();
  }, [pedidoId, router]);

  if (status === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-cera-pro text-[16px] text-[#333333]">
          Verificando pedido...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
          {status === "success" ? (
            <>
              {/* Icone de Sucesso */}
              <div className="w-24 h-24 mx-auto mb-6 bg-[#009142] rounded-full flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h1 className="font-cera-pro font-bold text-[28px] lg:text-[32px] text-[#254333] mb-4">
                Pedido confirmado!
              </h1>

              <p className="font-cera-pro text-[16px] text-[#333333] mb-2">
                Obrigado pela sua compra.
              </p>

              <p className="font-cera-pro text-[14px] text-[#666666] mb-8">
                Numero do pedido: <strong>#{pedidoId}</strong>
              </p>

              <div className="bg-[#f8f3ed] rounded-[8px] p-6 mb-8">
                <p className="font-cera-pro text-[14px] text-[#333333]">
                  Voce recebera um e-mail com os detalhes do seu pedido e informacoes de rastreamento assim que for enviado.
                </p>
              </div>

              <Link
                href="/figma"
                className="inline-block w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
              >
                <span className="font-cera-pro font-bold text-[20px] text-white">
                  Voltar para a loja
                </span>
              </Link>
            </>
          ) : (
            <>
              {/* Icone de Erro */}
              <div className="w-24 h-24 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <h1 className="font-cera-pro font-bold text-[28px] lg:text-[32px] text-red-600 mb-4">
                Algo deu errado
              </h1>

              <p className="font-cera-pro text-[16px] text-[#333333] mb-8">
                Nao conseguimos confirmar seu pedido. Por favor, entre em contato com nosso suporte.
              </p>

              <Link
                href="/figma"
                className="inline-block w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
              >
                <span className="font-cera-pro font-bold text-[20px] text-white">
                  Voltar para a loja
                </span>
              </Link>
            </>
          )}
      </div>
    </div>
  );
}
