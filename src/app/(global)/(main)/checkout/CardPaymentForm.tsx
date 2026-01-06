"use client";

import { useState, useEffect, useRef } from "react";
import type { CardFormData } from "@/types/pagbank";
import { getPagBankPublicKey } from "@/utils/pagbank-config";

interface CardPaymentFormProps {
  pedidoId: string;
  totalAmount: number;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export default function CardPaymentForm({
  pedidoId,
  totalAmount,
  onSuccess,
  onError,
}: CardPaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [installments, setInstallments] = useState(1);
  const [publicKey, setPublicKey] = useState<string>("");
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [cardData, setCardData] = useState<CardFormData>({
    holder: "",
    number: "",
    expMonth: "",
    expYear: "",
    securityCode: "",
  });

  // Ref para armazenar o intervalId do polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar chave pública quando componente montar
  useEffect(() => {
    const key = getPagBankPublicKey();
    setPublicKey(key);

    if (!key) {
      console.error("⚠️ ATENÇÃO: Chave pública não encontrada!");
      console.error("Certifique-se de:");
      console.error("1. Ter a variável NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX no .env");
      console.error("2. Reiniciar o servidor após adicionar a variável");
      console.error("3. A variável deve começar com NEXT_PUBLIC_");
    }
  }, []);

  // Limpar intervalo de polling quando componente desmontar
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // Formatar número do cartão (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.substring(0, 19); // Limita a 16 dígitos + 3 espaços
  };

