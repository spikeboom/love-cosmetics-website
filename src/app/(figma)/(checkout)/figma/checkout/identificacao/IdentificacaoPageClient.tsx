"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { CheckoutStepper } from "../CheckoutStepper";
import { useIdentificacaoForm, IdentificacaoFormData } from "@/hooks/checkout/useIdentificacaoForm";
import { useCheckoutSync } from "@/hooks/checkout/useCheckoutSync";
import { ucCheckoutStep, ucUserDataUpdate } from "../../../../_tracking/uc-ecommerce";
import { useCart, useShipping } from "@/contexts";
import { useViaCep } from "@/hooks/checkout";
import { formatCEP } from "@/lib/formatters";
import { reportCheckoutIssue } from "@/lib/checkout/report-checkout-issue";
import { identificacaoSchema, validacoes } from "@/lib/checkout/validation";
import {
  resetIdentificacaoPageInstance,
  trackIdentificacaoEvent,
} from "@/lib/checkout/track-identificacao-event";
import Image from "next/image";

function digitsCount(value: string) {
  return value.replace(/\D/g, "").length;
}

function getFormDiagnostics(formData: IdentificacaoFormData) {
  return {
    has_cpf: Boolean(formData.cpf),
    has_nome: Boolean(formData.nome),
    has_email: Boolean(formData.email),
    has_telefone: Boolean(formData.telefone),
    has_cep: Boolean(formData.cep),
    cpf_digits: digitsCount(formData.cpf),
    nome_length: formData.nome.trim().length,
    nome_has_space: formData.nome.trim().includes(" "),
    email_length: formData.email.length,
    email_has_at: formData.email.includes("@"),
    email_has_dot: formData.email.includes("."),
    telefone_digits: digitsCount(formData.telefone),
    cep_digits: digitsCount(formData.cep),
  };
}

function getValidationDiagnostics(formData: IdentificacaoFormData) {
  const invalidFields = new Set<keyof IdentificacaoFormData>();
  const missingFields = (Object.entries(formData) as Array<[keyof IdentificacaoFormData, string]>)
    .filter(([, value]) => !value.trim())
    .map(([field]) => field);

  const result = identificacaoSchema.safeParse(formData);
  if (!result.success) {
    result.error.errors.forEach((err) => {
      const field = err.path[0] as keyof IdentificacaoFormData;
      invalidFields.add(field);
    });
  }

  if (formData.cpf && !validacoes.cpf(formData.cpf)) {
    invalidFields.add("cpf");
  }

  return {
    ...getFormDiagnostics(formData),
    invalid_fields: Array.from(invalidFields),
    missing_fields: missingFields,
  };
}

