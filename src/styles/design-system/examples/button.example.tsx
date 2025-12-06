/**
 * EXEMPLO DE REFERÊNCIA - Botões
 *
 * Este arquivo serve como referência para criar botões consistentes.
 * NÃO use este componente diretamente em produção.
 * Copie os padrões e adapte conforme necessário.
 */

// =============================================================================
// BOTÃO PRIMÁRIO (verde escuro)
// Uso: Ações principais como "Comprar", "Confirmar", "Enviar"
// =============================================================================

export function BotaoPrimarioExemplo() {
  return (
    <button
      onClick={() => {}}
      className="
        flex flex-col justify-center items-center
        bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999]
        rounded-[8px]
        transition-colors
      "
    >
      <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
        <p className="font-cera-pro font-medium text-[16px] lg:font-bold lg:text-[24px] text-white leading-normal">
          Comprar
        </p>
      </div>
    </button>
  );
}

// =============================================================================
// BOTÃO SECUNDÁRIO (verde claro)
// Uso: Ações secundárias como "Adicionar ao carrinho", "Compartilhar"
// =============================================================================

export function BotaoSecundarioExemplo() {
  return (
    <button
      onClick={() => {}}
      className="
        flex flex-col justify-center items-center
        bg-[#D8F9E7] hover:bg-[#c5f0d9]
        rounded-[8px]
        transition-colors
      "
    >
      <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
        <p className="font-cera-pro font-medium text-[16px] text-[#254333] leading-normal">
          Adicionar ao carrinho
        </p>
      </div>
    </button>
  );
}

// =============================================================================
// BOTÃO FULL WIDTH (largura total)
// Uso: CTAs em cards, modais, seções
// =============================================================================

export function BotaoFullWidthExemplo() {
  return (
    <button
      onClick={() => {}}
      className="flex flex-row justify-stretch items-stretch self-stretch w-full"
    >
      <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#254333] hover:bg-[#1a3226] rounded-[8px] transition-colors">
        <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
          <p className="font-cera-pro font-bold text-[24px] text-white leading-normal">
            Finalizar Compra
          </p>
        </div>
      </div>
    </button>
  );
}

// =============================================================================
// BOTÃO CARD CLICÁVEL
// Uso: Opções de seleção que parecem cards (pagamento, frete, etc)
// =============================================================================

export function BotaoCardExemplo() {
  return (
    <button
      onClick={() => {}}
      className="
        w-full rounded-[8px]
        border border-transparent
        shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
        bg-white p-4 text-left
        transition-all
        hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]
      "
    >
      <div className="flex items-center gap-4">
        {/* Ícone ou conteúdo aqui */}
        <span className="font-cera-pro font-bold text-[18px] lg:text-[20px] text-[#254333]">
          Opção de Seleção
        </span>
      </div>
    </button>
  );
}

// =============================================================================
// BOTÃO LINK (texto com underline)
// Uso: Links de ação como "Limpar", "Ver mais", "Cancelar"
// =============================================================================

export function BotaoLinkExemplo() {
  return (
    <button
      onClick={() => {}}
      className="
        text-[#B3261E] hover:text-[#8a1c17]
        font-cera-pro font-light text-[12px]
        underline
        transition-colors
      "
    >
      Limpar
    </button>
  );
}

// =============================================================================
// GRUPO DE BOTÕES (2 botões lado a lado)
// Uso: Opções alternativas como "Compartilhar" e "Adicionar"
// =============================================================================

export function GrupoBotoesExemplo() {
  return (
    <div className="flex flex-row justify-stretch items-stretch self-stretch gap-[10px] w-full">
      {/* Botão 1 */}
      <button className="flex flex-row justify-stretch items-stretch flex-1 h-[48px] lg:h-[60px]">
        <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#D8F9E7] hover:bg-[#c5f0d9] rounded-[8px] transition-colors">
          <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
            <p className="font-cera-pro font-medium text-[16px] text-[#254333]">
              Compartilhar
            </p>
          </div>
        </div>
      </button>

      {/* Botão 2 */}
      <button className="flex flex-row justify-stretch items-stretch flex-1 h-[48px] lg:h-[60px]">
        <div className="flex flex-col justify-center items-center self-stretch flex-1 bg-[#D8F9E7] hover:bg-[#c5f0d9] rounded-[8px] transition-colors">
          <div className="flex flex-row justify-center items-center gap-[8px] px-[16px] py-[10px]">
            <p className="font-cera-pro font-medium text-[16px] text-[#254333]">
              Adicionar ao carrinho
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
