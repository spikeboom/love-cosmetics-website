"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPedidosPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const login = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        window.location.href = "/pedidos";
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao fazer login");
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f3ed] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[400px]">
        {/* Card de Login */}
        <div className="bg-white rounded-[16px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)] p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#254333] rounded-full flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="font-cera-pro font-bold text-[24px] lg:text-[32px] text-black leading-normal">
                Área Administrativa
              </h1>
              <p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#333333] leading-normal mt-1">
                Faça login para acessar os pedidos
              </p>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={login} autoComplete="on" className="flex flex-col gap-4">
            {/* Campo Usuário */}
            <div className="flex flex-col gap-2">
              <label className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black">
                Usuário
              </label>
              <div className="bg-white border border-[#d2d2d2] flex items-center p-[8px] rounded-[8px] w-full focus-within:border-[#254333] transition-colors">
                <input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  name="username"
                  className="
                    flex-1
                    font-cera-pro font-light text-[14px] lg:text-[16px] text-black
                    leading-normal
                    px-[8px]
                    focus:outline-none
                    bg-transparent
                    placeholder:text-[#999999]
                  "
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="flex flex-col gap-2">
              <label className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-black">
                Senha
              </label>
              <div className="bg-white border border-[#d2d2d2] flex items-center p-[8px] rounded-[8px] w-full focus-within:border-[#254333] transition-colors">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  name="password"
                  className="
                    flex-1
                    font-cera-pro font-light text-[14px] lg:text-[16px] text-black
                    leading-normal
                    px-[8px]
                    focus:outline-none
                    bg-transparent
                    placeholder:text-[#999999]
                  "
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#666666] hover:text-[#254333] transition-colors"
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="flex gap-[8px] items-center w-full bg-red-50 rounded-lg p-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B3261E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="font-cera-pro font-light text-[14px] text-[#B3261E] leading-normal">
                  {error}
                </p>
              </div>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="
                w-full mt-2
                flex flex-col justify-center items-center
                bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999]
                rounded-[8px]
                transition-colors
              "
            >
              <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[12px]">
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <p className="font-cera-pro font-medium text-[16px] lg:font-bold lg:text-[18px] text-white leading-normal">
                    Entrar
                  </p>
                )}
              </div>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="font-cera-pro font-light text-[12px] text-[#666666]">
            Lové Cosméticos - Painel Administrativo
          </p>
        </div>
      </div>
    </div>
  );
}
