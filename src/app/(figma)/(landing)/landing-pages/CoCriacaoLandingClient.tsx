"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, Send, Users } from "lucide-react";
import {
  ctaLabel,
  proposalOptions,
  purchaseInfluenceOptions,
  type LandingVariant,
} from "./content";
import { useState } from "react";

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

interface CoCriacaoLandingClientProps {
  variant: LandingVariant;
}

export default function CoCriacaoLandingClient({
  variant,
}: CoCriacaoLandingClientProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

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
      variantId: variant.id,
      variantSlug: variant.slug,
      variantHeadline: variant.headline,
      submittedAt: new Date().toISOString(),
    };

    try {
      saveSubmission(payload);
    } catch (error) {
      console.error("[Co-criação LP] Erro ao salvar envio local:", error);
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "love_cocriacao_form_submit",
      landing_variant_id: variant.id,
      landing_variant_slug: variant.slug,
      purchase_influence: form.purchaseInfluence,
      proposal_choice: form.proposalChoice,
    });

    setSubmitted(true);
    setForm(initialFormState);
  };

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1b1b1b]">
      <header className="border-b border-[#254333]/10 bg-[#254333]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 lg:px-8">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/new-home/header/logo.png"
              alt="Lovè Cosméticos"
              width={92}
              height={74}
              priority
              className="h-[56px] w-auto object-contain lg:h-[72px]"
            />
          </Link>

          <a
            href="#formulario"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-cera-pro text-sm font-bold text-[#254333] transition hover:bg-[#f7f3ee]"
          >
            Participar
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </header>

      <section className="relative isolate min-h-[calc(100svh-89px)] overflow-hidden lg:min-h-[calc(100vh-105px)]">
        <Image
          src={variant.heroImage.mobile}
          alt={variant.heroImage.alt}
          fill
          priority
          className="object-cover md:hidden"
          sizes="100vw"
        />
        <Image
          src={variant.heroImage.desktop}
          alt={variant.heroImage.alt}
          fill
          priority
          className="hidden object-cover md:block"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#07150f]/72 via-[#07150f]/38 to-[#07150f]/78 md:bg-gradient-to-r md:from-[#07150f]/78 md:via-[#07150f]/42 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f7f3ee] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-89px)] max-w-[1200px] items-end px-4 pb-10 pt-12 lg:min-h-[calc(100vh-105px)] lg:items-center lg:px-8 lg:py-16">
          <div className="max-w-[760px] text-white">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-white/25 bg-white/12 px-3 py-2 font-cera-pro text-sm font-bold text-white backdrop-blur-md">
              <CheckCircle2 size={18} aria-hidden="true" />
              Movimento de Co-criação da Nova Lovè
            </div>

            <h1 className="font-times text-[40px] font-bold leading-[1.03] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.35)] lg:text-[72px]">
              {variant.headline}
            </h1>

            <p className="mt-5 max-w-[620px] font-cera-pro text-lg font-light leading-[1.55] text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] lg:text-xl">
              {variant.subheadline}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#formulario"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 font-cera-pro text-base font-bold text-[#254333] shadow-lg shadow-black/20 transition hover:bg-[#f7f3ee]"
              >
                {ctaLabel}
                <ArrowRight size={20} aria-hidden="true" />
              </a>

              <a
                href="#movimento"
                className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-white/35 bg-white/10 px-6 py-4 font-cera-pro text-base font-bold text-white backdrop-blur-md transition hover:bg-white/18"
              >
                Entender o movimento
              </a>
            </div>

            <div className="mt-7 grid max-w-[520px] grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/20 bg-white/12 p-3 backdrop-blur-md">
                <p className="font-cera-pro text-xs font-light text-white/75">
                  Pesquisa
                </p>
                <p className="font-cera-pro text-sm font-bold">
                  Skincare e inovação
                </p>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/12 p-3 backdrop-blur-md">
                <p className="font-cera-pro text-xs font-light text-white/75">
                  Seleção
                </p>
                <p className="font-cera-pro text-sm font-bold">
                  Produto para testar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="movimento" className="border-y border-[#254333]/10 bg-white">
        <div className="mx-auto grid max-w-[1200px] gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="font-cera-pro text-sm font-bold uppercase tracking-[0.12em] text-[#a56c34]">
              Movimento
            </p>
            <h2 className="mt-3 font-times text-[32px] font-bold leading-[1.1] text-[#254333] lg:text-[46px]">
              Co-criando a Nova Lovè
            </h2>
          </div>

          <div className="grid gap-4 font-cera-pro text-base font-light leading-[1.7] text-[#40544b]">
            <p>
              Estamos construindo uma nova fase da Lovè e queremos ouvir
              pessoas que se importam com skincare, bem-estar e inovação.
            </p>
            <p>
              Participe da nossa pesquisa e ajude a construir a próxima geração
              de produtos da Lovè.
            </p>
            <p>
              Os participantes selecionados receberão um produto Lovè para
              testar e compartilhar sua opinião.
            </p>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-lg border border-[#254333]/12 bg-[#f7f3ee] p-4">
                <Users className="mb-3 text-[#254333]" size={24} aria-hidden="true" />
                <p className="font-cera-pro text-sm font-bold text-[#254333]">
                  Pesquisa com consumidoras reais
                </p>
              </div>
              <div className="rounded-lg border border-[#254333]/12 bg-[#f7f3ee] p-4">
                <Gift className="mb-3 text-[#a56c34]" size={24} aria-hidden="true" />
                <p className="font-cera-pro text-sm font-bold text-[#254333]">
                  Produto Lovè para selecionadas
                </p>
              </div>
              <div className="rounded-lg border border-[#254333]/12 bg-[#f7f3ee] p-4">
                <CheckCircle2 className="mb-3 text-[#2f7d58]" size={24} aria-hidden="true" />
                <p className="font-cera-pro text-sm font-bold text-[#254333]">
                  Opinião aplicada no desenvolvimento
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="formulario" className="mx-auto max-w-[980px] px-4 py-12 lg:px-8 lg:py-16">
        <div className="mb-8 text-center">
          <p className="font-cera-pro text-sm font-bold uppercase tracking-[0.12em] text-[#a56c34]">
            Pesquisa Lovè
          </p>
          <h2 className="mt-3 font-times text-[32px] font-bold leading-[1.1] text-[#254333] lg:text-[44px]">
            Quero participar da construção da Nova Lovè
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] font-cera-pro text-base font-light leading-[1.6] text-[#4d6258]">
            Responda as perguntas abaixo para participar da seleção e nos ajudar
            a entender qual narrativa faz mais sentido para você.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-lg border border-[#254333]/12 bg-white p-4 shadow-[0_18px_50px_rgba(37,67,51,0.10)] lg:p-8"
        >
          {submitted && (
            <div className="mb-6 rounded-lg border border-[#2f7d58]/25 bg-[#eaf6ef] p-4 font-cera-pro text-sm font-bold text-[#254333]">
              Cadastro recebido. Obrigado por participar da pesquisa da Nova
              Lovè.
            </div>
          )}

          <input type="hidden" name="landingVariant" value={variant.id} />

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
      </section>
    </main>
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
