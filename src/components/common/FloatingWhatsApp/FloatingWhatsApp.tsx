"use client";
import { FaWhatsapp } from "react-icons/fa6";
import { extractGaSessionData } from "@/utils/get-ga-cookie-info";

export function FloatingWhatsApp() {
  const handleWhatsAppClick = () => {
    // Tracking do evento de clique no WhatsApp
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "whatsapp_click",
        event_id: `whatsapp_click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        elemento_clicado: "floating_whatsapp_button",
        url_pagina: window.location.href,
        ...extractGaSessionData("G-SXLFK0Y830"),
      });
    }

    const message =
      "Olá! Gostaria de saber mais sobre os produtos Love Cosméticos.";
    const whatsappUrl = `https://wa.me/message/JPCGPYCZS7ENN1?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="z-99 fixed bottom-1 right-6 z-[1000] ml-1">
      {/* Botão principal */}
      <button
        onClick={handleWhatsAppClick}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
        aria-label="Falar no WhatsApp"
        title="Fale conosco no WhatsApp!"
      >
        <FaWhatsapp size={28} />
      </button>
    </div>
  );
}
