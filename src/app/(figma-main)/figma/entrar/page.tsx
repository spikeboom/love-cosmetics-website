"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts";

// Funcao para formatar CPF
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

export default function EntrarPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cpfLimpo = cpf.replace(/\D/g, "");

    if (cpfLimpo.length !== 11) {
      setError("CPF deve ter 11 digitos");
      return;
    }

    if (!password) {
      setError("Digite sua senha");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cliente/auth/entrar-cpf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpf: cpfLimpo,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "CPF ou senha incorretos");
        return;
      }

      // Login bem sucedido - atualizar estado de auth e redirecionar
      await refreshAuth();
      router.push("/figma/minha-conta/pedidos");
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100vh-300px)] flex items-center justify-center px-4 py-8">
      {/* Card de Login */}
      <div className="bg-white rounded-[16px] shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)] p-6 lg:p-[32px] w-full max-w-[684px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[32px]">
          {/* Titulo e descricao */}
          <div className="flex flex-col gap-2">
            <h1 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
              Que bom ter voce aqui!
            </h1>
            <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
              Entre e aproveite o melhor da ciencia e natureza da Amazonia
            </p>
          </div>

          {/* Campo CPF */}
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

          {/* Campo Senha */}
          <div className="flex flex-col gap-3 lg:gap-[16px]">
            <label className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black">
              Informe sua senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#999] focus:outline-none focus:border-[#254333]"
            />
          </div>

          {/* Link Esqueci senha */}
          <Link
            href="/figma/esqueci-senha"
            className="font-cera-pro font-light text-[14px] text-[#254333] underline hover:text-[#1a2e24] w-fit"
          >
            Esqueci minha senha
          </Link>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
              <p className="font-cera-pro text-[14px] text-red-600">{error}</p>
            </div>
          )}

          {/* Botoes */}
          <div className="flex flex-col gap-4 lg:gap-[16px]">
            {/* Botao Continuar */}
            <button
              type="submit"
              disabled={isSubmitting || !cpf || !password}
              className={`w-full h-[56px] lg:h-[64px] rounded-[8px] flex items-center justify-center transition-colors ${
                cpf && password && !isSubmitting
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

            {/* Botao Criar conta */}
            <Link
              href="/figma/cadastrar"
              className="w-full h-[56px] lg:h-[64px] bg-[#d8f9e7] rounded-[8px] flex items-center justify-center hover:bg-[#c5f0d8] transition-colors"
            >
              <span className="font-cera-pro font-medium text-[16px] text-[#254333]">
                Criar conta
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
