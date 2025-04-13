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
        onClick={() => {
          // @ts-ignore
          const email = document.getElementById("emailInput")?.value;
          if (!email || !email.includes("@")) {
            alert("Por favor, insira um e-mail válido.");
            return;
          }

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "set_user_email",
            user_email: email,
          });

          // Substitua isso por uma chamada de API ou outra lógica
          console.log("Email enviado:", email);
          alert("Obrigado! Em breve você receberá nossas novidades.");
        }}
        className="mt-[20px] w-full rounded-[100px] bg-[#C0392B] px-[24px] py-[12px] text-center text-[14px] font-semibold text-[#fff]"
      >
        Quero receber novidades e promoções
      </button>
    </div>
  );
}
