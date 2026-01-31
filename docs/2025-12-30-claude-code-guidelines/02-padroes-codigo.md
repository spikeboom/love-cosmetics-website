# 02 - Padroes de Codigo

> Convencoes obrigatorias para manter consistencia no projeto.

---

## TypeScript

### Sempre Tipar

```typescript
// CERTO - Tipos explicitos
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  showPrice?: boolean;
}

function ProductCard({ product, onAddToCart, showPrice = true }: ProductCardProps) {
  // ...
}

// ERRADO - any ou sem tipos
function ProductCard({ product, onAddToCart }: any) {
  // ...
}
```

### Interfaces vs Types

```typescript
// USAR interface para objetos
interface User {
  id: string;
  name: string;
  email: string;
}

// USAR type para uniao/intersecao
type Status = "loading" | "success" | "error";
type PageStatus = "loading" | "error" | "success" | "form";

// USAR type para funcoes
type FormatFn = (value: string) => string;
```

### Evitar any

```typescript
// ERRADO
const data: any = await fetch(url);

// CERTO
interface ApiResponse {
  success: boolean;
  data: Product[];
}
const response: ApiResponse = await fetch(url).then(r => r.json());
```

---

## React/Next.js

### Componentes Funcionais

```typescript
// CERTO - Arrow function com tipos
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
}

// ERRADO - Class components
class Button extends React.Component { ... }
```

### Server vs Client Components

```typescript
// Server Component (padrao) - NAO usar "use client"
// page.tsx
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// Client Component - REQUER "use client"
// ClientComponent.tsx
"use client";

import { useState } from "react";

export function ClientComponent({ data }) {
  const [state, setState] = useState(data);
  // ...
}
```

### Hooks Rules

```typescript
// CERTO - Hooks no topo, sempre na mesma ordem
function Component() {
  const [state, setState] = useState(null);
  const { items } = useCart();
  const router = useRouter();

  useEffect(() => {
    // ...
  }, []);

  return <div>...</div>;
}

// ERRADO - Hooks condicionais
function Component({ show }) {
  if (show) {
    const [state, setState] = useState(null); // ERRO!
  }
}
```

---

## Naming Conventions

### Arquivos

| Tipo | Padrao | Exemplo |
|------|--------|---------|
| Componente | PascalCase | `ProductCard.tsx` |
| Hook | camelCase com "use" | `useCart.ts` |
| Utilitario | kebab-case | `format-price.ts` |
| Tipo/Interface | camelCase ou types.ts | `types.ts` |
| Constantes | UPPER_SNAKE_CASE | `STATUS_LABELS` |

### Variaveis e Funcoes

```typescript
// Componentes: PascalCase
function ProductCard() {}

// Hooks: camelCase com "use"
function useCart() {}

// Funcoes: camelCase
function formatPrice(value: number) {}
function handleClick() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_ITEMS = 10;
const STATUS_LABELS = { ... };

// Variaveis: camelCase
const isLoading = true;
const productList = [];
```

### Props e Handlers

```typescript
// Props: substantivos
interface Props {
  product: Product;      // CERTO
  isVisible: boolean;    // CERTO
  maxItems: number;      // CERTO
}

// Handlers: on + Acao
interface Props {
  onClick: () => void;           // CERTO
  onAddToCart: (id: string) => void;  // CERTO
  handleClick: () => void;       // ERRADO - usar "on" para props
}

// Dentro do componente: handle + Acao
function Component({ onClick }: Props) {
  const handleButtonClick = () => {
    // logica local
    onClick();
  };
}
```

---

## Formatacao e Estilo

### Indentacao

- 2 espacos (configurado no projeto)
- Sem tabs

### Aspas

```typescript
// CERTO - Aspas duplas para JSX, simples para strings
const name = 'John';
return <div className="container">Hello</div>;
```

### Imports

```typescript
// Agrupar e ordenar
import { useState, useEffect } from "react";              // 1. React
import { useRouter } from "next/navigation";              // 2. Next
import { useCart } from "@/contexts/cart";                // 3. Contextos
import { formatPrice } from "@/lib/formatters";           // 4. Utils
import { Button } from "@/components/ui";                 // 5. Componentes
import type { Product } from "@/types";                   // 6. Tipos
```

### Exportacoes

```typescript
// PREFERIR named exports
export function ProductCard() {}
export const STATUS_LABELS = {};

// EVITAR default exports (exceto pages)
// export default function ProductCard() {}

// Em index.ts - re-exportar tudo
export { ProductCard } from "./ProductCard";
export { StatusBadge } from "./StatusBadge";
export type { ProductCardProps } from "./types";
```

---

## Tailwind CSS

### Classes Inline

