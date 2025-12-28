"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ConfirmacaoStepper } from "../confirmacao/ConfirmacaoStepper";

const isDev = process.env.NODE_ENV === "development";

function EsqueciSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const cpf = searchParams.get("cpf");

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(50);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [telefone, setTelefone] = useState(""); // Telefone mascarado
  const [smsSent, setSmsSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null); // Código em dev

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown para reenviar codigo
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Enviar SMS ao carregar a pagina
  useEffect(() => {
    if (!smsSent && cpf) {
      enviarSMS();
      setSmsSent(true);
    }
  }, [cpf, smsSent]);

  const enviarSMS = async () => {
    try {
      setError(null);
      const response = await fetch("/api/cliente/auth/enviar-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao enviar SMS");
        return;
      }

      // Atualizar telefone mascarado
      if (data.telefoneMascarado) {
        setTelefone(data.telefoneMascarado);
      }

      // Em dev, mostrar código
      if (data._dev?.codigo) {
        setDevCode(data._dev.codigo);
      }
    } catch (error) {
      console.error("Erro ao enviar SMS:", error);
      setError("Erro ao enviar SMS. Tente novamente.");
    }
  };

  const handleDeleteUser = async () => {
    if (!cpf || !confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/cliente/auth/dev-delete?cpf=${cpf}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao excluir usuário");
        return;
      }

      setSuccessMessage(`Usuário ${data.cliente.nome} excluído com sucesso!`);

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(pedidoId ? `/figma/checkout/confirmacao?pedidoId=${pedidoId}` : "/figma");
      }, 2000);

    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setError("Erro ao excluir usuário");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    // Aceitar apenas numeros
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus no proximo campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Voltar para o campo anterior ao pressionar backspace em campo vazio
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }

    setCode(newCode);

    // Focar no ultimo campo preenchido ou no proximo vazio
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(50);
    setCode(["", "", "", "", "", ""]);
    setError(null);

    await enviarSMS();
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      setError("Digite o codigo completo de 6 digitos");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/cliente/auth/verificar-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, codigo: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Código inválido");
        return;
      }

      // Redirecionar para definir nova senha com o token
      router.push(`/figma/checkout/nova-senha?cpf=${cpf}&token=${data.token}${pedidoId ? `&pedidoId=${pedidoId}` : ""}`);

    } catch (error) {
      setError("Codigo invalido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCodeComplete = code.every(digit => digit !== "");
  const hasAnyDigit = code.some(digit => digit !== "");

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <ConfirmacaoStepper currentStep="verificacao" />

      <div className="flex-1 flex items-center justify-center px-4 lg:px-[24px] py-8">
        <div className="bg-white rounded-[16px] shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)] p-6 lg:p-[32px] w-full max-w-[684px]">
          <div className="flex flex-col gap-6 lg:gap-[32px]">
            {/* Mensagem de sucesso */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-[8px] p-3">
                <p className="font-cera-pro text-[14px] text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Titulo e descricao */}
            <div className="flex flex-col gap-2">
              <h1 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                Confirmar telefone
              </h1>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                {telefone
                  ? `Enviamos um codigo por SMS para o telefone cadastrado ${telefone}`
                  : "Enviando código SMS..."
                }
              </p>
            </div>

            {/* DEV: Mostrar código */}
            {isDev && devCode && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-[8px] p-3">
                <p className="font-cera-pro text-[14px] text-yellow-800">
                  <strong>[DEV]</strong> Código SMS: <code className="bg-yellow-100 px-2 py-1 rounded">{devCode}</code>
                </p>
              </div>
            )}

            {/* Campos de codigo */}
            <div className="flex flex-col gap-4">
              <p className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black">
                Informe o codigo
              </p>
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-[48px] lg:w-[72px] h-[48px] lg:h-[56px] bg-white border border-[#d2d2d2] rounded-[8px] text-center font-cera-pro font-light text-[24px] lg:text-[32px] text-[#333] focus:outline-none focus:border-[#254333]"
                  />
                ))}
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
                <p className="font-cera-pro text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Botoes */}
            <div className="flex flex-col gap-4">
              {/* Botao Continuar */}
              <button
                onClick={handleSubmit}
                disabled={!isCodeComplete || isSubmitting}
                className={`w-full h-[56px] lg:h-[64px] rounded-[8px] flex items-center justify-center transition-colors ${
                  isCodeComplete && !isSubmitting
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

              {/* Botao Reenviar */}
              <button
                onClick={handleResend}
                disabled={!canResend}
                className={`w-full h-[56px] lg:h-[64px] rounded-[8px] flex items-center justify-center transition-colors ${
                  canResend
                    ? "bg-[#d8f9e7] hover:bg-[#c5f0da]"
                    : "bg-[#d2d2d2] cursor-not-allowed"
                }`}
              >
                <span className={`font-cera-pro font-medium text-[16px] ${
                  canResend ? "text-[#254333]" : "text-[#8e8e93]"
                }`}>
                  {canResend
                    ? "Reenviar codigo"
                    : `Reenviar codigo em ${String(Math.floor(countdown / 60)).padStart(2, "0")}:${String(countdown % 60).padStart(2, "0")}s`
                  }
                </span>
              </button>
            </div>

            {/* Link para voltar */}
            <Link
              href={pedidoId ? `/figma/checkout/confirmacao?pedidoId=${pedidoId}` : "/figma"}
              className="text-center font-cera-pro font-light text-[14px] text-[#666] underline hover:text-[#254333]"
            >
              Voltar
            </Link>

            {/* DEV: Botão para excluir usuário */}
            {isDev && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-center font-cera-pro text-[12px] text-gray-400 mb-2">
                  [Ambiente de desenvolvimento]
                </p>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting || !cpf}
                  className="w-full h-[44px] bg-red-500 hover:bg-red-600 disabled:bg-gray-300 rounded-[8px] flex items-center justify-center transition-colors"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="font-cera-pro font-medium text-[14px] text-white">
                      Excluir usuário (CPF: {cpf})
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
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

export default function EsqueciSenhaPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EsqueciSenhaContent />
    </Suspense>
  );
}
