"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { ctaLabel, type LandingVariant } from "./content";
import {
  initLandingPostHog,
  trackLandingClientEvent,
  trackLandingVisit,
} from "@/lib/posthog/landing-client";
import type { LandingSiteProperties } from "@/lib/posthog/landing-experiment";

interface CoCriacaoLandingClientProps {
  variant: LandingVariant;
  formQueryString?: string;
  trackingContext?: {
    assignmentSource: string;
    distinctId?: string;
    pathname: string;
    siteProperties: LandingSiteProperties;
  };
}

export default function CoCriacaoLandingClient({
  variant,
  formQueryString,
  trackingContext,
}: CoCriacaoLandingClientProps) {
  const formHref = `/landing-pages/formulario?${formQueryString || `variant=${variant.id}`}`;

  useEffect(() => {
    if (!trackingContext) return;
    initLandingPostHog(trackingContext?.distinctId);
    trackLandingVisit({
      visitorId: trackingContext.distinctId,
      variant: variant.id,
      assignment_source: trackingContext.assignmentSource,
      pathname: trackingContext.pathname,
      ...trackingContext.siteProperties,
    });
  }, [trackingContext, variant.id]);

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1b1b1b]">
      <header className="w-full bg-[#254333]">
        <div className="relative flex h-[64px] w-full items-center justify-start px-4 py-0 lg:h-[120px] lg:px-[32px]">
          <Link
            href="/"
            className="relative h-[34px] w-[72px] shrink-0 lg:h-[67px] lg:w-[141px]"
          >
            <Image
              src="/landing-pages/logo-love-cosmeticos-amazonia.webp"
              alt="Love Cosméticos da Amazônia"
              priority
              className="object-contain"
              fill
              sizes="(max-width: 1024px) 72px, 141px"
            />
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

      <section className="bg-[#254333] px-4 py-10 lg:px-8 lg:py-14">
        <div className="mx-auto flex max-w-[1200px] justify-center">
          <Link
            href={formHref}
            onClick={() =>
              trackLandingClientEvent("landing_cta_clicked", {
                variant: variant.id,
                assignment_source: trackingContext?.assignmentSource,
                pathname: trackingContext?.pathname,
                destination: formHref,
                ...trackingContext?.siteProperties,
              })
            }
            className="inline-flex min-h-[56px] w-full max-w-[560px] items-center justify-center gap-2 rounded-lg bg-white px-5 py-4 text-center font-cera-pro text-sm font-bold leading-5 text-[#254333] transition hover:bg-[#f7f3ee] sm:text-base"
          >
            {ctaLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
