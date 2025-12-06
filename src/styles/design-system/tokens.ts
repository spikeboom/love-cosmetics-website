/**
 * Design System Tokens - Lové Cosméticos
 *
 * Este arquivo contém todos os tokens de design extraídos do Figma.
 * Use estas constantes para manter consistência visual em novos componentes.
 *
 * IMPORTANTE: Sempre use estes tokens ao criar novos componentes.
 * Não invente cores ou valores - consulte este arquivo primeiro.
 */

// =============================================================================
// CORES
// =============================================================================

export const colors = {
  // Cores primárias da marca
  primary: {
    dark: '#254333',      // Verde escuro - cor principal (headers, botões primários, footer)
    light: '#D8F9E7',     // Verde claro - botões secundários, backgrounds suaves
    accent: '#009142',    // Verde vibrante - sucesso, confirmações, preços com desconto
  },

  // Backgrounds
  background: {
    cream: '#f8f3ed',     // Bege/creme - banners de aviso, destaques, tags
    white: '#ffffff',     // Branco - cards, áreas de conteúdo
    greenLight: '#F0F9F4', // Verde muito claro - mensagens de sucesso
  },

  // Texto
  text: {
    primary: '#000000',   // Preto - títulos principais
    secondary: '#333333', // Cinza escuro - texto secundário, preços antigos
    tertiary: '#111111',  // Quase preto - descrições
    muted: '#666666',     // Cinza médio - ícones, placeholders
    light: '#f2f2f2',     // Quase branco - texto em fundo escuro (footer)
    white: '#ffffff',     // Branco - texto em botões primários
  },

  // Estados
  state: {
    error: '#B3261E',     // Vermelho - erros, alertas, "Últimas unidades"
    errorHover: '#8a1c17', // Vermelho escuro - hover em links de erro
    success: '#009142',   // Verde - sucesso, confirmações
    warning: '#ba7900',   // Dourado/âmbar - bordas de destaque, dividers
    disabled: '#999999',  // Cinza - botões desabilitados
  },

  // Bordas
  border: {
    light: '#d2d2d2',     // Cinza claro - bordas de inputs, dividers
    gold: '#ba7900',      // Dourado - bordas de destaque
    success: '#009142',   // Verde - bordas de confirmação
  },

  // Ícones específicos
  icon: {
    pix: '#32BCAD',       // Cor do ícone PIX
    star: '#FFB800',      // Amarelo - estrelas de avaliação
    starEmpty: '#E0E0E0', // Cinza - estrelas vazias
  },
} as const;

// =============================================================================
// TIPOGRAFIA
// =============================================================================

export const typography = {
  // Família de fonte
  fontFamily: 'font-cera-pro', // Classe Tailwind para Cera Pro

  // Pesos
  fontWeight: {
    light: 'font-light',     // 300 - textos descritivos, labels
    regular: 'font-normal',  // 400 - uso geral (raramente usado)
    medium: 'font-medium',   // 500 - botões, subtítulos
    bold: 'font-bold',       // 700 - títulos, preços, destaques
  },

  // Tamanhos (mobile / desktop)
  fontSize: {
    xs: 'text-[12px]',           // Labels pequenos, copyright
    sm: 'text-[14px]',           // Descrições, textos secundários
    base: 'text-[16px]',         // Texto padrão, botões mobile
    lg: 'text-[18px]',           // Subtítulos mobile
    xl: 'text-[20px]',           // Títulos de seção, preços grandes
    '2xl': 'text-[24px]',        // Títulos principais, botões desktop
    '3xl': 'text-[32px]',        // Títulos hero (raramente usado)
  },

  // Combinações comuns
  presets: {
    // Títulos
    h1: 'font-cera-pro font-bold text-[24px] lg:text-[32px] text-black leading-normal',
    h2: 'font-cera-pro font-bold text-[20px] lg:text-[24px] text-black leading-normal',
    h3: 'font-cera-pro font-bold text-[18px] lg:text-[20px] text-black leading-normal',
    h4: 'font-cera-pro font-medium text-[16px] text-black leading-normal',

    // Corpo
    body: 'font-cera-pro font-light text-[14px] lg:text-[16px] text-[#333333] leading-normal',
    bodySmall: 'font-cera-pro font-light text-[12px] text-[#333333] leading-normal',

    // Preços
    priceOriginal: 'font-cera-pro font-light text-[12px] text-[#333333] line-through',
    priceCurrent: 'font-cera-pro font-bold text-[20px] text-black leading-none',
    priceDiscount: 'font-cera-pro font-light text-[14px] text-[#009142] leading-none',

    // Botões
    buttonPrimary: 'font-cera-pro font-medium text-[16px] lg:font-bold lg:text-[24px] text-white',
    buttonSecondary: 'font-cera-pro font-medium text-[16px] text-[#254333]',

    // Links
    link: 'font-cera-pro font-light text-[14px] text-white hover:underline',
  },
} as const;

