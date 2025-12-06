# Lové Cosméticos - Design System Patterns

> **IMPORTANTE PARA O CLAUDE**: Sempre leia este arquivo antes de criar novos componentes.
> Consulte também `tokens.ts` para valores exatos de cores, fontes e espaçamentos.

## Visão Geral

Este design system é baseado no Figma da Lové Cosméticos. Todos os componentes devem seguir estes padrões para manter consistência visual.

---

## 1. Estrutura de Componentes

### Convenções de Arquivo

```
ComponentName.tsx          // PascalCase
```

### Estrutura Básica

```tsx
"use client"; // Se usar hooks (useState, useEffect, etc)

import Image from "next/image";
import Link from "next/link";

interface ComponentNameProps {
  // Props com tipos explícitos
  title: string;
  onClick?: () => void;
}

export function ComponentName({ title, onClick }: ComponentNameProps) {
  return (
    <div className="...">
      {/* Conteúdo */}
    </div>
  );
}
```

---

## 2. Tipografia

### Fonte Principal
Sempre use `font-cera-pro` (Cera Pro). Nunca use fontes do sistema.

### Hierarquia de Títulos

| Elemento | Mobile | Desktop | Peso |
|----------|--------|---------|------|
| H1 | `text-[24px]` | `text-[32px]` | `font-bold` |
| H2 | `text-[20px]` | `text-[24px]` | `font-bold` |
| H3 | `text-[18px]` | `text-[20px]` | `font-bold` |
| H4 | `text-[16px]` | `text-[16px]` | `font-medium` |
| Body | `text-[14px]` | `text-[16px]` | `font-light` |
| Small | `text-[12px]` | `text-[12px]` | `font-light` |

### Exemplo

```tsx
// Título de seção
<h2 className="font-cera-pro font-bold text-[20px] lg:text-[24px] text-black leading-normal">
  Título da Seção
</h2>

// Texto descritivo
<p className="font-cera-pro font-light text-[14px] lg:text-[16px] text-[#333333] leading-normal">
  Descrição do produto ou seção.
</p>
```

---

## 3. Cores

### Paleta Principal

| Uso | Cor | Hex |
|-----|-----|-----|
| Primário (botões, header) | Verde Escuro | `#254333` |
| Secundário (botões alt) | Verde Claro | `#D8F9E7` |
| Background destaque | Bege/Creme | `#f8f3ed` |
| Sucesso/Desconto | Verde | `#009142` |
| Erro/Alerta | Vermelho | `#B3261E` |
| Texto principal | Preto | `#000000` |
| Texto secundário | Cinza | `#333333` |
| Bordas | Cinza claro | `#d2d2d2` |
| Destaque/Divider | Dourado | `#ba7900` |

### Regras de Uso

- **Header e Footer**: Sempre `bg-[#254333]` com texto branco
- **Cards**: Sempre `bg-white` com sombra
- **Botão primário**: `bg-[#254333]` com texto branco
- **Botão secundário**: `bg-[#D8F9E7]` com texto `#254333`
- **Tags de alerta**: `bg-[#f8f3ed]` com texto `#b3261e`
- **Preço com desconto**: Cor `#009142`
- **Preço original riscado**: Cor `#333333` com `line-through`

---

## 4. Sombras

### Sombra Padrão de Cards

```tsx
shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
```

### Sombra de Hover

```tsx
shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]
```

---

## 5. Border Radius

| Elemento | Valor |
|----------|-------|
| Tags, badges | `rounded-[4px]` |
| Botões, inputs | `rounded-[8px]` |
| Cards | `rounded-[16px]` ou `rounded-2xl` |

---

## 6. Responsividade

### Breakpoint Principal

O breakpoint `lg:` (1024px) é o ponto de transição entre mobile e desktop.

### Padrão Mobile-First

```tsx
// Mobile primeiro, depois desktop
<div className="px-4 lg:px-[32px]">
  <h2 className="text-[20px] lg:text-[24px]">
    Título
  </h2>
</div>
```

### Ocultação Condicional

```tsx
// Mostrar apenas no mobile
<div className="lg:hidden">...</div>

// Mostrar apenas no desktop
<div className="hidden lg:flex">...</div>
```

---

## 7. Botões

### Botão Primário (Comprar, Confirmar)

```tsx
<button className="
  bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999]
  rounded-[8px]
  flex items-center justify-center
  px-[16px] py-[10px]
  transition-colors
">
  <span className="font-cera-pro font-medium text-[16px] lg:font-bold lg:text-[24px] text-white">
    Comprar
  </span>
</button>
```

### Botão Secundário (Compartilhar, Adicionar)

```tsx
<button className="
  bg-[#D8F9E7] hover:bg-[#c5f0d9]
  rounded-[8px]
  flex items-center justify-center
  px-[16px] py-[10px]
  transition-colors
">
  <span className="font-cera-pro font-medium text-[16px] text-[#254333]">
    Adicionar ao carrinho
  </span>
</button>
```

### Botão como Card Clicável

```tsx
<button className="
  w-full rounded-[8px]
  border border-transparent
  shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
  bg-white p-4 text-left
  transition-all
  hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.3),0px_2px_6px_2px_rgba(0,0,0,0.15)]
">
  {/* Conteúdo */}
</button>
```

---

## 8. Inputs

### Input Padrão

```tsx
<div className="bg-white border border-[#d2d2d2] flex items-center p-[8px] rounded-[8px]">
  <input
    type="text"
    placeholder="Digite aqui"
    className="
      flex-1
      font-cera-pro font-light text-[14px] lg:text-[20px] text-black
      leading-normal
      px-[8px]
      focus:outline-none
      bg-transparent
    "
  />
</div>
```

