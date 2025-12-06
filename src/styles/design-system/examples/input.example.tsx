/**
 * EXEMPLO DE REFERÊNCIA - Inputs
 *
 * Este arquivo serve como referência para criar inputs consistentes.
 * NÃO use este componente diretamente em produção.
 * Copie os padrões e adapte conforme necessário.
 */

import Image from "next/image";

// =============================================================================
// INPUT SIMPLES
// Uso: Campos de texto básicos
// =============================================================================

export function InputSimplesExemplo() {
  return (
    <div className="bg-white border border-[#d2d2d2] flex items-center p-[8px] rounded-[8px] w-full">
      <input
        type="text"
        placeholder="Digite aqui..."
        className="
          flex-1
          font-cera-pro font-light text-[14px] lg:text-[20px] text-black
          leading-normal
          px-[8px]
          focus:outline-none
          bg-transparent
          placeholder:text-[#999999]
        "
      />
    </div>
  );
}

// =============================================================================
// INPUT COM ÍCONE DE BUSCA
// Uso: Campo de pesquisa
// =============================================================================

export function InputBuscaExemplo() {
  return (
    <div className="bg-white flex gap-[5px] items-center p-[8px] rounded-[16px] w-full">
      <div className="w-[16px] h-[16px] shrink-0">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#000000" strokeWidth="1.5" />
          <path
            d="M11 11L14 14"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Buscar produtos..."
        className="
          flex-1
          font-cera-pro font-light text-[12px] lg:text-[14px] text-black
          outline-none bg-transparent
          placeholder:text-[#666666]
        "
      />
    </div>
  );
}

// =============================================================================
// INPUT COM BOTÃO (CEP, Cupom)
// Uso: Campos que precisam de ação imediata
// =============================================================================

export function InputComBotaoExemplo() {
  return (
    <div className="bg-white border border-[#d2d2d2] flex items-center justify-between p-[8px] rounded-[8px] w-full">
      <input
        type="text"
        inputMode="numeric"
        placeholder="Digite seu CEP"
        maxLength={9}
        className="
          flex-1
          font-cera-pro font-light text-[14px] lg:text-[20px] text-black
          leading-normal
          px-[8px]
          focus:outline-none
          bg-transparent
          min-w-0
        "
      />

      <button
        className="
          bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999]
          flex flex-col h-[32px] items-center justify-center
          overflow-hidden rounded-[4px]
          flex-shrink-0 transition-colors
        "
      >
        <div className="flex gap-[8px] items-center justify-center px-3 lg:px-[16px] py-[10px]">
          <p className="font-cera-pro font-medium text-sm lg:text-[16px] text-white leading-normal whitespace-nowrap">
            Calcular
          </p>
        </div>
      </button>
    </div>
  );
}

// =============================================================================
// INPUT COM BOTÃO LIMPAR
// Uso: Campos que permitem limpar o valor
// =============================================================================

export function InputComLimparExemplo() {
  const valor = "12345-678";

  return (
    <div className="bg-white border border-[#d2d2d2] flex items-center justify-between p-[8px] rounded-[8px] w-full">
      <input
        type="text"
        value={valor}
        className="
          flex-1
          font-cera-pro font-light text-[14px] lg:text-[20px] text-black
          px-[8px]
          focus:outline-none
          bg-transparent
          min-w-0
        "
        readOnly
      />

      {/* Botão Limpar - só aparece quando tem valor */}
      {valor && (
        <button
          onClick={() => {}}
          className="
            text-[#B3261E] hover:text-[#8a1c17]
            px-1 lg:px-2
            text-[11px] lg:text-[12px]
            font-cera-pro font-light underline
            whitespace-nowrap flex-shrink-0
            transition-colors
          "
        >
          Limpar
        </button>
      )}

      <button
        className="
          bg-[#254333] hover:bg-[#1a3226]
          rounded-[4px]
          px-3 lg:px-[16px] py-[10px]
          flex-shrink-0
        "
      >
        <p className="font-cera-pro font-medium text-sm lg:text-[16px] text-white">
          Calcular
        </p>
      </button>
    </div>
  );
}

// =============================================================================
// GRUPO DE INPUTS (Label + Input + Mensagem de Erro)
// Uso: Formulários completos
// =============================================================================

export function GrupoInputExemplo() {
  const temErro = true;

  return (
    <div className="flex flex-col gap-[8px] w-full">
      {/* Label */}
      <label className="font-cera-pro font-bold text-[16px] lg:text-[20px] text-black">
        CEP de entrega
      </label>

      {/* Input */}
      <div
        className={`
        bg-white border flex items-center p-[8px] rounded-[8px] w-full
        ${temErro ? "border-[#B3261E]" : "border-[#d2d2d2]"}
      `}
      >
        <input
          type="text"
          placeholder="00000-000"
          className="
            flex-1
            font-cera-pro font-light text-[14px] lg:text-[20px] text-black
            px-[8px]
            focus:outline-none
            bg-transparent
          "
        />
      </div>

      {/* Mensagem de Erro */}
      {temErro && (
        <div className="flex gap-[8px] items-center bg-red-50 rounded-lg p-3">
          <p className="font-cera-pro font-light text-[14px] text-[#B3261E]">
            CEP inválido. Verifique e tente novamente.
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// INPUT DE SELEÇÃO (Radio como Card)
// Uso: Opções de frete, forma de pagamento
// =============================================================================

export function InputSelecaoExemplo() {
  const selecionado = true;

  return (
    <label
      className={`
      flex items-center gap-[12px] p-[12px] rounded-[8px] cursor-pointer
      border-2 transition-all
      ${
        selecionado
          ? "border-[#254333] bg-[#F0F9F4]"
          : "border-[#d2d2d2] bg-white hover:border-[#254333]"
      }
    `}
    >
      {/* Radio visual */}
      <div
        className={`
        w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center
        ${selecionado ? "border-[#254333]" : "border-[#d2d2d2]"}
      `}
      >
        {selecionado && (
          <div className="w-[10px] h-[10px] rounded-full bg-[#254333]" />
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1">
        <p className="font-cera-pro font-medium text-[14px] text-black">
          Sedex - R$ 25,90
        </p>
        <p className="font-cera-pro font-light text-[12px] text-[#333333]">
          Entrega em 3 dias úteis
        </p>
      </div>

      {/* Input real (hidden) */}
      <input type="radio" name="frete" className="sr-only" />
    </label>
  );
}