  // Formatar validade (MM/AA) - exibe só 2 dígitos do ano mas armazena 4
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      // Exibir apenas os últimos 2 dígitos do ano para o usuário
      const month = cleaned.substring(0, 2);
      const year = cleaned.substring(2);
      // Se ano tem 4 dígitos, mostrar só os últimos 2
      const displayYear = year.length === 4 ? year.substring(2) : year;
      return `${month}/${displayYear}`;
    }
    return cleaned;
  };

  // Formatar CVV (apenas números)
  const formatCVV = (value: string) => {
    return value.replace(/\D/g, "").substring(0, 4);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardData({ ...cardData, number: formatted.replace(/\s/g, "") });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");

    // Extrair mês (primeiros 2 dígitos)
    let month = value.substring(0, 2);

    // Extrair ano (próximos 2 ou 4 dígitos)
    let year = value.substring(2, 6);

    // Garantir que mês tenha padding de zeros
    if (month.length === 1 && parseInt(month) > 1) {
      month = "0" + month;
    }

    // Converter ano de 2 dígitos para 4 dígitos (PagBank requer YYYY)
    if (year.length === 2) {
      year = "20" + year;
    }

    setCardData({
      ...cardData,
      expMonth: month,
      expYear: year,
    });
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCVV(e.target.value);
    setCardData({ ...cardData, securityCode: formatted });
  };

  // Verificar status do pagamento periodicamente
  const startPaymentCheck = (orderId: string) => {
    setCheckingPayment(true);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/pagbank/webhook?orderId=${orderId}`
        );
        const result = await response.json();

        if (result.success && result.order) {
          const charge = result.order.charges?.[0];

          // Se o pagamento foi confirmado ou autorizado
          if (charge?.status === "PAID" || charge?.status === "AUTHORIZED") {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setCheckingPayment(false);
            onSuccess({
              success: true,
              status: charge.status,
              message: charge.status === "PAID"
                ? "Pagamento aprovado!"
                : "Pagamento autorizado!",
            });
          }
          // Se o pagamento foi recusado ou cancelado
          else if (charge?.status === "DECLINED" || charge?.status === "CANCELED") {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setCheckingPayment(false);
            setLoading(false);
            onError(
              charge.status === "DECLINED"
                ? "Pagamento recusado. Verifique os dados do cartão e tente novamente."
                : "Pagamento cancelado."
            );
          }
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
      }
    }, 3000); // Verificar a cada 3 segundos

    // Parar de verificar após 2 minutos
    setTimeout(() => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
        setCheckingPayment(false);
        setLoading(false);
        onError("Tempo de verificação do pagamento expirado. Por favor, verifique o status do seu pedido.");
      }
    }, 2 * 60 * 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar se o pedido já foi pago
      const statusResponse = await fetch(`/api/pedido/status?pedidoId=${pedidoId}`);
      const statusResult = await statusResponse.json();

      if (statusResult.success && statusResult.pedido.isPaid) {
        setLoading(false);
        onError("Este pedido já foi pago. Redirecionando...");
        setTimeout(() => {
          window.location.href = `/confirmacao?pedidoId=${pedidoId}`;
        }, 2000);
        return;
      }

      // Validações básicas
      if (!cardData.holder || cardData.holder.length < 3) {
        throw new Error("Nome do titular inválido");
      }

      const cardNumber = cardData.number.replace(/\s/g, "");
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        throw new Error("Número do cartão inválido");
      }

      // Validar mês (deve ter 2 dígitos)
      if (!cardData.expMonth || cardData.expMonth.length !== 2) {
        throw new Error("Mês de validade inválido (use 2 dígitos, ex: 01, 12)");
      }

      const month = parseInt(cardData.expMonth);
      if (month < 1 || month > 12) {
        throw new Error("Mês de validade inválido (deve ser entre 01 e 12)");
      }

      // Validar ano (deve ter 4 dígitos)
      if (!cardData.expYear || cardData.expYear.length !== 4) {
        throw new Error("Ano de validade inválido (use 4 dígitos, ex: 2030)");
      }

      const year = parseInt(cardData.expYear);
      const currentYear = new Date().getFullYear();
      if (year < currentYear || year > currentYear + 20) {
        throw new Error("Ano de validade inválido");
      }

      if (cardData.securityCode.length < 3 || cardData.securityCode.length > 4) {
        throw new Error("CVV inválido (deve ter 3 ou 4 dígitos)");
      }

      // Verificar se o SDK do PagBank está disponível
      if (!window.PagSeguro) {
        console.error("window.PagSeguro não está disponível");
        throw new Error(
          "SDK do PagBank não carregado. Recarregue a página e tente novamente."
        );
      }

      if (!publicKey) {
        console.error("❌ Chave pública não encontrada no estado do componente");
        throw new Error(
          "Chave pública do PagBank não configurada. Reinicie o servidor após adicionar a variável NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX no arquivo .env"
        );
      }

      console.log("Iniciando criptografia do cartão...", {
        publicKey: publicKey.substring(0, 10) + "...",
        holder: cardData.holder,
        numberLength: cardData.number.length,
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
        cvvLength: cardData.securityCode.length,
      });

      // Criptografar dados do cartão
      const encryptedResult = window.PagSeguro.encryptCard({
        publicKey: publicKey,
        holder: cardData.holder,
        number: cardData.number,
        expMonth: cardData.expMonth,
        expYear: cardData.expYear,
        securityCode: cardData.securityCode,
      });

      console.log("Resultado da criptografia:", {
        hasErrors: encryptedResult.hasErrors,
        errors: encryptedResult.errors,
        hasEncryptedCard: !!encryptedResult.encryptedCard,
      });

      if (encryptedResult.hasErrors) {
        console.error("Erros do SDK PagBank:", encryptedResult.errors);

        // Tratar erros do SDK
        const errorMessages = Array.isArray(encryptedResult.errors)
          ? encryptedResult.errors.map((err: any) => {
              if (typeof err === 'string') return err;
              if (err.message) return err.message;
              if (err.description) return err.description;
              return JSON.stringify(err);
            }).join(", ")
          : "Erro desconhecido ao processar cartão";

        throw new Error(`Erro ao processar cartão: ${errorMessages}`);
      }

      // Enviar para o backend
      const response = await fetch("/api/pagbank/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pedidoId,
          paymentMethod: "credit_card",
          encryptedCard: encryptedResult.encryptedCard,
          installments,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao processar pagamento");
      }

      // Iniciar verificação do status do pagamento
      console.log("Pagamento enviado. Iniciando verificação de status...", {
        orderId: result.orderId,
        chargeId: result.chargeId,
        initialStatus: result.status,
      });

      // Se o status inicial já é PAID ou AUTHORIZED, pode chamar onSuccess diretamente
      if (result.status === "PAID" || result.status === "AUTHORIZED") {
        setLoading(false);
        onSuccess(result);
      } else {
        // Caso contrário, iniciar polling para verificar o status
        setLoading(false);
        startPaymentCheck(result.orderId);
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      onError(
        error instanceof Error ? error.message : "Erro ao processar pagamento"
      );
    } finally {
      setLoading(false);
    }
  };

  // Calcular valor por parcela
  const installmentAmount = totalAmount / installments;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold">
          Pagamento com Cartão de Crédito
        </h3>

        {/* Alerta se chave pública não foi carregada */}
        {!publicKey && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-semibold text-red-800">⚠️ Configuração Incompleta</p>
            <p className="mt-1 text-xs text-red-700">
              A chave pública do PagBank não foi encontrada. Verifique o console para mais detalhes.
            </p>
            <p className="mt-2 text-xs text-red-600">
              Certifique-se de reiniciar o servidor após configurar o arquivo .env
            </p>
          </div>
        )}

        {/* Debug Info - Remover depois */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 rounded bg-gray-100 p-2 text-xs">
            <strong>Debug:</strong>
            {publicKey ? (
              <span className="text-green-600"> ✓ Chave pública: {publicKey.substring(0, 20)}...</span>
            ) : (
              <span className="text-red-600"> ✗ Chave pública não carregada</span>
            )}
            <br />
            Mês: {cardData.expMonth || "(vazio)"} ({cardData.expMonth?.length || 0} dígitos) |
            Ano: {cardData.expYear || "(vazio)"} ({cardData.expYear?.length || 0} dígitos)
          </div>
        )}

        {/* Número do Cartão */}
        <div className="mb-4">
          <label
            htmlFor="cardNumber"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Número do Cartão
          </label>
          <input
            type="text"
            id="cardNumber"
            value={formatCardNumber(cardData.number)}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            required
            disabled={loading}
          />
        </div>

        {/* Nome no Cartão */}
        <div className="mb-4">
          <label
            htmlFor="cardHolder"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Nome no Cartão
          </label>
          <input
            type="text"
            id="cardHolder"
            value={cardData.holder}
            onChange={(e) =>
              setCardData({ ...cardData, holder: e.target.value.toUpperCase() })
            }
            placeholder="NOME COMO ESTÁ NO CARTÃO"
            className="w-full rounded-md border border-gray-300 px-3 py-2 uppercase focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            required
            disabled={loading}
          />
        </div>

        {/* Validade e CVV */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="expiry"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Validade
            </label>
            <input
              type="text"
              id="expiry"
              value={formatExpiry(
                `${cardData.expMonth}${cardData.expYear}`
              )}
              onChange={handleExpiryChange}
              placeholder="MM/AA"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="cvv"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              value={cardData.securityCode}
              onChange={handleCVVChange}
              placeholder="123"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Parcelas */}
        <div className="mb-4">
          <label
            htmlFor="installments"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Parcelas
          </label>
          <select
            id="installments"
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
            disabled={loading}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}x de R${" "}
                {((totalAmount / 100) / num).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {num === 1 ? " à vista" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Status de Verificação */}
        {checkingPayment && (
          <div className="mb-4 rounded-md bg-blue-50 p-4 text-center">
            <div className="mb-2 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-600 border-t-transparent"></div>
            </div>
            <p className="text-sm font-medium text-blue-900">
              Verificando pagamento...
            </p>
            <p className="text-xs text-blue-700">
              Aguarde enquanto confirmamos seu pagamento com a operadora do cartão
            </p>
          </div>
        )}

        {/* Botão de Pagamento */}
        <button
          type="submit"
          disabled={loading || checkingPayment}
          className="w-full rounded-md bg-pink-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-pink-700 disabled:bg-gray-400"
        >
          {loading ? "Processando..." : checkingPayment ? "Verificando..." : "Finalizar Pagamento"}
        </button>

        {/* Informações de Segurança */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>🔒 Seus dados são criptografados e seguros</p>
          <p>Processado por PagBank - PagSeguro UOL</p>
        </div>
      </div>
    </form>
  );
}
