"use client";
import { FaWhatsapp } from "react-icons/fa6";
import { waitForGTMReady } from "@/utils/gtm-ready-helper";

export function FloatingWhatsApp({ bottomPx = 140 }: { bottomPx?: number }) {
  const handleClick = async () => {
    if (typeof window !== "undefined") {
      const gaData = await waitForGTMReady();
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "whatsapp_click",
        event_id: `whatsapp_click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        elemento_clicado: "floating_whatsapp_button",
        url_pagina: window.location.href,
        ...gaData,
      });
    }
    const message = "Olá! Gostaria de saber mais sobre os produtos Love Cosméticos.";
    window.open(
      `https://wa.me/message/JPCGPYCZS7ENN1?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: `${bottomPx}px`,
        right: "24px",
        left: "auto",
        zIndex: 1000,
      }}
    >
      <button
        onClick={handleClick}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "9999px",
          backgroundColor: "#22c55e",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          transition: "transform 0.2s, background-color 0.2s",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#16a34a";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#22c55e";
          e.currentTarget.style.transform = "scale(1)";
        }}
        aria-label="Falar no WhatsApp"
        title="Fale conosco no WhatsApp!"
      >
        <FaWhatsapp size={28} />
      </button>
    </div>
  );
}
