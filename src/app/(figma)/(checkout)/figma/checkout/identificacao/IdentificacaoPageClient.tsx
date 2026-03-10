"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckoutStepper } from "../CheckoutStepper";
import { useIdentificacaoForm, IdentificacaoFormData } from "@/hooks/checkout/useIdentificacaoForm";
import { useCheckoutSync } from "@/hooks/checkout/useCheckoutSync";
import { ucUserDataUpdate } from "../../../../_tracking/uc-ecommerce";
import { useCart, useShipping } from "@/contexts";
import { useViaCep } from "@/hooks/checkout";
import { formatCEP } from "@/lib/formatters";
import Image from "next/image";

export function IdentificacaoPageClient() {
  const router = useRouter();
  const { cart, isCartLoaded } = useCart();
  const { cep: shippingCep, setCep: setShippingCep } = useShipping();
  const { buscarCep, loading: loadingCep, error: errorCep, endereco } = useViaCep();
  const {
    formData,
    errors,
    isLoading,
    isLoggedIn,
    handleChange,
    validateForm,
    saveToStorage,
  } = useIdentificacaoForm(shippingCep || undefined);
  const { syncToServer } = useCheckoutSync();

  // Guard: prevent starting checkout with an empty cart.
  useEffect(() => {
    if (!isCartLoaded) return;
    if (Object.keys(cart || {}).length === 0) {
      router.push("/figma/cart");
    }
  }, [cart, isCartLoaded, router]);

  // Manter o ShippingContext sincronizado com o CEP do checkout (bidirecional).
  useEffect(() => {
    if (!formData.cep) return;
    if (formData.cep === shippingCep) return;
    setShippingCep(formData.cep);
  }, [formData.cep, setShippingCep, shippingCep]);

  // Auto-buscar CEP quando completar 8 dígitos
  useEffect(() => {
    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length === 8) {
      buscarCep(formData.cep);
    }
  }, [formData.cep]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Garantir que o CEP usado no checkout reflita no ShippingContext antes de avanÃ§ar.
      if (formData.cep) {
        setShippingCep(formData.cep);
      }
      saveToStorage();
      syncToServer({ identificacao: formData, step: "identificacao" });

      // Disparar user_data_update com dados de identificacao
      const nomeCompleto = formData.nome?.trim() || "";
      const partes = nomeCompleto.split(/\s+/);
      ucUserDataUpdate({
        email: formData.email,
        phone_number: formData.telefone?.replace(/\D/g, "") || undefined,
        first_name: partes[0] || undefined,
        last_name: partes.length > 1 ? partes.slice(1).join(" ") : undefined,
      });

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

      <div className="flex justify-center px-4 lg:px-[24px] pt-2 lg:pt-[12px] pb-6 lg:pb-[32px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 lg:gap-[32px] w-full max-w-[684px]">
          <div className="flex flex-col gap-4 lg:gap-[32px] py-3 lg:py-[24px]">
            {/* CPF */}
            <FormField
              label="Informe seu CPF *"
              field="cpf"
              value={formData.cpf}
              onChange={handleChange}
              error={errors.cpf}
              placeholder="000.000.000-00"
              maxLength={14}
              disabled={isLoggedIn && process.env.NODE_ENV !== "development"}
            />

            {/* Nome completo */}
            <FormField
              label="Nome completo *"
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
              disabled={isLoggedIn && process.env.NODE_ENV !== "development"}
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

            {/* CEP */}
            <div className="flex flex-col gap-2 lg:gap-[16px] w-full">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                CEP *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => handleChange("cep", formatCEP(e.target.value))}
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
                  Não sei meu CEP
                </a>
              </div>
              {loadingCep && (
                <div className="w-full h-[3px] bg-[#E0E0E0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#009142] rounded-full animate-shimmer" />
                </div>
              )}
              {(errors.cep || errorCep) && (
                <span className="text-red-500 text-sm">{errors.cep || errorCep}</span>
              )}
              {/* Bairro, Cidade/UF resumido */}
              {endereco && endereco.cidade && endereco.estado && (
                <div className="flex items-start gap-[6px] w-full">
                  <Image
                    src="/new-home/icons/location.svg"
                    alt="Localização"
                    width={16}
                    height={16}
                    className="w-4 h-4 flex-shrink-0 mt-[1px]"
                  />
                  <p className="font-cera-pro font-light text-[14px] text-[#333333] leading-[1.4]">
                    {endereco.bairro && `${endereco.bairro}, `}{endereco.cidade} - {endereco.estado}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botao Continuar */}
          <button
            type="submit"
            className="w-full h-[56px] lg:h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors"
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
  disabled?: boolean;
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
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2 lg:gap-[16px] w-full">
      <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full h-[48px] px-4 border ${
          error ? "border-red-500" : "border-[#d2d2d2]"
        } rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-black placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333] ${
          disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
        }`}
      />
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  );
}
