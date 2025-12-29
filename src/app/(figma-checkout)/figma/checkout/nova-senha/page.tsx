"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ConfirmacaoStepper } from "../confirmacao/ConfirmacaoStepper";
import { useAuth } from "@/contexts";

function NovaSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const cpf = searchParams.get("cpf");
  const token = searchParams.get("token");
  const { refreshAuth } = useAuth();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== passwordConfirm) {
      setError("As senhas nao coincidem");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cliente/auth/resetar-senha-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, token, novaSenha: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao alterar senha");
        return;
      }

      // Atualizar estado de auth no header
      await refreshAuth();
      setSuccess(true);

      // Redirecionar apos 2 segundos
      setTimeout(() => {
        if (pedidoId) {
          router.push(`/figma/checkout/confirmacao?pedidoId=${pedidoId}`);
        } else {
          router.push("/figma/minha-conta/pedidos");
        }
      }, 2000);

    } catch (error) {
      setError("Erro ao alterar senha. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white flex flex-col w-full flex-1">
        <ConfirmacaoStepper currentStep="verificacao" />

        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)] p-8 w-full max-w-[684px] text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-[#009142] rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="font-cera-pro font-bold text-[24px] text-[#254333] mb-4">
              Senha alterada com sucesso!
            </h1>
            <p className="font-cera-pro font-light text-[16px] text-[#333] mb-4">
              Redirecionando...
            </p>
            <div className="w-8 h-8 mx-auto border-4 border-[#254333] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <ConfirmacaoStepper currentStep="verificacao" />

      <div className="flex-1 flex items-center justify-center px-4 lg:px-[24px] py-8">
        <div className="bg-white rounded-[16px] shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)] p-6 lg:p-[32px] w-full max-w-[684px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[32px]">
            {/* Titulo e descricao */}
            <div className="flex flex-col gap-2">
              <h1 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                Criar nova senha
              </h1>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                Digite sua nova senha abaixo
              </p>
            </div>

            {/* Campo nova senha */}
            <div className="flex flex-col gap-3 lg:gap-[16px]">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Nova senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]"
              />
            </div>

            {/* Campo confirmar senha */}
            <div className="flex flex-col gap-3 lg:gap-[16px]">
              <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                Confirme a nova senha
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="********"
                className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]"
              />
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
                <p className="font-cera-pro text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Botao */}
            <button
              type="submit"
              disabled={isSubmitting || !password || !passwordConfirm}
              className={`w-full h-[56px] lg:h-[64px] rounded-[8px] flex items-center justify-center transition-colors ${
                password && passwordConfirm && !isSubmitting
                  ? "bg-[#254333] hover:bg-[#1a2e24]"
                  : "bg-[#d2d2d2] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Salvar nova senha
                </span>
              )}
            </button>

            {/* Link para voltar */}
            <Link
              href={pedidoId ? `/figma/checkout/confirmacao?pedidoId=${pedidoId}` : "/figma"}
              className="text-center font-cera-pro font-light text-[14px] text-[#666] underline hover:text-[#254333]"
            >
              Cancelar
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#254333] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-cera-pro text-[16px] text-[#333333]">
        Carregando...
      </p>
    </div>
  );
}

export default function NovaSenhaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NovaSenhaContent />
    </Suspense>
  );
}
