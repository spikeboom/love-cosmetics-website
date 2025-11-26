"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "../CheckoutStepper";
import { useViaCep } from "@/hooks/checkout";

interface FormData {
  cep: string;
  rua: string;
  numero: string;
  semNumero: boolean;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  informacoesAdicionais: string;
  tipoEntrega: "normal" | "expressa";
}

export function EntregaPageClient() {
  const router = useRouter();
  const { buscarCep, loading: loadingCep, error: errorCep, endereco } = useViaCep();

  const [formData, setFormData] = useState<FormData>({
    cep: "",
    rua: "",
    numero: "",
    semNumero: false,
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    informacoesAdicionais: "",
    tipoEntrega: "normal",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Verificar se o usuario passou pela identificacao
  useEffect(() => {
    const identificacao = localStorage.getItem("checkoutIdentificacao");
    if (!identificacao) {
      router.push("/figma/checkout/identificacao");
    }
  }, [router]);

  // Carregar dados salvos
  useEffect(() => {
    const saved = localStorage.getItem("checkoutEntrega");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch {
        // Ignorar erro
      }
    }
  }, []);

  // Preencher campos quando endereco for buscado
  useEffect(() => {
    if (endereco) {
      setFormData((prev) => ({
        ...prev,
        rua: endereco.rua || prev.rua,
        bairro: endereco.bairro || prev.bairro,
        cidade: endereco.cidade || prev.cidade,
        estado: endereco.estado || prev.estado,
      }));
    }
  }, [endereco]);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").replace(/(-\d{3})\d+?$/, "$1");
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    if (field === "cep" && typeof value === "string") {
      value = formatCEP(value);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro ao digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Buscar CEP quando completar 9 caracteres (00000-000)
  const handleCepBlur = async () => {
    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      await buscarCep(formData.cep);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.cep || formData.cep.replace(/\D/g, "").length !== 8) {
      newErrors.cep = "CEP invalido";
    }

    if (!formData.rua || formData.rua.trim().length < 3) {
      newErrors.rua = "Rua obrigatoria";
    }

    if (!formData.semNumero && (!formData.numero || formData.numero.trim().length === 0)) {
      newErrors.numero = "Numero obrigatorio";
    }

    if (!formData.complemento || formData.complemento.trim().length < 1) {
      newErrors.complemento = "Complemento obrigatorio";
    }

    if (!formData.bairro || formData.bairro.trim().length < 2) {
      newErrors.bairro = "Bairro obrigatorio";
    }

    if (!formData.cidade || formData.cidade.trim().length < 2) {
      newErrors.cidade = "Cidade obrigatoria";
    }

    if (!formData.estado || formData.estado.trim().length < 2) {
      newErrors.estado = "Estado obrigatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      localStorage.setItem("checkoutEntrega", JSON.stringify(formData));
      router.push("/figma/checkout/pagamento");
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="entrega" />

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
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  maxLength={9}
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.cep || errorCep ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
                />
                <a
                  href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-cera-pro font-light text-[14px] lg:text-[16px] text-[#254333] underline"
                >
                  Nao sei meu CEP
                </a>
              </div>
              {loadingCep && (
                <span className="text-[#254333] text-sm">Buscando endereco...</span>
              )}
              {(errors.cep || errorCep) && (
                <span className="text-red-500 text-sm">{errors.cep || errorCep}</span>
              )}
            </div>

            {/* Rua / Avenida */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Rua / Avenida *
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

            {/* Bairro */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Bairro *
              </label>
              <input
                type="text"
                value={formData.bairro}
                onChange={(e) => handleChange("bairro", e.target.value)}
                placeholder=""
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.bairro ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.bairro && (
                <span className="text-red-500 text-sm">{errors.bairro}</span>
              )}
            </div>

            {/* Cidade e Estado */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-3 lg:gap-[16px] flex-1">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => handleChange("cidade", e.target.value)}
                  placeholder=""
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.cidade ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
                />
                {errors.cidade && (
                  <span className="text-red-500 text-sm">{errors.cidade}</span>
                )}
              </div>

              <div className="flex flex-col gap-3 lg:gap-[16px] w-[100px]">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  Estado *
                </label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  placeholder="UF"
                  maxLength={2}
                  className={`w-full h-[48px] px-4 bg-white border ${
                    errors.estado ? "border-red-500" : "border-[#d2d2d2]"
                  } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] uppercase`}
                />
                {errors.estado && (
                  <span className="text-red-500 text-sm">{errors.estado}</span>
                )}
              </div>
            </div>

            {/* Numero */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Numero *
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
                    Sem numero
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

            {/* Informacoes adicionais */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Informacoes adicionais (opcional)
              </label>
              <textarea
                value={formData.informacoesAdicionais}
                onChange={(e) => handleChange("informacoesAdicionais", e.target.value)}
                placeholder="Ponto de referencia, instrucoes para entrega..."
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
                      5 a 6 dias uteis
                    </span>
                  </div>
                  <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#009142]">
                    Gratis
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
                      Receba amanha
                    </span>
                  </div>
                  <span className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black">
                    R$ 14,99
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Botao Continuar */}
          <button
            type="submit"
            className="w-full h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
          >
            <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
              Continuar
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
