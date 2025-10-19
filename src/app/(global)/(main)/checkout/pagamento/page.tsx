"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import CardPaymentForm from "../CardPaymentForm";
import PixPayment from "../PixPayment";

function CheckoutPagamentoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pedidoId = searchParams.get("pedidoId");
  const totalParam = searchParams.get("total");
  const [selectedMethod, setSelectedMethod] = useState<
    "credit_card" | "pix" | null
  >(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    // Definir título da página
    document.title = "Pagamento - Love Cosmetics";

    if (!pedidoId) {
      // Se não há pedidoId, redirecionar para checkout
      router.push("/checkout");
      return;
    }

    // Converter total de string para número (em centavos)
    if (totalParam) {
      setTotalAmount(parseInt(totalParam));
    }

    // Verificar se o pedido já foi pago
    const checkPaymentStatus = async () => {
      try {
        setCheckingStatus(true);
        const response = await fetch(`/api/pedido/status?pedidoId=${pedidoId}`);
        const result = await response.json();

        if (result.success && result.pedido.isPaid) {
          setAlreadyPaid(true);
        }
      } catch (error) {
        console.error("Erro ao verificar status do pedido:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkPaymentStatus();
  }, [pedidoId, totalParam, router]);

  const handlePaymentSuccess = (result: any) => {
    console.log("Pagamento realizado com sucesso!", result);

    // Redirecionar para página de confirmação
    router.push(`/confirmacao?pedidoId=${pedidoId}`);
  };

  const handlePaymentError = (error: string) => {
    console.error("Erro no pagamento:", error);
    alert(`Erro: ${error}`);
  };

  if (!pedidoId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Pedido não encontrado
          </h1>
          <p className="mt-2 text-gray-600">
            Redirecionando para o checkout...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar loading enquanto verifica status
  if (checkingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-pink-600 border-t-transparent"></div>
          <p className="text-gray-600">Verificando status do pedido...</p>
        </div>
      </div>
    );
  }

  // Mostrar aviso se já foi pago
  if (alreadyPaid) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-lg bg-green-50 border-2 border-green-200 p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-4xl">
                ✓
              </div>
            </div>
            <h1 className="mb-4 text-2xl font-bold text-green-800">
              Este pedido já foi pago!
            </h1>
            <p className="mb-6 text-gray-700">
              O pedido #{pedidoId.slice(0, 8)} já teve seu pagamento confirmado.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => router.push(`/confirmacao?pedidoId=${pedidoId}`)}
                className="rounded-md bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700"
              >
                Ver Confirmação
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-md bg-gray-200 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Escolha a forma de pagamento
            </h1>
          <p className="mt-2 text-gray-600">
            Pedido #{pedidoId.slice(0, 8)} - Total: R${" "}
            {(totalAmount / 100).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Seleção de Método de Pagamento */}
        {!selectedMethod && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Opção Cartão de Crédito */}
            <button
              onClick={() => setSelectedMethod("credit_card")}
              className="group rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-pink-500 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-2xl">
                  💳
                </div>
                <svg
                  className="h-6 w-6 text-gray-400 transition-colors group-hover:text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Cartão de Crédito
              </h3>
              <p className="text-sm text-gray-600">
                Pague em até 12x sem juros
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Aprovação imediata
              </p>
            </button>

            {/* Opção PIX */}
            <button
              onClick={() => setSelectedMethod("pix")}
              className="group rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-teal-500 hover:shadow-lg"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-2xl">
                  🔲
                </div>
                <svg
                  className="h-6 w-6 text-gray-400 transition-colors group-hover:text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                PIX
              </h3>
              <p className="text-sm text-gray-600">
                Pagamento instantâneo via QR Code
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Aprovação em segundos
              </p>
            </button>
          </div>
        )}

        {/* Formulário de Pagamento Selecionado */}
        {selectedMethod && (
          <div className="space-y-4">
            {/* Botão para voltar */}
            <button
              onClick={() => setSelectedMethod(null)}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Voltar para seleção de método
            </button>

            {/* Componente de Pagamento */}
            {selectedMethod === "credit_card" ? (
              <CardPaymentForm
                pedidoId={pedidoId}
                totalAmount={totalAmount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <PixPayment
                pedidoId={pedidoId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        )}

        {/* Informações de Segurança */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h4 className="mb-4 text-lg font-semibold text-gray-800">
            Compra 100% Segura
          </h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div>
                <p className="font-medium text-gray-800">
                  Dados Criptografados
                </p>
                <p className="text-sm text-gray-600">
                  Suas informações são protegidas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <p className="font-medium text-gray-800">PagBank Certificado</p>
                <p className="text-sm text-gray-600">
                  Processamento seguro PagSeguro
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🛡️</div>
              <div>
                <p className="font-medium text-gray-800">Proteção ao Comprador</p>
                <p className="text-sm text-gray-600">
                  Seus dados nunca são armazenados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPagamentoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-pink-600 border-t-transparent"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <CheckoutPagamentoContent />
    </Suspense>
  );
}
