"use client";

export function FormEmailGTM() {
  return (
    <div className="px-4">
      <input
        type="text"
        id="emailInput"
        placeholder="Digite seu e-mail"
        className="mt-[60px] w-full rounded-[100px] border border-[#e5e7eb] bg-[#f1eaf5] px-[24px] py-[12px] text-center text-[14px] font-semibold placeholder:text-[#333333BF] focus:outline-none"
      />
      <button
        onClick={async () => {
          const rawEmail = document
            .getElementById("emailInput")
            // @ts-ignore
            ?.value.trim()
            .toLowerCase();
          if (!rawEmail || !rawEmail.includes("@")) {
            alert("Por favor, insira um e-mail válido.");
            return;
          }

          const encoder = new TextEncoder();
          const data = encoder.encode(rawEmail);
          const hashBuffer = await crypto.subtle.digest("SHA-256", data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "set_user_email",
            user_email: hashHex,
          });

          // Substitua isso por uma chamada de API ou outra lógica
          console.log("Email enviado:", rawEmail);
          alert("Obrigado! Em breve você receberá nossas novidades.");
        }}
        className="mt-[20px] w-full rounded-[100px] bg-[#C0392B] px-[24px] py-[12px] text-center text-[14px] font-semibold text-[#fff]"
      >
        Quero receber novidades e promoções
      </button>
    </div>
  );
}
