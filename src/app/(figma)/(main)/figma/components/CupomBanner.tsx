"use client";

import { useState } from "react";

export function CupomBanner() {
  const [copied, setCopied] = useState(false);
  const cupom = "BEMVINDOLOVE15";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cupom);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = cupom;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#254333] py-2.5 px-3 lg:py-3 lg:px-4">
      <div className="flex items-center justify-center gap-1.5">
        <span className="font-cera-pro text-white text-xs lg:text-base whitespace-nowrap">
          <strong className="font-bold">15% OFF</strong> primeira compra
        </span>
        <button
          onClick={handleCopy}
          className="font-cera-pro font-bold text-white text-xs lg:text-base cursor-pointer hover:opacity-80 transition-opacity"
        >
          {copied ? "Copiado!" : cupom}
        </button>
      </div>
    </div>
  );
}