export function IdentificacaoPageClient() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cart, isCartLoaded } = useCart();
  const firedStepEventRef = useRef(false);
  const firedCartLoadedRef = useRef(false);
  const firedFormPrefilledRef = useRef(false);
  const firedFirstInteractionRef = useRef(false);
  const lastCepLookupRef = useRef("");
  const lastCepSuccessRef = useRef("");
  const lastCepErrorRef = useRef<string | null>(null);
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

  useEffect(() => {
    resetIdentificacaoPageInstance();
    trackIdentificacaoEvent({
      eventName: "identificacao_page_viewed",
      payload: {
        cart_loaded: isCartLoaded,
        has_cart: isCartLoaded ? Object.keys(cart || {}).length > 0 : null,
      },
    });

    const handlePageHidden = () => {
      if (document.visibilityState !== "hidden") return;
      trackIdentificacaoEvent({
        eventName: "identificacao_page_hidden",
        payload: { reason: "visibility_hidden" },
      });
    };

    const handleRuntimeError = (event: ErrorEvent) => {
      trackIdentificacaoEvent({
        eventName: "identificacao_runtime_error",
        severity: "error",
        payload: {
          message: event.message,
          source: event.filename,
          line: event.lineno,
          column: event.colno,
        },
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      trackIdentificacaoEvent({
        eventName: "identificacao_unhandled_rejection",
        severity: "error",
        payload: {
          message: reason instanceof Error ? reason.message : String(reason || "unknown"),
          name: reason instanceof Error ? reason.name : undefined,
        },
      });
    };

    document.addEventListener("visibilitychange", handlePageHidden);
    window.addEventListener("error", handleRuntimeError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      document.removeEventListener("visibilitychange", handlePageHidden);
      window.removeEventListener("error", handleRuntimeError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Guard: prevent starting checkout with an empty cart.
  useEffect(() => {
    if (!isCartLoaded) return;
    if (Object.keys(cart || {}).length === 0) {
      trackIdentificacaoEvent({
        eventName: "identificacao_empty_cart_redirect",
        severity: "warning",
        payload: { reason: "empty_cart" },
      });
      router.push("/figma/cart");
      return;
    }

    if (!firedCartLoadedRef.current) {
      firedCartLoadedRef.current = true;
      const cartItems = Object.values(cart || {}) as Array<{ quantity?: unknown; preco?: unknown }>;
      trackIdentificacaoEvent({
        eventName: "identificacao_cart_loaded",
        payload: {
          has_cart: true,
          items_count: cartItems.reduce((acc, item) => acc + Number(item.quantity || 1), 0),
          distinct_items: cartItems.length,
          cart_value: cartItems.reduce(
            (acc, item) => acc + Number(item.preco || 0) * Number(item.quantity || 1),
            0
          ),
        },
      });
    }

    if (firedStepEventRef.current) return;
    firedStepEventRef.current = true;
    ucCheckoutStep({ step: "identificacao" });
  }, [cart, isCartLoaded, router]);

  useEffect(() => {
    if (isLoading || firedFormPrefilledRef.current) return;
    firedFormPrefilledRef.current = true;
    trackIdentificacaoEvent({
      eventName: "identificacao_form_prefilled",
      payload: {
        is_logged_in: isLoggedIn,
        ...getFormDiagnostics(formData),
      },
    });
  }, [formData, isLoading, isLoggedIn]);

  // Manter o ShippingContext sincronizado com o CEP do checkout (bidirecional).
  useEffect(() => {
    if (!formData.cep) return;
    if (formData.cep === shippingCep) return;
    setShippingCep(formData.cep);
  }, [formData.cep, setShippingCep, shippingCep]);

  // Auto-buscar CEP quando completar 8 dígitos
  useEffect(() => {
    const cepLimpo = formData.cep.replace(/\D/g, "");
    if (cepLimpo.length === 8 && lastCepLookupRef.current !== cepLimpo) {
      lastCepLookupRef.current = cepLimpo;
      trackIdentificacaoEvent({
        eventName: "identificacao_cep_completed",
        payload: { cep_digits: cepLimpo.length },
      });
      trackIdentificacaoEvent({
        eventName: "identificacao_cep_lookup_started",
        payload: { cep_digits: cepLimpo.length },
      });
      buscarCep(formData.cep);
    }
  }, [formData.cep]);

  useEffect(() => {
    if (!endereco?.cidade || !endereco?.estado) return;
    const key = `${endereco.cidade}:${endereco.estado}:${formData.cep}`;
    if (lastCepSuccessRef.current === key) return;
    lastCepSuccessRef.current = key;

    trackIdentificacaoEvent({
      eventName: "identificacao_cep_lookup_success",
      payload: {
        has_street: Boolean(endereco.rua),
        has_neighborhood: Boolean(endereco.bairro),
        has_city: Boolean(endereco.cidade),
        has_state: Boolean(endereco.estado),
      },
    });
  }, [endereco, formData.cep]);

  useEffect(() => {
    if (!errorCep || lastCepErrorRef.current === errorCep) return;
    lastCepErrorRef.current = errorCep;
    enqueueSnackbar("Nao encontramos esse CEP. Confira se ele esta correto.", {
      variant: "warning",
    });
    reportCheckoutIssue({
      step: "identificacao",
      kind: "viacep_lookup_failed",
      severity: "warning",
      message: errorCep,
      metadata: { cep: formData.cep },
    });
    trackIdentificacaoEvent({
      eventName: "identificacao_cep_lookup_failed",
      severity: "warning",
      payload: {
        error_message: errorCep,
        cep_digits: digitsCount(formData.cep),
      },
    });
  }, [enqueueSnackbar, errorCep, formData.cep]);

  const handleTrackedChange = (field: keyof IdentificacaoFormData, value: string) => {
    if (!firedFirstInteractionRef.current) {
      firedFirstInteractionRef.current = true;
      trackIdentificacaoEvent({
        eventName: "identificacao_first_interaction",
        payload: { field },
      });
    }
    handleChange(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    trackIdentificacaoEvent({
      eventName: "identificacao_continue_clicked",
      payload: getFormDiagnostics(formData),
    });

    if (!validateForm()) {
      enqueueSnackbar("Confira os dados para continuar.", { variant: "warning" });
      reportCheckoutIssue({
        step: "identificacao",
        kind: "client_validation_failed",
        severity: "info",
        message: "Identification form validation failed",
        metadata: {
          cpf: formData.cpf,
          email: formData.email,
          telefone: formData.telefone,
          cep: formData.cep,
        },
      });
      trackIdentificacaoEvent({
        eventName: "identificacao_validation_failed",
        severity: "warning",
        payload: getValidationDiagnostics(formData),
      });
      setIsSubmitting(false);
      return;
    }
      // Garantir que o CEP usado no checkout reflita no ShippingContext antes de avanÃ§ar.
      trackIdentificacaoEvent({
        eventName: "identificacao_validation_passed",
        payload: getFormDiagnostics(formData),
      });
      if (formData.cep) {
        setShippingCep(formData.cep);
      }
      trackIdentificacaoEvent({ eventName: "identificacao_storage_save_started" });
      try {
        saveToStorage();
        trackIdentificacaoEvent({ eventName: "identificacao_storage_save_success" });
      } catch (error) {
      trackIdentificacaoEvent({
        eventName: "identificacao_storage_save_failed",
        severity: "error",
          payload: {
            error_name: error instanceof Error ? error.name : "unknown",
            error_message: error instanceof Error ? error.message : String(error),
          },
        });
        setIsSubmitting(false);
        throw error;
      }

      trackIdentificacaoEvent({ eventName: "identificacao_sync_started" });
      syncToServer({ identificacao: formData, step: "identificacao" })
        .then((result) => {
          trackIdentificacaoEvent({
            eventName: result?.ok ? "identificacao_sync_success" : "identificacao_sync_failed",
            severity: result?.ok ? "info" : "warning",
          });
        })
        .catch((error) => {
          trackIdentificacaoEvent({
            eventName: "identificacao_sync_failed",
            severity: "warning",
            payload: {
              error_name: error instanceof Error ? error.name : "unknown",
              error_message: error instanceof Error ? error.message : String(error),
            },
          });
        });

      // Disparar user_data_update com dados de identificacao
      const nomeCompleto = formData.nome?.trim() || "";
      const partes = nomeCompleto.split(/\s+/);
      ucUserDataUpdate({
        email: formData.email,
        phone_number: formData.telefone?.replace(/\D/g, "") || undefined,
        first_name: partes[0] || undefined,
        last_name: partes.length > 1 ? partes.slice(1).join(" ") : undefined,
      });

      trackIdentificacaoEvent({ eventName: "identificacao_navigate_entrega_attempted" });
      router.push("/figma/checkout/entrega");
      trackIdentificacaoEvent({ eventName: "identificacao_navigate_entrega_called" });
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
              onChange={handleTrackedChange}
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
              onChange={handleTrackedChange}
              error={errors.nome}
            />

            {/* E-mail */}
            <FormField
              label="E-mail *"
              field="email"
              value={formData.email}
              onChange={handleTrackedChange}
              error={errors.email}
              type="email"
              disabled={isLoggedIn && process.env.NODE_ENV !== "development"}
            />

            {/* Telefone */}
            <FormField
              label="Telefone *"
              field="telefone"
              value={formData.telefone}
              onChange={handleTrackedChange}
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
                  onChange={(e) => handleTrackedChange("cep", formatCEP(e.target.value))}
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
            disabled={isSubmitting}
            className="w-full h-[56px] lg:h-[60px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-white">
                Continuar
              </span>
            )}
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
