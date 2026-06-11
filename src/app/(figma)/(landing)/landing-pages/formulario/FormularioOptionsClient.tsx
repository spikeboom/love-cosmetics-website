"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

const defaultGoogleFormViewUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSeKrVlVskWt-YYfFVMRZEMKGtoHpZe01st9f7q9JzTCeS0fRA/viewform?usp=header";
const defaultGoogleFormEmbedUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSeKrVlVskWt-YYfFVMRZEMKGtoHpZe01st9f7q9JzTCeS0fRA/viewform?embedded=true";

const googleFormEmbedUrl =
  process.env.NEXT_PUBLIC_COCREATE_GOOGLE_FORM_EMBED_URL ||
  defaultGoogleFormEmbedUrl;
const googleFormViewUrl =
  process.env.NEXT_PUBLIC_COCREATE_GOOGLE_FORM_VIEW_URL ||
  defaultGoogleFormViewUrl;

export default function FormularioOptionsClient() {
  const [googleUrlWithVariant, setGoogleUrlWithVariant] = useState("");

  useEffect(() => {
    if (!googleFormEmbedUrl) {
      setGoogleUrlWithVariant("");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const variant = params.get("variant");
    const url = new URL(googleFormEmbedUrl);

    if (variant) {
      url.searchParams.set("usp", "pp_url");
    }

    setGoogleUrlWithVariant(url.toString());
  }, []);

  return (
    <GoogleFormEmbed
      embedUrl={googleUrlWithVariant}
      viewUrl={googleFormViewUrl}
    />
  );
}

function GoogleFormEmbed({
  embedUrl,
  viewUrl,
}: {
  embedUrl?: string;
  viewUrl?: string;
}) {
  if (!embedUrl) {
    return (
      <div className="rounded-lg border border-[#d7b46a]/35 bg-[#fff8e8] p-6 font-cera-pro text-[#254333]">
        <h2 className="text-xl font-bold">Google Forms não configurado</h2>
        <p className="mt-2 text-sm font-light leading-[1.6]">
          Defina `NEXT_PUBLIC_COCREATE_GOOGLE_FORM_EMBED_URL` com o link de
          incorporação do Google Forms.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#254333]/12 bg-white shadow-[0_18px_50px_rgba(37,67,51,0.10)]">
      <div className="flex flex-col gap-3 border-b border-[#254333]/10 bg-[#fbfaf8] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-cera-pro text-sm font-light text-[#4d6258]">
          Formulário oficial Google Forms da pesquisa Nova Lovè.
        </p>

        {viewUrl && (
          <a
            href={viewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-cera-pro text-sm font-bold text-[#254333]"
          >
            Abrir em nova aba
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        )}
      </div>

      <iframe
        src={embedUrl}
        title="Formulário Google Forms da pesquisa Nova Lovè"
        className="h-[1680px] w-full border-0"
      >
        Carregando...
      </iframe>
    </div>
  );
}
