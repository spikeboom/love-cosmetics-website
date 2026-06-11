"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

      <section className="relative w-full bg-white">
        <div className="lg:hidden">
          <div className="relative h-[234px] w-full overflow-hidden sm:h-[320px]">
            <Image
              src={variant.heroImage.mobile}
              alt={variant.heroImage.alt}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>

          <div className="flex flex-col gap-5 px-4 pb-8 pt-5">
            <div className="flex flex-col gap-4">
              <h1 className="font-times text-[32px] font-bold leading-none text-black">
                {variant.headline}
              </h1>
              <p className="font-cera-pro text-[15px] font-light leading-[1.55] text-[#40544b]">
                {variant.subheadline}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={formHref}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#254333] px-5 py-3 font-cera-pro text-sm font-bold leading-5 text-white transition hover:bg-[#1a3024]"
              >
                {ctaLabel}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative h-[534px] w-full">
            <div className="relative h-[500px] w-full overflow-hidden">
              <Image
                src={variant.heroImage.desktop}
                alt={variant.heroImage.alt}
                fill
                priority
                className="object-cover object-center"
                sizes="(min-width: 1440px) 1440px, 100vw"
              />
            </div>

            <div className="absolute right-[32px] top-[48px] flex w-[600px] max-w-[calc(100%-64px)] flex-col gap-5 bg-white/80 p-7 backdrop-blur-sm xl:right-[80px]">
              <div className="flex flex-col gap-5">
                <h1 className="font-times text-[52px] font-bold leading-none text-black">
                  {variant.headline}
                </h1>
                <p className="font-cera-pro text-[24px] font-light leading-[1.18] text-black">
                  {variant.subheadline}
                </p>
              </div>

              <div className="flex items-center gap-5">
                <Link
                  href={formHref}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#254333] px-6 py-4 font-cera-pro text-base font-normal leading-6 tracking-[0.15px] text-white transition hover:bg-[#1a3024]"
                >
                  {ctaLabel}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
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
          </div>
        </div>
      </section>
    </main>
  );
}
