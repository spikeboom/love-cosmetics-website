# Fontes do Projeto - Design Figma

## 📝 Fontes Usadas no Figma

### 1. **Cera Pro** ✅ (Fonte Original)
Cera Pro é a fonte comercial original do design Figma, agora integrada ao projeto.

**Pesos configurados:**
- Light 300: textos pequenos (12px, 14px, 20px)
- Medium 500: títulos H4 (16px)
- Bold 700: títulos H1 (32px), H2 (24px), H3 (20px)

**Uso no Tailwind:**
```tsx
className="font-nunito font-light text-[14px]"  // Love Texto 14
className="font-nunito font-medium text-[16px]" // Título H4
className="font-nunito font-bold text-[20px]"   // Love Título H3
className="font-nunito font-bold text-[24px]"   // Love Título H2
className="font-nunito font-bold text-[32px]"   // Love Título H1
```

Ou use o alias `font-cera-pro`:
```tsx
className="font-cera-pro font-bold text-[20px]"
```

---

### 2. **Roboto**
Fonte do Google Material Design.

**Pesos configurados:**
- Medium 500: elementos Material Design (16px)

**Uso no Tailwind:**
```tsx
className="font-roboto font-medium text-[16px]" // M3/title/medium
```

---

### 3. **Times New Roman** ✅ (Fonte de Sistema)
Times New Roman é a fonte serifada original do design, carregada diretamente do sistema operacional.

**Pesos configurados:**
- Bold 700: títulos especiais do banner (32px, 60px)

**Uso no Tailwind:**
```tsx
className="font-libre-baskerville font-bold text-[60px]" // Banner principal
className="font-times font-bold text-[32px]"              // Alias para Times
```

---

## 🎨 Hierarquia de Tipografia (Figma)

| Nome Figma           | Fonte        | Peso | Tamanho | Uso                          | Classe Tailwind                          |
|---------------------|--------------|------|---------|------------------------------|------------------------------------------|
| Love Título Times H1| Times        | 700  | 60px    | Banner principal             | `font-times font-bold text-[60px]`      |
| Love Título H1      | Cera Pro     | 700  | 32px    | Títulos grandes              | `font-cera-pro font-bold text-[32px]`   |
| Love Título H2      | Cera Pro     | 700  | 24px    | Subtítulos                   | `font-cera-pro font-bold text-[24px]`   |
| Love Título H3      | Cera Pro     | 700  | 20px    | Títulos de cards             | `font-cera-pro font-bold text-[20px]`   |
| Título H4           | Cera Pro     | 500  | 16px    | Títulos pequenos             | `font-cera-pro font-medium text-[16px]` |
| Love Texto 20       | Cera Pro     | 300  | 20px    | Textos maiores               | `font-cera-pro font-light text-[20px]`  |
| Love Texto 14       | Cera Pro     | 300  | 14px    | Textos padrão                | `font-cera-pro font-light text-[14px]`  |
| Love Texto 12       | Cera Pro     | 300  | 12px    | Textos pequenos              | `font-cera-pro font-light text-[12px]`  |
| M3/title/medium     | Roboto       | 500  | 16px    | Material Design titles       | `font-roboto font-medium text-[16px]`   |

---

## 🚀 Como Usar

### 1. As fontes já estão configuradas no layout:
```tsx
// src/app/(figma)/layout.tsx
import { fontClasses } from "@/lib/fonts";

<div className={fontClasses}>
  {/* Seu conteúdo */}
</div>
```

### 2. Use as classes do Tailwind diretamente:
```tsx
<h1 className="font-cera-pro font-bold text-[32px]">
  Título Principal
</h1>

<p className="font-cera-pro font-light text-[14px]">
  Texto de parágrafo
</p>

<h2 className="font-times font-bold text-[60px]">
  Manteiga Corporal
</h2>
```

---

## 📦 Fontes Instaladas

**Cera Pro** é carregada localmente via `next/font/local`:

```ts
// src/lib/fonts/index.ts
import localFont from "next/font/local";

export const ceraPro = localFont({
  src: [
    { path: "../../../public/fonts/cera-pro/CeraProLight.otf", weight: "300" },
    { path: "../../../public/fonts/cera-pro/CeraProMedium.otf", weight: "500" },
    { path: "../../../public/fonts/cera-pro/CeraProBold.otf", weight: "700" },
  ],
  variable: "--font-cera-pro",
});
```

**Roboto** é carregada via `next/font/google`:

```ts
import { Roboto } from "next/font/google";
```

Isso garante:
- ✅ Otimização automática de fontes
- ✅ Zero layout shift
- ✅ Performance otimizada
- ✅ Self-hosting automático

---

## 🎯 Cores do Figma

Para referência, aqui estão as cores principais do design:

```css
--verde-principal: #254333
--dourado-love: #e7a63a
--preto: #000000
--preto-rose: #333333
--creme-secundario: #f8f3ed
--dourado-escuro: #ba7900
--branco: #ffffff
--vermelho-love: #b3261e
--verde-claro: #009142
--cinza-claro-rose: #f2f2f2
```