### Input com Botão Interno

```tsx
<div className="bg-white border border-[#d2d2d2] flex items-center justify-between p-[8px] rounded-[8px]">
  <input
    type="text"
    placeholder="Digite seu CEP"
    className="flex-1 font-cera-pro font-light text-[14px] lg:text-[20px] text-black px-[8px] focus:outline-none bg-transparent"
  />
  <button className="
    bg-[#254333] hover:bg-[#1a3226] disabled:bg-[#999999]
    rounded-[4px]
    px-[16px] py-[10px]
    transition-colors
  ">
    <span className="font-cera-pro font-medium text-[16px] text-white">
      Calcular
    </span>
  </button>
</div>
```

---

## 9. Cards

### Card de Produto

```tsx
<div className="
  bg-white
  rounded-[16px]
  shadow-[0px_1px_2px_0px_rgba(0,0,0,0.3),0px_1px_3px_1px_rgba(0,0,0,0.15)]
  w-full lg:w-[230px]
  pb-[16px]
">
  {/* Imagem */}
  <div className="relative w-full h-[196px] rounded-t-[16px] overflow-hidden">
    <Image src="..." alt="..." fill className="object-cover" />
  </div>

  {/* Conteúdo */}
  <div className="flex flex-col gap-[12px] px-[16px] pt-[16px]">
    <p className="font-cera-pro font-medium text-[16px] text-black">
      Nome do Produto
    </p>
    <p className="font-cera-pro font-light text-[14px] text-black line-clamp-3">
      Descrição do produto...
    </p>
    <div className="flex flex-col gap-[2px]">
      <p className="font-cera-pro font-light text-[12px] text-[#333333] line-through">
        R$ 99,90
      </p>
      <div className="flex gap-[8px] items-center">
        <p className="font-cera-pro font-bold text-[20px] text-black">
          R$ 79,90
        </p>
        <p className="font-cera-pro font-light text-[14px] text-[#009142]">
          -20%
        </p>
      </div>
    </div>
  </div>
</div>
```

---

## 10. Seções Expansíveis (Accordion)

```tsx
<div className="w-full bg-white border-b border-[#d2d2d2]">
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between px-[16px] py-[16px] hover:bg-[#f8f3ed] transition-colors"
  >
    <p className="font-cera-pro font-bold text-[24px] text-black">
      {title}
    </p>
    <Image
      src="/new-home/icons/chevron-down.svg"
      alt="Expandir"
      width={24}
      height={24}
      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
    />
  </button>

  {isExpanded && (
    <div className="px-[16px] pb-[16px]">
      {children}
    </div>
  )}
</div>
```

---

## 11. Tags e Badges

### Tag de Alerta (Últimas Unidades)

```tsx
<div className="bg-[#f8f3ed] flex gap-[4px] items-center px-[16px] py-[4px] rounded-[4px]">
  <Image src="/new-home/icons/alert.svg" alt="" width={16} height={16} />
  <p className="font-cera-pro font-light text-[14px] text-[#b3261e]">
    Últimas unidades
  </p>
</div>
```

### Badge de Sucesso

```tsx
<div className="p-3 bg-[#F0F9F4] rounded-lg border border-[#009142]">
  <div className="flex items-center gap-2">
    <Image src="/new-home/icons/verified-green.svg" alt="" width={16} height={16} />
    <p className="font-cera-pro font-light text-[12px] text-[#009142]">
      Confirmado com sucesso
    </p>
  </div>
</div>
```

---

## 12. Ícones e Imagens

### Regras Gerais

1. Sempre use `next/image` para otimização
2. Ícones estão em `/new-home/icons/`
3. Logos e assets em `/new-home/header/`, `/new-home/footer/`, etc.

### Padrão de Imagem Responsiva

```tsx
<div className="relative w-full h-[200px] lg:h-[300px]">
  <Image
    src="/caminho/imagem.jpg"
    alt="Descrição"
    fill
    className="object-cover"
  />
</div>
```

### Ícone com Tamanho Fixo

```tsx
<Image
  src="/new-home/icons/icon.svg"
  alt=""
  width={24}
  height={24}
  className="w-6 h-6"
/>
```

---

## 13. Layout de Páginas

### Container Padrão

```tsx
<div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[32px]">
  {/* Conteúdo */}
</div>
```

### Seção com Gap

```tsx
<section className="flex flex-col gap-6 lg:gap-[32px] py-6 lg:py-[24px]">
  {/* Conteúdo */}
</section>
```

---

## 14. Estados

### Loading

```tsx
<button disabled className="bg-[#999999] ...">
  <span>Carregando...</span>
</button>
```

### Erro

```tsx
<div className="flex gap-[8px] items-center bg-red-50 rounded-lg p-3">
  <p className="font-cera-pro font-light text-[14px] text-[#B3261E]">
    Mensagem de erro aqui
  </p>
</div>
```

### Selecionado/Ativo

```tsx
<div className="border-2 border-[#254333] bg-[#F0F9F4] rounded-[8px]">
  {/* Item selecionado */}
</div>
```

---

## Checklist para Novos Componentes

Antes de finalizar um componente, verifique:

- [ ] Usa `font-cera-pro` em todos os textos
- [ ] Cores estão conforme a paleta (ver `tokens.ts`)
- [ ] Responsivo com breakpoint `lg:` para desktop
- [ ] Sombras de card estão corretas
- [ ] Border radius consistente (4px, 8px ou 16px)
- [ ] Usa `next/image` para imagens
- [ ] Estados de hover e disabled definidos
- [ ] Interface TypeScript para props
