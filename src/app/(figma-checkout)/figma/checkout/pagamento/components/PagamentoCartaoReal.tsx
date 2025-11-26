"use client";

import { useState } from "react";
import { CheckoutStepper } from "../../CheckoutStepper";
import { BotaoVoltar } from "./BotaoVoltar";
import { usePagBankPayment } from "@/hooks/checkout";

interface PagamentoCartaoRealProps {
  pedidoId: string;
  valorTotal: number;
  formatPrice: (price: number) => string;
  onVoltar: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

type Parcelas = 1 | 2 | 3;

interface CartaoFormData {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
  parcelas: Parcelas;
}

export function PagamentoCartaoReal({
  pedidoId,
  valorTotal,
  formatPrice,
  onVoltar,
  onSuccess,
  onError,
}: PagamentoCartaoRealProps) {
  const {
    loading,
    checkingPayment,
    error: paymentError,
    publicKey,
    encryptCard,
    createCardPayment,
    startPaymentPolling,
    stopPolling,
    clearError,
  } = usePagBankPayment();

  const [cartaoData, setCartaoData] = useState<CartaoFormData>({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
    parcelas: 1,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CartaoFormData, string>>>({});

  const parcelas = [
    { valor: 1 as Parcelas, total: valorTotal },
    { valor: 2 as Parcelas, total: valorTotal / 2 },
    { valor: 3 as Parcelas, total: valorTotal / 3 },
  ];

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})\d+?$/, "$1");
  };

  const formatValidade = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})\d+?$/, "$1");
  };

  const handleChange = (field: keyof CartaoFormData, value: string | number) => {
    let formattedValue = value;

    if (field === "numero" && typeof value === "string") {
      formattedValue = formatCardNumber(value);
    } else if (field === "validade" && typeof value === "string") {
      formattedValue = formatValidade(value);
    } else if (field === "cvv" && typeof value === "string") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCartaoData((prev) => ({ ...prev, [field]: formattedValue }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    if (paymentError) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CartaoFormData, string>> = {};

    const numeroLimpo = cartaoData.numero.replace(/\s/g, "");
    if (!numeroLimpo || numeroLimpo.length < 13) {
      newErrors.numero = "Numero do cartao invalido";
    }

    if (!cartaoData.nome || cartaoData.nome.trim().length < 3) {
      newErrors.nome = "Nome obrigatorio";
    }

    if (!cartaoData.validade || cartaoData.validade.length < 5) {
      newErrors.validade = "Validade invalida";
    }

    if (!cartaoData.cvv || cartaoData.cvv.length < 3) {
      newErrors.cvv = "CVV invalido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Extrair mes e ano da validade (MM/AA)
    const [expMonth, expYearShort] = cartaoData.validade.split("/");
    const expYear = `20${expYearShort}`;

    // Criptografar cartao
    const encryptedCard = await encryptCard({
      holder: cartaoData.nome.toUpperCase(),
      number: cartaoData.numero.replace(/\s/g, ""),
      expMonth,
      expYear,
      securityCode: cartaoData.cvv,
    });

    if (!encryptedCard) {
      return; // Erro ja foi setado pelo hook
    }

    // Criar pagamento
    const result = await createCardPayment(pedidoId, encryptedCard, cartaoData.parcelas);

    if (result.success && result.orderId) {
      // Se status ja e PAID ou AUTHORIZED, sucesso imediato
      if (result.status === "PAID" || result.status === "AUTHORIZED") {
        onSuccess();
      } else {
        // Iniciar polling
        startPaymentPolling(
          result.orderId,
          () => onSuccess(),
          (err) => onError(err),
          3000, // 3 segundos
          2 * 60 * 1000 // 2 minutos
        );
      }
    } else if (result.message) {
      onError(result.message);
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="pagamento" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <BotaoVoltar onClick={onVoltar} />

          <div className="flex flex-col gap-8">
            {/* Titulo e Preview do Cartao */}
            <div className="flex flex-col gap-4">
              <h2 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Adicionar cartao de credito
              </h2>

              {/* Preview do Cartao */}
              <div className="relative w-[314px] h-[185px] bg-[#d2d2d2] rounded-[8px] flex flex-col justify-center px-3">
                <p className="font-bold text-[24px] text-[#1a1a1a] mt-8">
                  {cartaoData.numero || "**** **** **** ****"}
                </p>
                <div className="absolute bottom-8 right-8 text-center">
                  <p className="text-[7px] font-bold text-[#1a1a1a]">Valido</p>
                  <p className="text-[7px] font-bold text-[#1a1a1a]">Ate</p>
                  <p className="text-[10px] font-bold text-[#1a1a1a]">
                    {cartaoData.validade || "MM/AA"}
                  </p>
                </div>
              </div>
            </div>

            {/* Alerta se chave publica nao carregou */}
            {!publicKey && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                <p className="font-cera-pro font-bold text-[14px] text-red-600">
                  Configuracao incompleta
                </p>
                <p className="font-cera-pro text-[12px] text-red-500">
                  O sistema de pagamento nao esta disponivel no momento.
                </p>
              </div>
            )}

            {/* Erro de Pagamento */}
            {paymentError && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                <p className="font-cera-pro font-bold text-[14px] text-red-600">
                  Erro no pagamento
                </p>
                <p className="font-cera-pro text-[12px] text-red-500">{paymentError}</p>
              </div>
            )}

            {/* Numero do Cartao */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Numero do cartao
              </label>
              <input
                type="text"
                value={cartaoData.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                placeholder=""
                maxLength={19}
                disabled={loading || checkingPayment}
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.numero ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100`}
              />
              {errors.numero && (
                <span className="text-red-500 text-sm">{errors.numero}</span>
              )}
            </div>

            {/* Nome no Cartao */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Nome no cartao
              </label>
              <input
                type="text"
                value={cartaoData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder="Nome e sobrenome"
                disabled={loading || checkingPayment}
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.nome ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100 uppercase`}
              />
              {errors.nome && (
                <span className="text-red-500 text-sm">{errors.nome}</span>
              )}
            </div>

            {/* Validade e CVV */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-3 lg:gap-[16px] flex-1">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  Validade
                </label>
                <input
                  type="text"
                  value={cartaoData.validade}
                  onChange={(e) => handleChange("validade", e.target.value)}
                  placeholder="MM/AA"
                  maxLength={5}
                  disabled={loading || checkingPayment}
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.validade ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100`}
                />
                {errors.validade && (
                  <span className="text-red-500 text-sm">{errors.validade}</span>
                )}
              </div>

              <div className="flex flex-col gap-3 lg:gap-[16px] w-[120px]">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  CVV
                </label>
                <input
                  type="text"
                  value={cartaoData.cvv}
                  onChange={(e) => handleChange("cvv", e.target.value)}
                  placeholder=""
                  maxLength={4}
                  disabled={loading || checkingPayment}
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.cvv ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] disabled:bg-gray-100`}
                />
                {errors.cvv && (
                  <span className="text-red-500 text-sm">{errors.cvv}</span>
                )}
              </div>
            </div>

            {/* Parcelas */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Selecione o numero de parcelas
              </label>
              <div className="flex flex-col">
                {parcelas.map((parcela) => (
                  <label
                    key={parcela.valor}
                    className="flex items-center gap-1 h-[46px] cursor-pointer"
                  >
                    <div className="p-[11px]">
                      <input
                        type="radio"
                        name="parcelas"
                        value={parcela.valor}
                        checked={cartaoData.parcelas === parcela.valor}
                        onChange={() => handleChange("parcelas", parcela.valor)}
                        disabled={loading || checkingPayment}
                        className="w-[18px] h-[18px] cursor-pointer accent-[#254333]"
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-[6px]">
                      <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111111]">
                        {parcela.valor} x {formatPrice(parcela.total)}
                      </span>
                      {parcela.valor > 1 && (
                        <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                          sem juros
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Status de Verificacao */}
          {checkingPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-4 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-cera-pro font-bold text-[14px] text-blue-700">
                  Verificando pagamento...
                </p>
                <p className="font-cera-pro text-[12px] text-blue-600">
                  Aguarde enquanto confirmamos com a operadora
                </p>
              </div>
            </div>
          )}

          {/* Botao Finalizar Compra */}
          <button
            onClick={handleSubmit}
            disabled={loading || checkingPayment || !publicKey}
            className="w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
                {checkingPayment ? "Verificando..." : "Finalizar compra"}
              </span>
            )}
          </button>

          {/* Seguranca */}
          <div className="text-center">
            <p className="font-cera-pro text-[12px] text-[#666666]">
              Seus dados sao criptografados e seguros
            </p>
            <p className="font-cera-pro text-[12px] text-[#666666]">
              Processado por PagBank - PagSeguro UOL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
