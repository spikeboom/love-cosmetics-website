"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IconBox, CTAButton, Pill } from "./components";
import {
  VIP_WHATSAPP_LINK,
  beneficios,
  diferenciais,
  passos,
  faqs,
} from "./vip-content";

interface Produto {
  nome: string;
  descricao?: string;
  imagem?: string;
  preco?: number;
  slug?: string;
}

interface VIPLandingClientProps {
  produtos: Produto[];
}

export default function VIPLandingClient({ produtos }: VIPLandingClientProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full bg-[#f6f4f1]">
      {/* Logo Header */}
      <header className="w-full bg-[#254333] py-4 lg:py-6">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-12 flex justify-center">
          <Link href="/figma/design">
            <Image
              src="/new-home/header/logo.png"
              alt="Love Cosmeticos"
              width={100}
              height={80}
              className="lg:w-[120px] lg:h-[96px] w-[80px] h-[64px] object-contain"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8 lg:py-12">
        <div className="rounded-[26px] bg-gradient-to-br from-white/90 to-white/70 border border-black/10 shadow-[0_16px_40px_rgba(15,26,22,0.08)] overflow-hidden relative">
          {/* Gradients decorativos */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_85%_0%,rgba(31,63,54,0.14),transparent_60%)]" />
            <div className="absolute top-0 left-0 w-[600px] h-[360px] bg-[radial-gradient(ellipse_at_10%_15%,rgba(212,181,106,0.14),transparent_65%)]" />
          </div>

          <div className="relative p-6 lg:p-10 flex flex-col items-center text-center">
            {/* Pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Pill accent>Convite gratuito - WhatsApp</Pill>
              <Pill>Skincare premium amazonico</Pill>
            </div>

            {/* Titulo */}
            <h1 className="font-times font-bold text-[32px] lg:text-[48px] text-black leading-[1.1] mt-6 max-w-[700px]">
              Grupo VIP Love: alta performance com a essencia da Amazonia
            </h1>

            {/* Descricao */}
            <p className="font-cera-pro font-light text-base lg:text-lg text-[#5a6a64] mt-4 max-w-[600px]">
              Entre no VIP e receba <strong className="text-black">lancamentos</strong>, <strong className="text-black">kits</strong>, condicoes especiais e uma rotina guiada - tudo direto no WhatsApp.
            </p>

            {/* Bullets - 3 colunas no desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 w-full max-w-[900px]">
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/70 border border-black/10">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-[#254333] font-bold text-lg mb-3">
                  ✓
                </div>
                <span className="font-cera-pro font-bold text-black">Acesso antecipado</span>
                <p className="font-cera-pro font-light text-sm text-[#5a6a64] mt-1">Seja o(a) primeiro(a) a saber de lancamentos.</p>
              </div>
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/70 border border-black/10">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-[#254333] font-bold text-lg mb-3">
                  ★
                </div>
                <span className="font-cera-pro font-bold text-black">Beneficios exclusivos</span>
                <p className="font-cera-pro font-light text-sm text-[#5a6a64] mt-1">Kits e condicoes especiais para membros VIP.</p>
              </div>
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/70 border border-black/10">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-[#254333] font-bold text-lg mb-3">
                  ☘
                </div>
                <span className="font-cera-pro font-bold text-black">Rotina sem complicacao</span>
                <p className="font-cera-pro font-light text-sm text-[#5a6a64] mt-1">Recomendacoes rapidas para sua pele.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center mt-8">
              <CTAButton>Quero entrar no Grupo VIP →</CTAButton>
            </div>

            <p className="font-cera-pro text-sm text-[#5a6a64] mt-4">
              <strong className="text-black">Sem spam.</strong> Voce pode sair quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* Barra de Selos */}
      <div className="w-full bg-[#f8f3ed] py-4 lg:py-6">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-12 flex flex-wrap items-center justify-center gap-4 lg:gap-6">
          {/* Card Anvisa */}
          <div className="flex items-center w-full sm:w-auto sm:min-w-[280px] h-[64px] bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="flex-1 flex items-center gap-3 h-full px-4">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                <Image
                  src="/new-home/icons/verified-green.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-[#1d1b20] leading-tight">
                  Certificado
                </p>
                <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20] leading-tight">
                  Pela Anvisa
                </p>
              </div>
            </div>
            <div className="relative w-16 lg:w-20 h-full shrink-0">
              <Image
                src="/new-home/certificados/cert-anvisa.png"
                alt=""
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Card Cruelty Free */}
          <div className="flex items-center w-full sm:w-auto sm:min-w-[280px] h-[64px] bg-white rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="flex-1 flex items-center gap-3 h-full px-4">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center text-2xl">
                🐰
              </div>
              <div className="flex flex-col">
                <p className="font-cera-pro font-bold text-[16px] lg:text-[18px] text-[#1d1b20] leading-tight">
                  Cruelty Free
                </p>
                <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20] leading-tight">
                  Nao testamos em animais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">Por que entrar no VIP?</h2>
            <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2 max-w-[74ch]">
              Um canal direto, rapido e exclusivo para voce receber novidades, kits e recomendacoes sem ruido.
            </p>
          </div>
          <CTAButton secondary>Entrar agora →</CTAButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {beneficios.map((b) => (
            <div key={b.title} className="bg-white/80 border border-black/10 rounded-[18px] shadow-[0_10px_26px_rgba(15,26,22,0.05)] p-5">
              <IconBox icon={b.icon} />
              <h3 className="font-cera-pro font-bold text-base text-black mt-3 mb-2">{b.title}</h3>
              <p className="font-cera-pro font-light text-sm text-[#5a6a64]">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Diferenciais - O Novo Premium Amazonico */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="mb-6">
          <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">O novo premium amazonico</h2>
          <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2 max-w-[74ch]">
            Tecnologia, ciencia e biodiversidade amazonica para performance real.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white/70 border border-black/10 rounded-[18px] p-5 flex flex-col gap-3">
            {diferenciais.map((d) => (
              <div key={d.title} className="flex gap-3 items-start">
                <div className="w-[22px] h-[22px] rounded-[10px] bg-[#d4b56a]/20 border border-[#d4b56a]/40 flex items-center justify-center text-[#254333] font-bold text-xs flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <strong className="font-cera-pro font-bold text-black block">{d.title}</strong>
                  <span className="font-cera-pro font-light text-sm text-[#5a6a64]">{d.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/80 border border-black/10 rounded-[18px] shadow-[0_10px_26px_rgba(15,26,22,0.05)] p-6">
            <h3 className="font-cera-pro font-bold text-lg text-black mb-2">
              Tecnologia + Amazonia, com resultados que voce sente
            </h3>
            <p className="font-cera-pro font-light text-sm text-[#5a6a64]">
              Uma nova geracao de cosmeticos que une ciencia, ativos amazonicos e proposito real para cuidar de voce e da floresta.
            </p>
            <div className="flex mt-5">
              <CTAButton>Entrar no Grupo VIP →</CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="mb-6">
          <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">Produtos em destaque</h2>
          <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2 max-w-[74ch]">
            Uma selecao do portfolio atual para voce conhecer a proposta Love.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {produtos.slice(0, 5).map((p, index) => (
            <div
              key={p.slug || index}
              className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]"
            >
              <div className="h-[160px] lg:h-[196px] bg-gradient-to-b from-[#254333]/10 to-transparent relative overflow-hidden">
                {p.imagem ? (
                  <Image
                    src={p.imagem}
                    alt={p.nome}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(31,63,54,0.16),transparent_60%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_25%,rgba(212,181,106,0.16),transparent_60%)]" />
                  </>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3">
                <p className="font-cera-pro font-medium text-[16px] text-black leading-normal">{p.nome}</p>
                <p className="font-cera-pro font-light text-[14px] text-black leading-normal line-clamp-3">{p.descricao}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-5">
          <CTAButton>Entrar no VIP e receber minha rotina →</CTAButton>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como" className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="mb-6">
          <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">Como funciona o Grupo VIP</h2>
          <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2 max-w-[74ch]">
            Em 3 passos simples, voce entra e ja comeca a receber beneficios e novidades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {passos.map((p) => (
            <div key={p.numero} className="bg-white/80 border border-black/10 rounded-[18px] shadow-[0_10px_26px_rgba(15,26,22,0.05)] p-5">
              <div className="w-[42px] h-[42px] rounded-2xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-[#254333] font-cera-pro font-bold text-lg">
                {p.numero}
              </div>
              <h3 className="font-cera-pro font-bold text-base text-black mt-3 mb-2">{p.title}</h3>
              <p className="font-cera-pro font-light text-sm text-[#5a6a64]">{p.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
          <CTAButton>Entrar no Grupo VIP Love →</CTAButton>
          <Pill accent>Gratuito - Sem spam - Cancelamento facil</Pill>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="mb-6">
          <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">Perguntas rapidas</h2>
          <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2">
            Transparencia total - para voce entrar com seguranca.
          </p>
        </div>

        <div className="flex flex-col gap-3 max-w-[820px]">
          {faqs.map((faq, index) => (
            <div
              key={faq.pergunta}
              className="bg-white/80 border border-black/10 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-4 text-left font-cera-pro font-bold text-black flex items-center justify-between"
              >
                {faq.pergunta}
                <span className="text-[#5a6a64] text-lg">{openFaq === index ? "−" : "+"}</span>
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4">
                  <p className="font-cera-pro font-light text-sm text-[#5a6a64]">{faq.resposta}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-12">
        <div className="rounded-[26px] bg-gradient-to-br from-[#254333] to-[#16332b] border border-white/15 p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,181,106,0.15),transparent_70%)]" />

          <div className="relative">
            <h2 className="font-times font-bold text-[28px] lg:text-[40px] text-white leading-[1.1] max-w-[600px] mx-auto">
              Pronto para fazer parte do VIP Love?
            </h2>
            <p className="font-cera-pro font-light text-base text-white/80 mt-4 max-w-[50ch] mx-auto">
              Entre agora e receba lancamentos, kits exclusivos e recomendacoes personalizadas direto no seu WhatsApp.
            </p>
            <div className="flex justify-center mt-6">
              <Link
                href={VIP_WHATSAPP_LINK}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-white text-[#254333] font-roboto font-bold text-lg hover:bg-[#f8f3ed] transition-all shadow-lg"
              >
                Entrar no Grupo VIP Love →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