// =============================================================================
// SOMBRAS
// =============================================================================

export const shadows = {
  // Sombra padrão de cards
  card: 'shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]',

  // Sombra de hover em cards
  cardHover: 'shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]',

  // Sem sombra
  none: 'shadow-none',
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  sm: 'rounded-[4px]',    // Tags, badges pequenos
  md: 'rounded-[8px]',    // Botões, inputs
  lg: 'rounded-[16px]',   // Cards
  xl: 'rounded-2xl',      // Cards grandes (equivalente a rounded-[16px])
  full: 'rounded-full',   // Avatares, badges circulares
} as const;

// =============================================================================
// ESPAÇAMENTOS
// =============================================================================

export const spacing = {
  // Gaps comuns
  gap: {
    xs: 'gap-[2px]',
    sm: 'gap-[4px]',
    md: 'gap-[8px]',
    lg: 'gap-[16px]',
    xl: 'gap-[24px]',
    '2xl': 'gap-[32px]',
  },

  // Padding comum
  padding: {
    button: 'px-[16px] py-[10px]',
    card: 'p-[16px]',
    section: 'px-4 lg:px-[32px] py-6 lg:py-[24px]',
    input: 'p-[8px]',
  },
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  // Mobile first - estes são os breakpoints Tailwind padrão
  sm: '640px',   // Tablets pequenos
  md: '768px',   // Tablets
  lg: '1024px',  // Desktop (PRINCIPAL - usado para alternar layouts)
  xl: '1280px',  // Desktop grande
  '2xl': '1536px', // Monitores grandes
} as const;

// =============================================================================
// TRANSIÇÕES
// =============================================================================

export const transitions = {
  default: 'transition-all',
  fast: 'transition-all duration-150',
  colors: 'transition-colors',
  opacity: 'transition-opacity',
  transform: 'transition-transform',
} as const;

// =============================================================================
// CLASSES COMPOSTAS (para copiar/colar)
// =============================================================================

export const components = {
  // Card de produto padrão
  productCard: `
    bg-white
    rounded-[16px]
    shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
    w-full lg:w-[230px]
  `,

  // Botão primário (verde escuro)
  buttonPrimary: `
    bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999]
    rounded-[8px]
    font-cera-pro font-medium text-[16px] lg:font-bold lg:text-[24px] text-white
    px-[16px] py-[10px]
    transition-colors
  `,

  // Botão secundário (verde claro)
  buttonSecondary: `
    bg-[#D8F9E7] hover:bg-[#c5f0d9]
    rounded-[8px]
    font-cera-pro font-medium text-[16px] text-[#254333]
    px-[16px] py-[10px]
    transition-colors
  `,

  // Input padrão
  input: `
    bg-white border border-[#d2d2d2]
    rounded-[8px]
    font-cera-pro font-light text-[14px] lg:text-[20px] text-black
    p-[8px]
    focus:outline-none focus:border-[#254333]
  `,

  // Tag de alerta (últimas unidades, etc)
  alertTag: `
    bg-[#f8f3ed]
    rounded-[4px]
    px-[16px] py-[4px]
    font-cera-pro font-light text-[14px] text-[#b3261e]
  `,

  // Badge de sucesso
  successBadge: `
    bg-[#F0F9F4] border border-[#009142]
    rounded-lg
    p-3
    font-cera-pro font-light text-[12px] text-[#009142]
  `,
} as const;
