import Link from "next/link";
import { ConfirmacaoStepper } from "../ConfirmacaoStepper";
import { VerifiedIcon } from "@/components/figma-shared/icons";
import { PageStatus, PedidoStatus } from "./types";

interface AccountFormProps {
  pageStatus: "create_account" | "login";
  pedidoStatus: PedidoStatus | null;
  pedidoId: string | null;
  password: string;
  setPassword: (value: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (value: string) => void;
  receberComunicacoes: boolean;
  setReceberComunicacoes: (value: boolean) => void;
  error: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AccountForm({
  pageStatus,
  pedidoStatus,
  pedidoId,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  receberComunicacoes,
  setReceberComunicacoes,
  error,
  isSubmitting,
  onSubmit,
}: AccountFormProps) {
  const isLogin = pageStatus === "login";

  return (
    <div className="bg-white flex flex-col w-full flex-1">
      <ConfirmacaoStepper currentStep="senha" />

      <div className="flex justify-center px-4 lg:px-[24px] pt-6 lg:pt-[24px] pb-8 lg:pb-[32px]">
        <div className="flex flex-col gap-6 lg:gap-[32px] w-full max-w-[684px]">
          {/* Banner de sucesso do pagamento */}
          <div className="bg-[#f8f3ed] rounded-[16px] p-4 flex gap-2 items-center">
            <VerifiedIcon className="w-8 h-8 shrink-0" variant="gold" />
            <div className="flex flex-col gap-1">
              <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
                Pagamento aprovado!
              </p>
              <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
                Boas noticias, seu pagamento foi confirmado!
              </p>
            </div>
          </div>

          {/* Texto explicativo */}
          <div className="flex flex-col gap-2">
            <p className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#1d1b20]">
              Acompanhe seu pedido
            </p>
            <p className="font-cera-pro font-light text-[12px] lg:text-[14px] text-[#1d1b20]">
              {isLogin
                ? "Voce ja tem uma conta. Faca login para vincular este pedido e acompanhar o status."
                : "Confirme seus dados para criar uma conta e acompanhar o status do seu pedido. E rapidinho!"}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4 lg:gap-[16px]">
            {/* Campo de senha */}
            <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
              <div className="flex justify-between items-center">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  {isLogin ? "Digite sua senha" : "Informe uma senha"}
                </label>
                {isLogin && pedidoStatus?.cpf && (
                  <Link
                    href={`/figma/checkout/esqueci-senha?cpf=${pedidoStatus.cpf}${pedidoId ? `&pedidoId=${pedidoId}` : ""}`}
                    className="font-cera-pro font-light text-[14px] text-[#254333] underline hover:text-[#1a2e24]"
                  >
                    Esqueci minha senha
                  </Link>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]"
              />
            </div>

            {/* Confirmar senha (apenas para criar conta) */}
            {!isLogin && (
              <div className="flex flex-col gap-3 lg:gap-[16px] w-full">
                <label className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-black">
                  Confirme sua senha
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="********"
                  className="w-full h-[48px] px-4 bg-white border border-[#d2d2d2] rounded-[8px] font-cera-pro font-light text-[18px] lg:text-[20px] text-[#333] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#254333]"
                />
              </div>
            )}

            {/* Checkbox de comunicacoes (apenas para criar conta) */}
            {!isLogin && (
              <div className="flex gap-2 items-start py-2">
                <button
                  type="button"
                  onClick={() => setReceberComunicacoes(!receberComunicacoes)}
                  className={`shrink-0 w-[18px] h-[18px] border-2 border-[#333] rounded-sm flex items-center justify-center ${
                    receberComunicacoes ? "bg-[#254333] border-[#254333]" : ""
                  }`}
                >
                  {receberComunicacoes && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
                <div className="flex flex-col gap-1">
                  <p className="font-cera-pro font-medium text-[14px] lg:text-[16px] text-[#111]">
                    Quero receber comunicacoes da Love
                  </p>
                  <p className="font-cera-pro font-light text-[10px] lg:text-[12px] text-[#111]">
                    Aceito receber atualizacoes sobre meus pedidos e ofertas de acordo com o termo de consentimento
                  </p>
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-3">
                <p className="font-cera-pro text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Botao */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[60px] lg:h-[64px] bg-[#254333] rounded-[8px] flex items-center justify-center hover:bg-[#1a2e24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="font-cera-pro font-medium text-[16px] text-white">
                  Continuar
                </span>
              )}
            </button>

            {/* Link para pular */}
            <Link
              href="/figma"
              className="text-center font-cera-pro font-light text-[14px] text-[#666] underline hover:text-[#254333]"
            >
              Pular por enquanto
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
