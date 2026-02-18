"use client";

import { useState } from "react";

export function CupomBanner() {
  const [copied, setCopied] = useState(false);
  const cupom = "BEMVINDOLOVE15";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cupom);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = cupom;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-[#254333] py-3 px-4">
      <div className="flex flex-col items-center justify-center gap-1.5 lg:flex-row lg:gap-1">
        <span className="font-cera-pro text-white text-sm lg:text-base whitespace-nowrap">
          Primeira compra?{" "}
          <strong className="font-bold">15% OFF</strong>
          {" "}com o cupom
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 bg-white/15 rounded px-2 py-0.5 cursor-pointer hover:bg-white/25 transition-colors"
          aria-label="Copiar cupom"
        >
          <span className="font-cera-pro font-bold text-white text-sm lg:text-base">
            {cupom}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            {copied ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