```tsx
// CERTO - Classes diretas para componentes simples
<button className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
  Comprar
</button>

// CERTO - Template literals para condicionais
<div className={`p-4 rounded ${isActive ? 'bg-pink-100' : 'bg-gray-100'}`}>
  ...
</div>
```

### Ordem de Classes

```tsx
// Ordem recomendada:
// 1. Layout (display, position)
// 2. Spacing (margin, padding)
// 3. Sizing (width, height)
// 4. Typography (font, text)
// 5. Background/Border
// 6. Effects (shadow, opacity)
// 7. Responsive (sm:, md:, lg:)

<div className="flex flex-col p-4 w-full text-lg bg-white border rounded-lg shadow-sm md:flex-row">
  ...
</div>
```

### Cores do Projeto

```tsx
// Cores principais
// Pink: bg-pink-500, text-pink-600, border-pink-300
// Gold/Amber: text-amber-500, bg-amber-100
// Gray: bg-gray-100, text-gray-600, border-gray-200
// Green (sucesso): text-green-600, bg-green-100
// Red (erro): text-red-600, bg-red-100
```

---

## Boas Praticas

### Funcoes Puras

```typescript
// CERTO - Funcao pura, sem side effects
function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// ERRADO - Funcao impura, le estado global
function formatPrice(value: number): string {
  const config = window.globalConfig; // NAO!
  return ...;
}
```

### Early Returns

```typescript
// CERTO - Retornos antecipados
function getDiscount(user: User | null): number {
  if (!user) return 0;
  if (!user.isVip) return 0;
  return user.vipDiscount;
}

// ERRADO - Aninhamento excessivo
function getDiscount(user: User | null): number {
  if (user) {
    if (user.isVip) {
      return user.vipDiscount;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}
```

### Destructuring

```typescript
// CERTO - Destructuring nas props
function ProductCard({ product, onAddToCart }: Props) {
  const { nome, preco, imagem } = product;
  // ...
}

// EVITAR - Acessos repetidos
function ProductCard(props: Props) {
  return (
    <div>
      <h1>{props.product.nome}</h1>
      <p>{props.product.preco}</p>
      <img src={props.product.imagem} />
    </div>
  );
}
```

### Optional Chaining

```typescript
// CERTO - Optional chaining
const userName = user?.profile?.name ?? "Visitante";
const firstItem = items?.[0];

// EVITAR - Verificacoes manuais
const userName = user && user.profile && user.profile.name ? user.profile.name : "Visitante";
```

---

## Comentarios

### Quando Comentar

```typescript
// CERTO - Explicar o "por que", nao o "o que"
// Usa regex para validar CPF pois a API requer formato sem pontuacao
const cpfLimpo = cpf.replace(/\D/g, "");

// ERRADO - Comentario obvio
// Remove caracteres nao numericos do CPF
const cpfLimpo = cpf.replace(/\D/g, "");
```

### JSDoc para Funcoes Publicas

```typescript
/**
 * Formata um valor numerico como moeda brasileira.
 *
 * @param value - Valor em centavos ou reais
 * @returns String formatada (ex: "R$ 99,90")
 *
 * @example
 * formatPrice(99.90) // "R$ 99,90"
 * formatPrice(1000)  // "R$ 1.000,00"
 */
export function formatPrice(value: number): string {
  // ...
}
```

### TODO Comments

```typescript
// TODO: Implementar cache de produtos
// TODO(auth): Adicionar refresh token
// FIXME: Corrigir calculo de frete para regioes Norte
```

---

## Anti-Patterns a Evitar

### 1. Prop Drilling Excessivo

```typescript
// ERRADO - Passar props por 5 niveis
<App user={user}>
  <Layout user={user}>
    <Header user={user}>
      <Nav user={user}>
        <Avatar user={user} />

// CERTO - Usar contexto
function Avatar() {
  const { user } = useAuth();
  return <img src={user.avatar} />;
}
```

### 2. useEffect para Estado Derivado

```typescript
// ERRADO - useEffect para calcular
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]);

// CERTO - useMemo para derivar
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

### 3. Logica de Negocio no Componente

```typescript
// ERRADO - Validacao no componente
function Form() {
  const [cpf, setCpf] = useState("");

  const handleSubmit = () => {
    const numbers = cpf.replace(/\D/g, "");
    if (numbers.length !== 11) return;
    // mais 20 linhas de validacao...
  };
}

// CERTO - Extrair para hook ou util
function Form() {
  const { formData, errors, validateForm } = useIdentificacaoForm();

  const handleSubmit = () => {
    if (validateForm()) {
      // submit
    }
  };
}
```

---

## Proximos Passos

Leia [03-componentes.md](./03-componentes.md) para entender como criar componentes.
