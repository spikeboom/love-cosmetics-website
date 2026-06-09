"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import {
  landingVariants,
  proposalOptions,
  purchaseInfluenceOptions,
  type LandingVariant,
} from "../content";

type FormState = {
  nome: string;
  whatsapp: string;
  email: string;
  purchaseInfluence: string;
  proposalChoice: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

declare global {
  interface Window {
    dataLayer?: Object[];
  }
}

const initialFormState: FormState = {
  nome: "",
  whatsapp: "",
  email: "",
  purchaseInfluence: "",
  proposalChoice: "",
};

function validateForm(form: FormState) {
  const errors: FormErrors = {};
  const phoneDigits = form.whatsapp.replace(/\D/g, "");

  if (!form.nome.trim()) errors.nome = "Informe seu nome.";
  if (phoneDigits.length < 10) errors.whatsapp = "Informe um WhatsApp válido.";
  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Informe um e-mail válido.";
  }
  if (!form.purchaseInfluence) {
    errors.purchaseInfluence = "Escolha uma opção.";
  }
  if (!form.proposalChoice) {
    errors.proposalChoice = "Escolha uma proposta.";
  }

  return errors;
}

function saveSubmission(payload: Record<string, unknown>) {
  const storageKey = "love-cocriacao-form-submissions";
  const previous = window.localStorage.getItem(storageKey);
  const parsed = previous ? JSON.parse(previous) : [];

  window.localStorage.setItem(storageKey, JSON.stringify([...parsed, payload]));
}

function findSourceVariant(value: string | null) {
  if (!value) return null;

  return (
    Object.values(landingVariants).find(
      (variant) => variant.id === value || variant.slug === value,
    ) || null
  );
}

export default function CoCriacaoFormClient() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sourceVariant, setSourceVariant] = useState<LandingVariant | null>(
    null,
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSourceVariant(findSourceVariant(params.get("variant")));
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      ...form,
      sourceVariantId: sourceVariant?.id || null,
      sourceVariantSlug: sourceVariant?.slug || null,
      sourceVariantHeadline: sourceVariant?.headline || null,
      submittedAt: new Date().toISOString(),
    };

    try {
      saveSubmission(payload);
    } catch (error) {
      console.error("[Co-criação Form] Erro ao salvar envio local:", error);
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "love_cocriacao_form_submit",
      source_variant_id: sourceVariant?.id || null,
      source_variant_slug: sourceVariant?.slug || null,
      purchase_influence: form.purchaseInfluence,
      proposal_choice: form.proposalChoice,
    });

    setSubmitted(true);
    setForm(initialFormState);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-[#254333]/12 bg-white p-4 shadow-[0_18px_50px_rgba(37,67,51,0.10)] lg:p-8"
    >
      {submitted && (
        <div className="mb-6 rounded-lg border border-[#2f7d58]/25 bg-[#eaf6ef] p-4 font-cera-pro text-sm font-bold text-[#254333]">
          Cadastro recebido. Obrigado por participar da pesquisa da Nova Lovè.
        </div>
      )}

      <input
        type="hidden"
        name="sourceVariant"
        value={sourceVariant?.id || ""}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <TextInput
          label="Nome"
          value={form.nome}
          error={errors.nome}
          autoComplete="name"
          onChange={(value) => updateField("nome", value)}
        />
        <TextInput
          label="WhatsApp"
          value={form.whatsapp}
          error={errors.whatsapp}
          inputMode="tel"
          autoComplete="tel"
          placeholder="(00) 00000-0000"
          onChange={(value) => updateField("whatsapp", value)}
        />
        <TextInput
          label="E-mail"
          value={form.email}
          error={errors.email}
          inputMode="email"
          autoComplete="email"
          placeholder="voce@email.com"
          onChange={(value) => updateField("email", value)}
        />
      </div>

      <fieldset className="mt-8">
        <legend className="font-cera-pro text-lg font-bold text-[#254333]">
          O que mais influenciaria sua decisão de compra?
        </legend>
        {errors.purchaseInfluence && (
          <p className="mt-2 font-cera-pro text-sm font-bold text-[#b3261e]">
            {errors.purchaseInfluence}
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {purchaseInfluenceOptions.map((option) => (
            <RadioOption
              key={option}
              name="purchaseInfluence"
              value={option}
              checked={form.purchaseInfluence === option}
              onChange={() => updateField("purchaseInfluence", option)}
            >
              {option}
            </RadioOption>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="font-cera-pro text-lg font-bold text-[#254333]">
          Qual dessas propostas mais te faria comprar um produto de skincare?
        </legend>
        {errors.proposalChoice && (
          <p className="mt-2 font-cera-pro text-sm font-bold text-[#b3261e]">
            {errors.proposalChoice}
          </p>
        )}

        <div className="mt-4 grid gap-3">
          {proposalOptions.map((option) => (
            <RadioOption
              key={option.value}
              name="proposalChoice"
              value={option.value}
              checked={form.proposalChoice === option.value}
              onChange={() => updateField("proposalChoice", option.value)}
            >
              <span className="block font-bold">
                {option.value}. {option.title}
              </span>
              <span className="block text-sm font-light text-[#4d6258]">
                {option.description}
              </span>
            </RadioOption>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-col gap-4 border-t border-[#254333]/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-cera-pro text-sm font-light leading-[1.5] text-[#4d6258]">
          Ao enviar, você aceita ser contatada pela Lovè sobre a pesquisa de
          co-criação.
        </p>

        <button
          type="submit"
          className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#254333] px-6 py-4 font-cera-pro text-base font-bold text-white transition hover:bg-[#193025]"
        >
          Enviar participação
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  onChange: (value: string) => void;
}

function TextInput({
  label,
  value,
  error,
  placeholder,
  inputMode,
  autoComplete,
  onChange,
}: TextInputProps) {
  return (
    <label className="block">
      <span className="font-cera-pro text-sm font-bold text-[#254333]">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-[48px] w-full rounded-lg border border-[#254333]/18 bg-[#fbfaf8] px-4 font-cera-pro text-base text-[#1b1b1b] outline-none transition placeholder:text-[#7a8c83] focus:border-[#254333] focus:bg-white"
      />
      {error && (
        <span className="mt-2 block font-cera-pro text-sm font-bold text-[#b3261e]">
          {error}
        </span>
      )}
    </label>
  );
}

interface RadioOptionProps {
  name: string;
  value: string;
  checked: boolean;
  children: React.ReactNode;
  onChange: () => void;
}

function RadioOption({
  name,
  value,
  checked,
  children,
  onChange,
}: RadioOptionProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-cera-pro text-base transition ${
        checked
          ? "border-[#254333] bg-[#eef5f0] text-[#254333]"
          : "border-[#254333]/14 bg-[#fbfaf8] text-[#1b1b1b] hover:border-[#254333]/35"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 accent-[#254333]"
      />
      <span>{children}</span>
    </label>
  );
}
