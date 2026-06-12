import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { landingVariants } from "./content";

export const metadata: Metadata = {
  title: "Landing Pages Nova Lovè",
  description:
    "Índice das três variações de landing page para validação de narrativa da Nova Lovè.",
};

export default function LandingPagesIndex() {
  const variants = Object.values(landingVariants);

  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1b1b1b]">
      <header className="bg-[#254333]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-center px-4 py-5 lg:px-8">
          <Link href="/" className="inline-flex">
            <Image
              src="/new-home/header/logo.png"
              alt="Lovè Cosméticos"
              width={92}
              height={74}
              priority
              className="h-[64px] w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-4 py-10 lg:px-8 lg:py-14">
        <div className="mb-8 max-w-[720px]">
          <p className="font-cera-pro text-sm font-bold uppercase tracking-[0.12em] text-[#a56c34]">
            Validação de hipótese
          </p>
          <h1 className="mt-3 font-times text-[38px] font-bold leading-[1.05] text-[#254333] lg:text-[58px]">
            Escolha uma landing page da Nova Lovè
          </h1>
          <p className="mt-4 font-cera-pro text-base font-light leading-[1.6] text-[#4d6258] lg:text-lg">
            As três páginas mantêm a mesma estrutura e formulário. O que muda é
            a proposta de valor do hero para medir qual narrativa gera mais
            interesse.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {variants.map((variant) => (
            <Link
              key={variant.id}
              href={`/landing-pages/${variant.slug}`}
              className="group overflow-hidden rounded-lg border border-[#254333]/12 bg-white shadow-[0_16px_42px_rgba(37,67,51,0.10)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(37,67,51,0.16)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={variant.heroImage.desktop}
                  alt={variant.heroImage.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07150f]/78 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-2 font-cera-pro text-sm font-bold text-[#254333]">
                  {variant.label}
                </span>
              </div>

              <div className="p-5">
                <h2 className="font-times text-[26px] font-bold leading-[1.1] text-[#254333]">
                  {variant.headline}
                </h2>
                <p className="mt-3 min-h-[78px] font-cera-pro text-sm font-light leading-[1.55] text-[#4d6258]">
                  {variant.subheadline}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-cera-pro text-sm font-bold text-[#254333]">
                  Abrir landing page
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
