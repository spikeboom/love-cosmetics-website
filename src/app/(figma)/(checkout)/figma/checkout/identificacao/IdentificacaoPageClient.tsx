"use client";

import { useRouter } from "next/navigation";
import { CheckoutStepper } from "../CheckoutStepper";
import { useIdentificacaoForm, IdentificacaoFormData } from "@/hooks/checkout/useIdentificacaoForm";

export function IdentificacaoPageClient() {
  const router = useRouter();
  const {
    formData,
    errors,
    isLoading,
    handleChange,
    validateForm,
    saveToStorage,
  } = useIdentificacaoForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      saveToStorage();
      router.push("/figma/checkout/entrega");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white flex flex-col w-full flex-1">
        <CheckoutStepper currentStep="identificacao" />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#254333] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <CheckoutStepper currentStep="identificacao" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          <div className="flex flex-col gap-6 lg:gap-[32px] py-4 lg:py-[24px]">
            {/* CPF */}
            <FormField
              label="Informe seu CPF *"
              field="cpf"
              value={formData.cpf}
              onChange={handleChange}
              error={errors.cpf}
              placeholder="000.000.000-00"
              maxLength={14}
            />

            {/* Data de nascimento */}
            <FormField
              label="Data de nascimento *"
              field="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              error={errors.dataNascimento}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />

            {/* Nome e sobrenome */}
            <FormField
              label="Nome e sobrenome *"
              field="nome"
              value={formData.nome}
              onChange={handleChange}
              error={errors.nome}
            />

            {/* E-mail */}
            <FormField
              label="E-mail *"
              field="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              type="email"
            />

            {/* Telefone */}
            <FormField
              label="Telefone *"
              field="telefone"
              value={formData.telefone}
              onChange={handleChange}
              error={errors.telefone}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
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

// Componente auxiliar de campo de formulario
interface FormFieldProps {
  label: string;
  field: keyof IdentificacaoFormData;
  value: string;
  onChange: (field: keyof IdentificacaoFormData, value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}

function FormField({
  label,
  field,
  value,
  onChange,
  error,
  placeholder = "",
  maxLength,
  type = "text",
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
      <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full h-[48px] px-4 bg-white border ${
          error ? "border-red-500" : "border-[#d2d2d2]"
        } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]`}
      />
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  );
}
