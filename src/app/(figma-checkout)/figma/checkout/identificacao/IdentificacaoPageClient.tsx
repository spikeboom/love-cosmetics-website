"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "../CheckoutStepper";

interface FormData {
  cpf: string;
  dataNascimento: string;
  nome: string;
  email: string;
  telefone: string;
}

export function IdentificacaoPageClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    cpf: "",
    dataNascimento: "",
    nome: "",
    email: "",
    telefone: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{4})\d+?$/, "$1");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;

    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "dataNascimento") {
      formattedValue = formatDate(value);
    } else if (field === "telefone") {
      formattedValue = formatPhone(value);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.cpf || formData.cpf.length < 14) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.dataNascimento || formData.dataNascimento.length < 10) {
      newErrors.dataNascimento = "Data inválida";
    }

    if (!formData.nome || formData.nome.trim().length < 3) {
      newErrors.nome = "Nome obrigatório";
    }

    if (!formData.email || !formData.email.includes("@")) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.telefone || formData.telefone.length < 15) {
      newErrors.telefone = "Telefone inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Salvar dados no localStorage para próxima etapa
      localStorage.setItem("checkoutIdentificacao", JSON.stringify(formData));
      router.push("/figma/checkout/entrega");
    }
  };

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      {/* Stepper */}
      <CheckoutStepper currentStep="identificacao" />

      {/* Formulário */}
      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <div className="flex flex-col gap-6 lg:gap-[32px] py-4 lg:py-[24px]">
            {/* CPF */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Informe seu CPF *
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => handleChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.cpf ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.cpf && (
                <span className="text-red-500 text-sm">{errors.cpf}</span>
              )}
            </div>

            {/* Data de nascimento */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Data de nascimento *
              </label>
              <input
                type="text"
                value={formData.dataNascimento}
                onChange={(e) => handleChange("dataNascimento", e.target.value)}
                placeholder="DD/MM/AAAA"
                maxLength={10}
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.dataNascimento ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.dataNascimento && (
                <span className="text-red-500 text-sm">{errors.dataNascimento}</span>
              )}
            </div>

            {/* Nome e sobrenome */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Nome e sobrenome *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange("nome", e.target.value)}
                placeholder=""
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.nome ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.nome && (
                <span className="text-red-500 text-sm">{errors.nome}</span>
              )}
            </div>

            {/* E-mail */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                E-mail *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder=""
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.email ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}
            </div>

            {/* Telefone */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Telefone *
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => handleChange("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className={`w-full h-[48px] px-4 bg-white border ${
                  errors.telefone ? "border-red-500" : "border-[#d2d2d2]"
                } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
              />
              {errors.telefone && (
                <span className="text-red-500 text-sm">{errors.telefone}</span>
              )}
            </div>
          </div>

          {/* Botão Continuar */}
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
