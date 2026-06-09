import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CoCriacaoFormClient from "./CoCriacaoFormClient";

export const metadata: Metadata = {
  title: "Pesquisa Nova Lovè",
  description:
    "Formulário de participação na pesquisa de co-criação da Nova Lovè.",
};

export default function FormularioLandingPagesPage() {
  return (
    <main className="min-h-screen bg-[#f7f3ee] text-[#1b1b1b]">
      <header className="bg-[#254333]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-center px-4 py-5 lg:px-8">
          <Link href="/landing-pages" className="inline-flex">
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

      <section className="mx-auto max-w-[980px] px-4 py-12 lg:px-8 lg:py-16">
        <div className="mb-8 text-center">
          <p className="font-cera-pro text-sm font-bold uppercase tracking-[0.12em] text-[#a56c34]">
            Pesquisa Lovè
          </p>
          <h1 className="mt-3 font-times text-[34px] font-bold leading-[1.1] text-[#254333] lg:text-[48px]">
            Quero participar da construção da Nova Lovè
          </h1>
          <p className="mx-auto mt-4 max-w-[640px] font-cera-pro text-base font-light leading-[1.6] text-[#4d6258]">
            Responda as perguntas abaixo para participar da seleção e nos ajudar
            a entender qual narrativa faz mais sentido para você.
          </p>
        </div>

        <CoCriacaoFormClient />
      </section>
    </main>
  );
}
