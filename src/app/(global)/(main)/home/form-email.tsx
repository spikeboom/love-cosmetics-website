"use client";

import { useState } from "react";

async function hashSHA256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function pushUserDataToDataLayer({
  email,
  phone,
}: {
  email?: string;
  phone?: string;
}) {
  window.dataLayer = window.dataLayer || [];

  if (email) {
    const emailHash = await hashSHA256(email);
    window.dataLayer.push({
      event: "set_user_email",
      user_email: emailHash,
    });
  }

  if (phone) {
    const onlyDigits = phone.replace(/\D/g, "");
    const fullPhone = `55${onlyDigits}`;
    const phoneHash = await hashSHA256(fullPhone);
    window.dataLayer.push({
      event: "set_user_phone",
      user_phone: phoneHash,
    });
  }
}

export function FormEmailGTM() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="px-4">
      <input
        type="text"
        placeholder="Digite seu e-mail"
        className="mt-[60px] w-full rounded-[100px] border border-[#e5e7eb] bg-[#f1eaf5] px-[24px] py-[12px] text-center text-[14px] font-semibold placeholder:text-[#333333BF] focus:outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Digite seu telefone"
        className="mt-[20px] w-full rounded-[100px] border border-[#e5e7eb] bg-[#f1eaf5] px-[24px] py-[12px] text-center text-[14px] font-semibold placeholder:text-[#333333BF] focus:outline-none"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        onClick={async () => {
          const cleanedEmail = email.trim().toLowerCase();
          const cleanedPhone = phone.trim();

          if (!cleanedEmail && !cleanedPhone) {
            alert("Por favor, preencha pelo menos um dos campos.");
            return;
          }

          if (cleanedEmail && !cleanedEmail.includes("@")) {
            alert("Por favor, insira um e-mail válido.");
            return;
          }

          await pushUserDataToDataLayer({
            email: cleanedEmail || undefined,
            phone: cleanedPhone || undefined,
          });

          console.log("Email enviado:", cleanedEmail);
          console.log("Telefone enviado:", cleanedPhone);
          alert("Obrigado! Em breve você receberá nossas novidades.");
        }}
        className="mt-[20px] w-full rounded-[100px] bg-[#C0392B] px-[24px] py-[12px] text-center text-[14px] font-semibold text-[#fff]"
      >
        Quero receber novidades e promoções
      </button>
    </div>
  );
}
