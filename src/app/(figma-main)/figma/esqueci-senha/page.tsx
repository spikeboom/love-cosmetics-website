"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Funcao para formatar CPF
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

export default function EsqueciSenhaPage() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [telefoneMascarado, setTelefoneMascarado] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [etapa, setEtapa] = useState<"cpf" | "confirmar">("cpf");

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  // Buscar telefone pelo CPF
  const handleBuscarTelefone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      setError("CPF deve ter 11 dígitos");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cliente/auth/buscar-telefone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfLimpo }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "CPF não encontrado");
        return;
      }

      setTelefoneMascarado(result.telefoneMascarado);
      setEtapa("confirmar");

    } catch {
      setError("Erro ao buscar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar e ir para tela de código
  const handleConfirmar = () => {
    const cpfLimpo = cpf.replace(/\D/g, "");
    // Redirecionar para a tela de código existente no checkout
    router.push(`/figma/checkout/esqueci-senha?cpf=${cpfLimpo}`);
  };

  return (
    <div className="bg-white min-h-[calc(100vh-300px)] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-[16px] shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)] p-6 lg:p-[32px] w-full max-w-[684px]">

        {/* Etapa 1: Informar CPF */}
        {etapa === "cpf" && (
          <form onSubmit={handleBuscarTelefone} className="flex flex-col gap-6 lg:gap-[32px]">
            <div className="flex flex-col gap-2">
              <h1 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                Esqueceu sua senha?
              </h1>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                Informe seu CPF para recuperar o acesso à sua conta
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:gap-[16px]">
              <label className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black">
                Informe seu CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#999] focus:outline-none focus:border-[#254333]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
                <p className="font-cera-pro text-[14px] text-red-600">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-4 lg:gap-[16px]">
              <button
                type="submit"
                disabled={isSubmitting || cpf.replace(/\D/g, "").length !== 11}
                className={`w-full h-[56px] lg:h-[64px] rounded-[8px] flex items-center justify-center transition-colors ${
                  cpf.replace(/\D/g, "").length === 11 && !isSubmitting
                    ? "bg-[#254333] hover:bg-[#1a2e24]"
                    : "bg-[#d2d2d2] cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="font-cera-pro font-medium text-[16px] text-white">
                    Continuar
                  </span>
                )}
              </button>

              <Link
                href="/figma/entrar"
                className="w-full h-[56px] lg:h-[64px] bg-[#f8f3ed] rounded-[8px] flex items-center justify-center hover:bg-[#efe8df] transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-[#254333]">
                  Voltar para login
                </span>
              </Link>
            </div>
          </form>
        )}

        {/* Etapa 2: Confirmar envio para telefone */}
        {etapa === "confirmar" && (
          <div className="flex flex-col gap-6 lg:gap-[32px]">
            <div className="flex flex-col gap-2">
              <h1 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                Confirmar telefone
              </h1>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                Enviaremos um código de verificação para o telefone cadastrado:
              </p>
            </div>

            <div className="bg-[#f8f3ed] rounded-[8px] p-4 text-center">
              <p className="font-cera-pro font-bold text-[24px] text-[#254333]">
                {telefoneMascarado}
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:gap-[16px]">
              <button
                onClick={handleConfirmar}
                className="w-full h-[56px] lg:h-[64px] bg-[#254333] hover:bg-[#1a2e24] rounded-[8px] flex items-center justify-center transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Enviar código SMS
                </span>
              </button>

              <button
                onClick={() => {
                  setEtapa("cpf");
                  setTelefoneMascarado("");
                  setError(null);
                }}
                className="w-full h-[56px] lg:h-[64px] bg-[#f8f3ed] rounded-[8px] flex items-center justify-center hover:bg-[#efe8df] transition-colors"
              >
                <span className="font-cera-pro font-medium text-[16px] text-[#254333]">
                  Voltar
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
