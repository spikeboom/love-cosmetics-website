/**
 * EXEMPLO DE REFERÊNCIA - Seções e Layouts
 *
 * Este arquivo serve como referência para criar seções e layouts consistentes.
 * NÃO use este componente diretamente em produção.
 * Copie os padrões e adapte conforme necessário.
 */

import Image from "next/image";

// =============================================================================
// SEÇÃO EXPANSÍVEL (ACCORDION)
// Uso: FAQ, detalhes do produto, informações colapsáveis
// =============================================================================

export function SecaoExpansivelExemplo() {
  const isExpanded = true;

  return (
    <div className="w-full bg-white border-b border-[#d2d2d2]">
      {/* Header clicável */}
      <button
        onClick={() => {}}
        className="
          w-full flex items-center justify-between
          px-[16px] py-[16px]
          hover:bg-[#f8f3ed] transition-colors
        "
      >
        <p className="font-cera-pro font-bold text-[24px] text-black leading-normal text-left">
          Título da Seção
        </p>
        <Image
          src="/new-home/icons/chevron-down.svg"
          alt="Expandir"
          width={24}
          height={24}
          className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Conteúdo expansível */}
      {isExpanded && (
        <div className="px-[16px] pb-[16px]">
          <p className="font-cera-pro font-light text-[14px] text-[#333333]">
            Conteúdo da seção aqui. Pode ser texto, listas, imagens, etc.
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SEÇÃO COM TÍTULO
// Uso: Seções da home, vitrines
// =============================================================================

export function SecaoComTituloExemplo() {
  return (
    <section className="flex flex-col gap-6 lg:gap-[32px] py-6 lg:py-[24px] px-4 lg:px-[32px]">
      {/* Título da seção */}
      <h2 className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-black leading-normal">
        Mais Vendidos
      </h2>

      {/* Conteúdo (grid de cards, lista, etc) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Cards aqui */}
      </div>
    </section>
  );
}

// =============================================================================
// CONTAINER PADRÃO DE PÁGINA
// Uso: Wrapper principal de conteúdo
// =============================================================================

export function ContainerPaginaExemplo() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[32px]">
      {/* Conteúdo da página */}
    </div>
  );
}

// =============================================================================
// BARRA DE AVISO (NOTIFICATION BAR)
// Uso: Frete grátis, promoções, avisos
// =============================================================================

export function BarraAvisoExemplo() {
  return (
    <div className="bg-[#f8f3ed] w-full border-t-[1px] border-[#ba7900]">
      <div className="flex gap-2 items-center justify-center py-2 lg:py-[10px] px-4 lg:px-[123px]">
        <p className="font-cera-pro font-light text-xs lg:text-[16px] text-[#333333] text-center leading-normal">
          Ciência e natureza da Amazônia
        </p>
        <Image
          src="/new-home/header/eco.svg"
          alt=""
          width={20}
          height={20}
          className="lg:w-6 lg:h-6"
        />
      </div>
    </div>
  );
}

// =============================================================================
// MENSAGEM DE SUCESSO
// Uso: Confirmações, ações bem-sucedidas
// =============================================================================

export function MensagemSucessoExemplo() {
  return (
    <div className="p-3 bg-[#F0F9F4] rounded-lg border border-[#009142] w-full">
      <div className="flex items-center gap-2">
        <Image
          src="/new-home/icons/verified-green.svg"
          alt="Verificado"
          width={16}
          height={16}
          className="w-4 h-4 flex-shrink-0"
        />
        <p className="font-cera-pro font-light text-[12px] text-[#009142] leading-normal">
          CEP 69000-000 - Sedex - Entrega em 3 dias úteis
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// MENSAGEM DE ERRO
// Uso: Erros, validações
// =============================================================================

export function MensagemErroExemplo() {
  return (
    <div className="flex gap-[8px] items-center w-full bg-red-50 rounded-lg p-3">
      <p className="font-cera-pro font-light text-[14px] text-[#B3261E] leading-normal">
        CEP inválido. Verifique o número e tente novamente.
      </p>
    </div>
  );
}

// =============================================================================
// STEPPER (ETAPAS)
// Uso: Checkout, processos multi-etapas
// =============================================================================

export function StepperExemplo() {
  const etapaAtual = 2; // 1 = Identificação, 2 = Entrega, 3 = Pagamento

  const etapas = [
    { numero: 1, nome: "Identificação" },
    { numero: 2, nome: "Entrega" },
    { numero: 3, nome: "Pagamento" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 py-4 px-4 bg-white">
      {etapas.map((etapa, index) => (
        <div key={etapa.numero} className="flex items-center gap-2">
          {/* Círculo com número */}
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${
                etapa.numero <= etapaAtual
                  ? "bg-[#254333] text-white"
                  : "bg-[#d2d2d2] text-[#666666]"
              }
            `}
          >
            <span className="font-cera-pro font-bold text-[14px]">
              {etapa.numero}
            </span>
          </div>

          {/* Nome da etapa (apenas desktop) */}
          <span
            className={`
              hidden lg:inline
              font-cera-pro text-[14px]
              ${
                etapa.numero <= etapaAtual
                  ? "font-medium text-[#254333]"
                  : "font-light text-[#666666]"
              }
            `}
          >
            {etapa.nome}
          </span>

          {/* Linha conectora (exceto último) */}
          {index < etapas.length - 1 && (
            <div
              className={`
                w-8 lg:w-16 h-[2px]
                ${etapa.numero < etapaAtual ? "bg-[#254333]" : "bg-[#d2d2d2]"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// LAYOUT MOBILE VS DESKTOP
// Uso: Padrão de alternância entre layouts
// =============================================================================

export function LayoutResponsivoExemplo() {
  return (
    <>
      {/* MOBILE - esconde em lg: */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-4 px-4 py-6">
          {/* Layout mobile: vertical, padding menor */}
          <h2 className="font-cera-pro font-bold text-[20px] text-black">
            Título Mobile
          </h2>
          <p className="font-cera-pro font-light text-[14px] text-[#333333]">
            Conteúdo mobile
          </p>
        </div>
      </div>

      {/* DESKTOP - aparece apenas em lg: */}
      <div className="hidden lg:block">
        <div className="flex flex-row gap-8 px-[32px] py-[24px]">
          {/* Layout desktop: horizontal, padding maior */}
          <div className="flex-1">
            <h2 className="font-cera-pro font-bold text-[24px] text-black">
              Título Desktop
            </h2>
          </div>
          <div className="flex-1">
            <p className="font-cera-pro font-light text-[16px] text-[#333333]">
              Conteúdo desktop em duas colunas
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// DIVIDER (SEPARADOR)
// Uso: Separar seções, itens de lista
// =============================================================================

export function DividerExemplo() {
  return (
    <>
      {/* Divider simples */}
      <div className="w-full h-px bg-[#d2d2d2]" />

      {/* Divider dourado (destaque) */}
      <div className="w-full h-px bg-[#ba7900]" />
    </>
  );
}
