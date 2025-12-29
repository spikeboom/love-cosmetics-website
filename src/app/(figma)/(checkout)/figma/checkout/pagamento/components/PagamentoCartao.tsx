"use client";

import { useState } from "react";
import { CheckoutStepper } from "../../CheckoutStepper";
import { BotaoVoltar } from "./BotaoVoltar";
import { CartaoData, Parcelas } from "./types";
import { formatCardNumber, formatValidade, formatCVV } from "@/lib/formatters";

interface PagamentoCartaoProps {
  valorTotal: number;
  formatPrice: (price: number) => string;
  onVoltar: () => void;
  onFinalizar: (cartaoData: CartaoData) => void;
}

export function PagamentoCartao({
  valorTotal,
  formatPrice,
  onVoltar,
  onFinalizar,
}: PagamentoCartaoProps) {
  const [cartaoData, setCartaoData] = useState<CartaoData>({
    numero: "",
    nome: "",
    validade: "",
    cvv: "",
    parcelas: 1,
  });
  const [cartaoErrors, setCartaoErrors] = useState<
    Partial<Record<keyof CartaoData, string>>
  >({});

  const parcelas = [
    { valor: 1 as Parcelas, total: valorTotal },
    { valor: 2 as Parcelas, total: valorTotal / 2 },
    { valor: 3 as Parcelas, total: valorTotal / 3 },
  ];

  const handleCartaoChange = (
    field: keyof CartaoData,
    value: string | number
  ) => {
    let formattedValue = value;

    if (field === "numero" && typeof value === "string") {
      formattedValue = formatCardNumber(value);
    } else if (field === "validade" && typeof value === "string") {
      formattedValue = formatValidade(value);
    } else if (field === "cvv" && typeof value === "string") {
      formattedValue = formatCVV(value);
    }

    setCartaoData((prev) => ({ ...prev, [field]: formattedValue }));

    if (cartaoErrors[field]) {
      setCartaoErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateCartao = () => {
    const errors: Partial<Record<keyof CartaoData, string>> = {};

    if (
      !cartaoData.numero ||
      cartaoData.numero.replace(/\s/g, "").length < 16
    ) {
      errors.numero = "Numero do cartao invalido";
    }
    if (!cartaoData.nome || cartaoData.nome.trim().length < 3) {
      errors.nome = "Nome obrigatorio";
    }
    if (!cartaoData.validade || cartaoData.validade.length < 5) {
      errors.validade = "Validade invalida";
    }
    if (!cartaoData.cvv || cartaoData.cvv.length < 3) {
      errors.cvv = "CVV invalido";
    }

    setCartaoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateCartao()) {
      onFinalizar(cartaoData);
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

            {/* Numero do Cartao */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Numero do cartao
              </label>
              <input
                type="text"
                value={cartaoData.numero}
                onChange={(e) => handleCartaoChange("numero", e.target.value)}
                placeholder=""
                maxLength={19}
                className={`w-full h-[48px] px-4 bg-white border ${
                  cartaoErrors.numero ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {cartaoErrors.numero && (
                <span className="text-red-500 text-sm">
                  {cartaoErrors.numero}
                </span>
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
                onChange={(e) => handleCartaoChange("nome", e.target.value)}
                placeholder="Nome e sobrenome"
                className={`w-full h-[48px] px-4 bg-white border ${
                  cartaoErrors.nome ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {cartaoErrors.nome && (
                <span className="text-red-500 text-sm">
                  {cartaoErrors.nome}
                </span>
              )}
            </div>

            {/* Validade */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Validade
              </label>
              <input
                type="text"
                value={cartaoData.validade}
                onChange={(e) => handleCartaoChange("validade", e.target.value)}
                placeholder="MM/AA"
                maxLength={5}
                className={`w-full h-[48px] px-4 bg-white border ${
                  cartaoErrors.validade ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {cartaoErrors.validade && (
                <span className="text-red-500 text-sm">
                  {cartaoErrors.validade}
                </span>
              )}
            </div>

            {/* CVV */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                CVV
              </label>
              <input
                type="text"
                value={cartaoData.cvv}
                onChange={(e) => handleCartaoChange("cvv", e.target.value)}
                placeholder=""
                maxLength={4}
                className={`w-full h-[48px] px-4 bg-white border ${
                  cartaoErrors.cvv ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {cartaoErrors.cvv && (
                <span className="text-red-500 text-sm">{cartaoErrors.cvv}</span>
              )}
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
                        onChange={() =>
                          handleCartaoChange("parcelas", parcela.valor)
                        }
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

          {/* Botao Finalizar Compra */}
          <button
            onClick={handleSubmit}
            className="w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
          >
            <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
              Finalizar compra
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
