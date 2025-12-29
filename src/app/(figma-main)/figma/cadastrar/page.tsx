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

// Funcao para formatar telefone
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export default function CadastrarPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [receberComunicacoes, setReceberComunicacoes] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    if (formatted.length <= 14) {
      setCpf(formatted);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 15) {
      setTelefone(formatted);
    }
  };

  const isFormValid = () => {
    return (
      nome.trim().length >= 2 &&
      sobrenome.trim().length >= 2 &&
      email.includes("@") &&
      cpf.replace(/\D/g, "").length === 11 &&
      password.length >= 6 &&
      password === passwordConfirm
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    // Validacoes basicas
    if (nome.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      setFieldError("nome");
      return;
    }

    if (sobrenome.trim().length < 2) {
      setError("Sobrenome deve ter pelo menos 2 caracteres");
      setFieldError("sobrenome");
      return;
    }

    if (!email.includes("@")) {
      setError("Email invalido");
      setFieldError("email");
      return;
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setError("CPF deve ter 11 digitos");
      setFieldError("cpf");
      return;
    }

    if (password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      setFieldError("password");
      return;
    }

    if (password !== passwordConfirm) {
      setError("As senhas nao coincidem");
      setFieldError("passwordConfirm");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cliente/auth/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          sobrenome: sobrenome.trim(),
          email: email.trim().toLowerCase(),
          cpf: cpfLimpo,
          telefone: telefone.replace(/\D/g, "") || undefined,
          password,
          passwordConfirm,
          receberWhatsapp: receberComunicacoes,
          receberEmail: receberComunicacoes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Erro ao criar conta");
        if (result.field) {
          setFieldError(result.field);
        }
        return;
      }

      // Cadastro bem sucedido - atualizar estado de auth e redirecionar
      await refreshAuth();
      router.push("/figma/minha-conta/pedidos");
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (field: string) => {
    const baseClass = "w-full h-[48px] px-4 bg-white border rounded-[8px] font-cera-pro font-light text-[16px] lg:text-[18px] text-[#333] placeholder:text-[#999] focus:outline-none";
    if (fieldError === field) {
      return `${baseClass} border-red-400 focus:border-red-500`;
    }
    return `${baseClass} border-[#d2d2d2] focus:border-[#254333]`;
  };

  return (
    <div className="bg-white min-h-[calc(100vh-300px)] flex items-center justify-center px-4 py-8">
      {/* Card de Cadastro */}
      <div className="bg-white rounded-[16px] shadow-[0px_4px_8px_3px_rgba(0,0,0,0.15),0px_1px_3px_0px_rgba(0,0,0,0.3)] p-6 lg:p-[32px] w-full max-w-[684px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 lg:gap-[24px]">
          {/* Titulo e descricao */}
          <div className="flex flex-col gap-2">
            <h1 className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
              Crie sua conta
            </h1>
            <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
              Preencha seus dados para aproveitar o melhor da ciencia e natureza da Amazonia
            </p>
          </div>

          {/* Nome e Sobrenome */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-cera-pro font-medium text-[14px] text-black">
                Nome *
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className={getInputClassName("nome")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-cera-pro font-medium text-[14px] text-black">
                Sobrenome *
              </label>
              <input
                type="text"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                placeholder="Seu sobrenome"
                className={getInputClassName("sobrenome")}
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="font-cera-pro font-medium text-[14px] text-black">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={getInputClassName("email")}
            />
          </div>

          {/* CPF e Telefone */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-cera-pro font-medium text-[14px] text-black">
                CPF *
              </label>
              <input
                type="text"
                value={cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                className={getInputClassName("cpf")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-cera-pro font-medium text-[14px] text-black">
                Telefone
              </label>
              <input
                type="text"
                value={telefone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className={getInputClassName("telefone")}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-2">
            <label className="font-cera-pro font-medium text-[14px] text-black">
              Senha *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              className={getInputClassName("password")}
            />
          </div>

          {/* Confirmar Senha */}
          <div className="flex flex-col gap-2">
            <label className="font-cera-pro font-medium text-[14px] text-black">
              Confirmar senha *
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Repita sua senha"
              className={getInputClassName("passwordConfirm")}
            />
          </div>

          {/* Checkbox de comunicacoes */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={receberComunicacoes}
                onChange={(e) => setReceberComunicacoes(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded transition-colors ${
                receberComunicacoes
                  ? "bg-[#254333] border-[#254333]"
                  : "bg-white border-[#d2d2d2]"
              }`}>
                {receberComunicacoes && (
                  <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </div>
            <span className="font-cera-pro font-light text-[13px] text-[#333]">
              Quero receber ofertas exclusivas e novidades por email e WhatsApp
            </span>
          </label>

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
              <p className="font-cera-pro text-[14px] text-red-600">{error}</p>
            </div>
          )}

          {/* Botoes */}
          <div className="flex flex-col gap-4 lg:gap-[16px]">
            {/* Botao Criar conta */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className={`w-full h-[56px] lg:h-[64px] rounded-[8px] flex items-center justify-center transition-colors ${
                isFormValid() && !isSubmitting
                  ? "bg-[#254333] hover:bg-[#1a2e24]"
                  : "bg-[#d2d2d2] cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Criar conta
                </span>
              )}
            </button>

            {/* Link Ja tenho conta */}
            <div className="text-center">
              <span className="font-cera-pro font-light text-[14px] text-[#666]">
                Ja tem uma conta?{" "}
              </span>
              <Link
                href="/figma/entrar"
                className="font-cera-pro font-medium text-[14px] text-[#254333] underline hover:text-[#1a2e24]"
              >
                Entrar
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
