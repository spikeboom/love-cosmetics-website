"use client";

import Image from "next/image";
import Link from "next/link";

const VIP_WHATSAPP_LINK = "https://chat.whatsapp.com/Iqyoy119JuzBtHNDoJkmgK";

interface Produto {
  nome: string;
  descricao?: string;
  imagem?: string;
  slug?: string;
}

interface VIPSimplesClientProps {
  produtos: Produto[];
}

export default function VIPSimplesClient({ produtos }: VIPSimplesClientProps) {
  return (
    <div className="min-h-screen w-full bg-[#f6f4f1] flex flex-col">
      {/* Header com Logo */}
      <header className="w-full bg-[#254333] py-4 lg:py-6">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-12 flex justify-center">
          <Link href="/">
            <Image
              src="/new-home/header/logo.png"
              alt="Lovè Cosméticos"
              width={100}
              height={80}
              className="lg:w-[120px] lg:h-[96px] w-[80px] h-[64px] object-contain"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 px-4 py-8 lg:py-16">
        <div className="max-w-[700px] mx-auto flex flex-col items-center text-center">
          {/* Descrição Breve e Atrativa */}
          <h1 className="font-times font-bold text-[28px] lg:text-[40px] text-[#254333] leading-[1.2] mb-6">
            Entre para o Grupo VIP Lovè
          </h1>

          <p className="font-cera-pro font-light text-base lg:text-lg text-[#5a6a64] leading-relaxed mb-6 max-w-[540px]">
            Receba em primeira mão <strong className="text-[#254333]">lançamentos</strong>,{" "}
            <strong className="text-[#254333]">ofertas exclusivas</strong>,{" "}
            <strong className="text-[#254333]">dicas das nossas especialistas</strong> e muito mais.
          </p>

          <p className="font-cera-pro font-light text-base lg:text-lg text-[#5a6a64] leading-relaxed mb-8 max-w-[540px]">
            Descubra uma nova geração de cosméticos que une ciência, ativos amazônicos e um
            propósito verdadeiro:{" "}
            <strong className="text-[#254333]">cuidar de você e da floresta</strong>.
          </p>

          {/* Botão CTA */}
          <Link
            href={VIP_WHATSAPP_LINK}
            target="_blank"
            className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-[#254333] text-white font-roboto font-bold text-lg hover:bg-[#1a3024] transition-all shadow-lg shadow-[#254333]/25 mb-10"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="flex-shrink-0"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Quero fazer parte do VIP
          </Link>

          {/* Vitrine de Produtos */}
          <div className="w-full max-w-[900px]">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {produtos.slice(0, 5).map((p, index) => (
                <div
                  key={p.slug || index}
                  className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]"
                >
                  <div className="h-[140px] lg:h-[160px] bg-gradient-to-b from-[#254333]/10 to-transparent relative overflow-hidden">
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
                    <p className="font-cera-pro font-medium text-[14px] text-black leading-normal line-clamp-2">
                      {p.nome}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nota de Transparência */}
          <p className="font-cera-pro text-sm text-[#5a6a64] mt-10">
            <strong className="text-[#254333]">Gratuito</strong> · Sem spam · Você pode sair quando quiser
          </p>
        </div>
      </main>
    </div>
  );
}
