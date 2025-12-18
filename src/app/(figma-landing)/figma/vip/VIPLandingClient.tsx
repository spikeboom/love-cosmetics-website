"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Link direto para o grupo VIP do WhatsApp
const VIP_WHATSAPP_LINK = "https://chat.whatsapp.com/Iqyoy119JuzBtHNDoJkmgK";

const beneficios = [
  {
    icon: "lightning",
    title: "Lançamentos primeiro",
    description: "Fique por dentro antes - com acesso e avisos em primeira mão.",
  },
  {
    icon: "gift",
    title: "Kits & condições",
    description: "Condições especiais e campanhas exclusivas para membros do VIP.",
  },
  {
    icon: "compass",
    title: "Rotina guiada",
    description: "Conteúdo prático para montar rotina (dia/noite) e melhorar resultados.",
  },
  {
    icon: "chat",
    title: "Direto no WhatsApp",
    description: "Você recebe no celular - sem precisar ficar procurando informação.",
  },
];

const diferenciais = [
  {
    title: "Nanotecnologia + bioativos amazônicos",
    description: "Tecnologia avançada aplicada a ativos da Amazônia para potencializar eficácia, absorção e resultados visíveis.",
  },
  {
    title: "Sustentabilidade real e floresta em pé",
    description: "Valorizamos a bioeconomia amazônica com impacto positivo, respeito à floresta e às comunidades locais.",
  },
  {
    title: "Alta performance com foco em resultado",
    description: "Formulações pensadas para entregar benefícios reais no cuidado diário, sem promessas vazias.",
  },
  {
    title: "Premium consciente, com essência amazônica",
    description: "Experiência sofisticada que une qualidade, propósito e identidade amazônica em cada detalhe.",
  },
];

const passos = [
  { numero: "1", title: "Clique no botão", description: "Você será direcionado para o WhatsApp com o convite do VIP." },
  { numero: "2", title: "Entre no grupo", description: "Confirme a entrada no grupo VIP oficial da Lovè." },
  { numero: "3", title: "Receba no WhatsApp", description: "Novidades, campanhas e rotinas guiadas (sem textão)." },
  { numero: "✓", title: "Pronto", description: "É gratuito e você pode sair quando quiser." },
];

const faqs = [
  {
    pergunta: "O VIP é gratuito?",
    resposta: "Sim. O Grupo VIP é um canal gratuito para receber novidades, campanhas e conteúdos. Se quiser sair, é só sair do grupo.",
  },
  {
    pergunta: "Vou receber muito spam?",
    resposta: "A proposta é ser objetivo: avisos curtos e úteis, sem excesso. Você controla as notificações do WhatsApp.",
  },
  {
    pergunta: "Como descubro a rotina ideal?",
    resposta: "No VIP você recebe orientações por tipo de pele e sugestões de rotina (dia/noite). Se quiser, pode mandar mensagem e pedir direcionamento.",
  },
];

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

function IconBox({ icon }: { icon: string }) {
  const icons: Record<string, string> = {
    lightning: "⚡",
    gift: "🎁",
    compass: "🧭",
    chat: "💬",
    leaf: "🌿",
    globe: "🌎",
    handshake: "🤝",
    chart: "📈",
  };

  return (
    <div className="w-[42px] h-[42px] rounded-2xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-lg">
      {icons[icon] || "✓"}
    </div>
  );
}

