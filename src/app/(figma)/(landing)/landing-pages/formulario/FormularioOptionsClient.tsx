"use client";

import { ExternalLink, Palette, Sheet } from "lucide-react";
import { useEffect, useState } from "react";
import CoCriacaoFormClient from "./CoCriacaoFormClient";

const defaultGoogleFormViewUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSeKrVlVskWt-YYfFVMRZEMKGtoHpZe01st9f7q9JzTCeS0fRA/viewform?usp=publish-editor";
const defaultGoogleFormEmbedUrl =
  "https://docs.google.com/forms/d/e/1FAIpQLSeKrVlVskWt-YYfFVMRZEMKGtoHpZe01st9f7q9JzTCeS0fRA/viewform?embedded=true";

const googleFormEmbedUrl =
  process.env.NEXT_PUBLIC_COCREATE_GOOGLE_FORM_EMBED_URL ||
  defaultGoogleFormEmbedUrl;
const googleFormViewUrl =
  process.env.NEXT_PUBLIC_COCREATE_GOOGLE_FORM_VIEW_URL ||
  defaultGoogleFormViewUrl;

type FormMode = "love" | "google";

function getInitialMode(): FormMode {
  if (typeof window === "undefined") return "love";

  const mode = new URLSearchParams(window.location.search).get("mode");
  return mode === "google" ? "google" : "love";
}

export default function FormularioOptionsClient() {
  const [mode, setMode] = useState<FormMode>("love");
  const [googleUrlWithVariant, setGoogleUrlWithVariant] = useState("");

  useEffect(() => {
    setMode(getInitialMode());

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

  const selectMode = (nextMode: FormMode) => {
    setMode(nextMode);

    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    window.history.replaceState({}, "", url);
  };

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-lg border border-[#254333]/12 bg-white p-2 shadow-[0_12px_34px_rgba(37,67,51,0.08)] sm:grid-cols-2">
        <button
          type="button"
          onClick={() => selectMode("love")}
          className={`flex min-h-[72px] items-center gap-3 rounded-md px-4 py-3 text-left transition ${
            mode === "love"
              ? "bg-[#254333] text-white"
              : "bg-[#f7f3ee] text-[#254333] hover:bg-[#eef5f0]"
          }`}
        >
          <Palette size={22} aria-hidden="true" />
          <span>
            <span className="block font-cera-pro text-base font-bold">
              Formulário Lovè
            </span>
            <span className="block font-cera-pro text-sm font-light opacity-80">
              Visual 100% integrado à landing page
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => selectMode("google")}
          className={`flex min-h-[72px] items-center gap-3 rounded-md px-4 py-3 text-left transition ${
            mode === "google"
              ? "bg-[#254333] text-white"
              : "bg-[#f7f3ee] text-[#254333] hover:bg-[#eef5f0]"
          }`}
        >
          <Sheet size={22} aria-hidden="true" />
          <span>
            <span className="block font-cera-pro text-base font-bold">
              Google Forms
            </span>
            <span className="block font-cera-pro text-sm font-light opacity-80">
              UX pronta do Google e respostas centralizadas
            </span>
          </span>
        </button>
      </div>

      {mode === "love" ? (
        <CoCriacaoFormClient />
      ) : (
        <GoogleFormEmbed embedUrl={googleUrlWithVariant} viewUrl={googleFormViewUrl} />
      )}
    </div>
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
        <h2 className="text-xl font-bold">Google Forms pronto para conectar</h2>
        <p className="mt-2 text-sm font-light leading-[1.6]">
          Defina `NEXT_PUBLIC_COCREATE_GOOGLE_FORM_EMBED_URL` com o link de
          incorporação do Google Forms para comparar as duas experiências nesta
          mesma página.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#254333]/12 bg-white shadow-[0_18px_50px_rgba(37,67,51,0.10)]">
      <div className="flex flex-col gap-3 border-b border-[#254333]/10 bg-[#fbfaf8] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-cera-pro text-sm font-light text-[#4d6258]">
          Versão Google Forms incorporada para teste com a equipe.
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
        className="h-[1280px] w-full border-0"
      >
        Carregando…
      </iframe>
    </div>
  );
}
