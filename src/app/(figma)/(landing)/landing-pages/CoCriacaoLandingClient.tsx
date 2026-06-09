"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Gift, Users } from "lucide-react";
import { ctaLabel, type LandingVariant } from "./content";

interface CoCriacaoLandingClientProps {
  variant: LandingVariant;
}

export default function CoCriacaoLandingClient({
  variant,
}: CoCriacaoLandingClientProps) {
  const formHref = `/landing-pages/formulario?variant=${variant.id}`;

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

          <Link
            href={formHref}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 font-cera-pro text-sm font-bold text-[#254333] transition hover:bg-[#f7f3ee]"
          >
            Participar
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
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
              <Link
                href={formHref}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 font-cera-pro text-base font-bold text-[#254333] shadow-lg shadow-black/20 transition hover:bg-[#f7f3ee]"
              >
                {ctaLabel}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>

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

      <section className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-lg bg-[#254333] p-6 text-white lg:flex-row lg:items-center lg:p-8">
          <div>
            <p className="font-cera-pro text-sm font-bold uppercase tracking-[0.12em] text-white/65">
              Pesquisa Lovè
            </p>
            <h2 className="mt-2 font-times text-[30px] font-bold leading-[1.1] lg:text-[42px]">
              Participe da construção da Nova Lovè
            </h2>
          </div>

          <Link
            href={formHref}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 font-cera-pro text-base font-bold text-[#254333] transition hover:bg-[#f7f3ee]"
          >
            Responder pesquisa
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
