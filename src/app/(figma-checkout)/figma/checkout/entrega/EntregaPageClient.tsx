"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "../CheckoutStepper";

interface FormData {
  cep: string;
  rua: string;
  numero: string;
  semNumero: boolean;
  complemento: string;
  informacoesAdicionais: string;
  tipoEntrega: "normal" | "expressa";
}

export function EntregaPageClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    cep: "",
    rua: "",
    numero: "",
    semNumero: false,
    complemento: "",
    informacoesAdicionais: "",
    tipoEntrega: "normal",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Verificar se o usuário passou pela identificação
  useEffect(() => {
    const identificacao = localStorage.getItem("checkoutIdentificacao");
    if (!identificacao) {
      router.push("/figma/checkout/identificacao");
    }
  }, [router]);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    if (field === "cep" && typeof value === "string") {
      value = formatCEP(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.cep || formData.cep.length < 9) {
      newErrors.cep = "CEP inválido";
    }

    if (!formData.rua || formData.rua.trim().length < 3) {
      newErrors.rua = "Rua obrigatória";
    }

    if (!formData.semNumero && (!formData.numero || formData.numero.trim().length === 0)) {
      newErrors.numero = "Número obrigatório";
    }

    if (!formData.complemento || formData.complemento.trim().length < 1) {
      newErrors.complemento = "Complemento obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Salvar dados no localStorage para próxima etapa
      localStorage.setItem("checkoutEntrega", JSON.stringify(formData));
      router.push("/figma/checkout/pagamento");
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      {/* Stepper */}
      <CheckoutStepper currentStep="entrega" />

      {/* Formulário */}
      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <div className="flex flex-col gap-6 lg:gap-[32px] py-4 lg:py-[24px]">
            {/* CEP */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                CEP *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleChange("cep", e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.cep ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
                />
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] underline"
                >
                  Não sei meu CEP
                </a>
              </div>
              {errors.cep && (
                <span className="text-red-500 text-sm">{errors.cep}</span>
              )}
            </div>

            {/* Rua / Avenida */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Rua / Avenida
              </label>
              <input
                type="text"
                value={formData.rua}
                onChange={(e) => handleChange("rua", e.target.value)}
                placeholder=""
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.rua ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.rua && (
                <span className="text-red-500 text-sm">{errors.rua}</span>
              )}
            </div>

            {/* Número */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Número *
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => handleChange("numero", e.target.value)}
                  placeholder="000"
                  disabled={formData.semNumero}
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.numero ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] ${
                    formData.semNumero ? "bg-gray-100" : ""
                  }`}
                />
                <div className="absolute right-4 flex items-center gap-2">
                  <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#333333]">
                    Sem número
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.semNumero}
                    onChange={(e) => handleChange("semNumero", e.target.checked)}
                    className="w-[18px] h-[18px] border-2 border-[#333333] rounded-sm cursor-pointer accent-[#254333]"
                  />
                </div>
              </div>
              {errors.numero && (
                <span className="text-red-500 text-sm">{errors.numero}</span>
              )}
            </div>

            {/* Complemento */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Complemento *
              </label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => handleChange("complemento", e.target.value)}
                placeholder="Apartamento ou bloco"
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.complemento ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.complemento && (
                <span className="text-red-500 text-sm">{errors.complemento}</span>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Informações adicionais (opcional)
              </label>
              <textarea
                value={formData.informacoesAdicionais}
                onChange={(e) => handleChange("informacoesAdicionais", e.target.value)}
                placeholder="Ponto de referência, instruções para entrega..."
                rows={3}
                className="w-full min-h-[80px] px-4 py-3 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] resize-none"
              />
            </div>

            {/* Tipo de entrega */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Selecione o tipo de entrega
              </label>
              <div className="flex flex-col">
                {/* Normal */}
                <label className="flex items-center gap-1 py-2 cursor-pointer">
                  <div className="p-[11px]">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="normal"
                      checked={formData.tipoEntrega === "normal"}
                      onChange={(e) => handleChange("tipoEntrega", e.target.value)}
                      className="w-[18px] h-[18px] border-2 border-[#333333] cursor-pointer accent-[#254333]"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-[6px]">
                    <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111111]">
                      Normal
                    </span>
                    <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                      5 a 6 dias úteis
                    </span>
                  </div>
                  <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#009142]">
                    Grátis
                  </span>
                </label>

                {/* Expressa */}
                <label className="flex items-center gap-1 py-2 cursor-pointer">
                  <div className="p-[11px]">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="expressa"
                      checked={formData.tipoEntrega === "expressa"}
                      onChange={(e) => handleChange("tipoEntrega", e.target.value)}
                      className="w-[18px] h-[18px] border-2 border-[#333333] cursor-pointer accent-[#254333]"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-[6px]">
                    <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111111]">
                      Expressa
                    </span>
                    <span className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#111111]">
                      Receba amanhã
                    </span>
                  </div>
                  <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black">
                    R$ 14,99
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Botão Finalizar compra */}
          <button
            type="submit"
            className="w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
          >
            <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
              Finalizar compra
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