function CTAButton({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
  return (
    <Link
      href={VIP_WHATSAPP_LINK}
      target="_blank"
      className={`
        inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-roboto font-medium text-base transition-all
        ${secondary
          ? "bg-transparent text-[#254333] border border-[#254333]/20 hover:bg-[#254333]/5"
          : "bg-[#254333] text-white hover:bg-[#1a3024] shadow-lg shadow-[#254333]/20"
        }
      `}
    >
      {children}
    </Link>
  );
}

function Pill({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-cera-pro font-medium
      ${accent
        ? "bg-[#d4b56a]/20 border border-[#d4b56a]/40 text-[#254333]"
        : "bg-white/70 border border-black/10 text-[#5a6a64]"
      }
    `}>
      {accent && <span className="w-2 h-2 rounded-full bg-[#d4b56a] shadow-[0_0_0_4px_rgba(212,181,106,0.18)]" />}
      {children}
    </span>
  );
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
              alt="Lové Cosméticos"
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
              <Pill>Skincare premium amazônico</Pill>
            </div>

            {/* Título */}
            <h1 className="font-times font-bold text-[32px] lg:text-[48px] text-black leading-[1.1] mt-6 max-w-[700px]">
              Grupo VIP Lovè: alta performance com a essência da Amazônia
            </h1>

            {/* Descrição */}
            <p className="font-cera-pro font-light text-base lg:text-lg text-[#5a6a64] mt-4 max-w-[600px]">
              Entre no VIP e receba <strong className="text-black">lançamentos</strong>, <strong className="text-black">kits</strong>, condições especiais e uma rotina guiada - tudo direto no WhatsApp.
            </p>

            {/* Bullets - 3 colunas no desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 w-full max-w-[900px]">
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/70 border border-black/10">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-[#254333] font-bold text-lg mb-3">
                  ✓
                </div>
                <span className="font-cera-pro font-bold text-black">Acesso antecipado</span>
                <p className="font-cera-pro font-light text-sm text-[#5a6a64] mt-1">Seja o(a) primeiro(a) a saber de lançamentos.</p>
              </div>
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/70 border border-black/10">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-[#254333] font-bold text-lg mb-3">
                  ★
                </div>
                <span className="font-cera-pro font-bold text-black">Benefícios exclusivos</span>
                <p className="font-cera-pro font-light text-sm text-[#5a6a64] mt-1">Kits e condições especiais para membros VIP.</p>
              </div>
              <div className="flex flex-col items-center p-5 rounded-2xl bg-white/70 border border-black/10">
                <div className="w-[42px] h-[42px] rounded-xl bg-[#254333]/10 border border-[#254333]/20 flex items-center justify-center text-[#254333] font-bold text-lg mb-3">
                  ☘
                </div>
                <span className="font-cera-pro font-bold text-black">Rotina sem complicação</span>
                <p className="font-cera-pro font-light text-sm text-[#5a6a64] mt-1">Recomendações rápidas para sua pele.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex justify-center mt-8">
              <CTAButton>Quero entrar no Grupo VIP →</CTAButton>
            </div>

            <p className="font-cera-pro text-sm text-[#5a6a64] mt-4">
              <strong className="text-black">Sem spam.</strong> Você pode sair quando quiser.
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
                  Não testamos em animais
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">Por que entrar no VIP?</h2>
            <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2 max-w-[74ch]">
              Um canal direto, rápido e exclusivo para você receber novidades, kits e recomendações sem ruído.
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

      {/* Diferenciais - O Novo Premium Amazônico */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="mb-6">
          <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">O novo premium amazônico</h2>
          <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2 max-w-[74ch]">
            Tecnologia, ciência e biodiversidade amazônica para performance real.
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
              Tecnologia + Amazônia, com resultados que você sente
            </h3>
            <p className="font-cera-pro font-light text-sm text-[#5a6a64]">
              Uma nova geração de cosméticos que une ciência, ativos amazônicos e propósito real para cuidar de você e da floresta.
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
            Uma seleção do portfólio atual para você conhecer a proposta Lovè.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {produtos.slice(0, 5).map((p, index) => (
            <div
              key={p.slug || index}
              className="bg-white/80 border border-black/10 rounded-[18px] overflow-hidden shadow-[0_10px_22px_rgba(15,26,22,0.05)]"
            >
              <div className="h-[120px] bg-gradient-to-b from-[#254333]/10 to-transparent border-b border-black/10 relative overflow-hidden">
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
              <div className="p-3">
                <strong className="font-cera-pro font-bold text-sm text-black block">{p.nome}</strong>
                <span className="font-cera-pro font-light text-xs text-[#5a6a64] mt-1 block">{p.descricao}</span>
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
            Em 3 passos simples, você entra e já começa a receber benefícios e novidades.
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
          <CTAButton>Entrar no Grupo VIP Lovè →</CTAButton>
          <Pill accent>Gratuito - Sem spam - Cancelamento fácil</Pill>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 lg:px-12 py-8">
        <div className="mb-6">
          <h2 className="font-times font-bold text-[28px] lg:text-[36px] text-black leading-[1.1]">Perguntas rápidas</h2>
          <p className="font-cera-pro font-light text-base text-[#5a6a64] mt-2">
            Transparência total - para você entrar com segurança.
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
              Pronto para fazer parte do VIP Lovè?
            </h2>
            <p className="font-cera-pro font-light text-base text-white/80 mt-4 max-w-[50ch] mx-auto">
              Entre agora e receba lançamentos, kits exclusivos e recomendações personalizadas direto no seu WhatsApp.
            </p>
            <div className="flex justify-center mt-6">
              <Link
                href={VIP_WHATSAPP_LINK}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl bg-white text-[#254333] font-roboto font-bold text-lg hover:bg-[#f8f3ed] transition-all shadow-lg"
              >
                Entrar no Grupo VIP Lovè →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
