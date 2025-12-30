# 03 - Guia de Componentes

> Como criar e organizar componentes no projeto.

---

## Anatomia de um Componente

### Estrutura Basica

```typescript
"use client"; // Apenas se usar hooks/eventos

import { useState } from "react";
import { useCart } from "@/contexts/cart";
import { formatPrice } from "@/lib/formatters";
import type { Product } from "@/types";

// 1. Interface de Props
interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
  showPrice?: boolean;
}

// 2. Componente
export function ProductCard({
  product,
  onAddToCart,
  showPrice = true,
}: ProductCardProps) {
  // 3. Hooks (sempre no topo)
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  // 4. Handlers
  const handleAdd = () => {
    addItem(product);
    onAddToCart?.(product.id);
  };

  // 5. Render
  return (
    <div
      className="p-4 border rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={product.imagem} alt={product.nome} />
      <h3>{product.nome}</h3>
      {showPrice && <p>{formatPrice(product.preco)}</p>}
      <button onClick={handleAdd}>Adicionar</button>
    </div>
  );
}
```

---

## Tamanho de Componentes

### Limites Recomendados

| Complexidade | Linhas | Acao |
|--------------|--------|------|
| Simples | < 50 | OK |
| Medio | 50-100 | Considerar extrair |
| Grande | 100-200 | Extrair subcomponentes |
| Critico | > 200 | OBRIGATORIO extrair |

### Sinais de que Precisa Extrair

1. **Componente tem mais de 200 linhas** - Dividir em subcomponentes
2. **JSX repetitivo** - Extrair para componente reutilizavel
3. **Logica complexa** - Extrair para hook
4. **Dados hardcoded** - Extrair para arquivo de dados
5. **Multiplos estados** - Considerar hook ou context

---

## Padroes de Extracao

### 1. Extrair Componentes Inline

```typescript
// ANTES - Componente inline (ERRADO)
function ParentComponent() {
  // Componente definido dentro de outro
  function IconBox({ icon }: { icon: string }) {
    return <div className="icon-box">{icon}</div>;
  }

  return <IconBox icon="star" />;
}

// DEPOIS - Componente em arquivo proprio (CERTO)
// components/IconBox.tsx
export function IconBox({ icon }: { icon: string }) {
  return <div className="icon-box">{icon}</div>;
}

// ParentComponent.tsx
import { IconBox } from "./components/IconBox";

function ParentComponent() {
  return <IconBox icon="star" />;
}
```

### 2. Extrair Logica para Hook

```typescript
// ANTES - Logica no componente (ERRADO)
function IdentificacaoPage() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // 50 linhas de logica de formulario...
  const handleChange = (e) => { ... };
  const validate = () => { ... };
  const formatCPF = () => { ... };

  return <form>...</form>;
}

// DEPOIS - Logica em hook (CERTO)
// hooks/useIdentificacaoForm.ts
export function useIdentificacaoForm() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => { ... };
  const validateForm = () => { ... };

  return { formData, errors, handleChange, validateForm };
}

// IdentificacaoPage.tsx
function IdentificacaoPage() {
  const { formData, errors, handleChange, validateForm } = useIdentificacaoForm();

  return <form>...</form>;  // Apenas UI
}
```

### 3. Extrair Dados para Arquivo

```typescript
// ANTES - Dados hardcoded (ERRADO)
function VIPLanding() {
  const beneficios = [
    { titulo: "Frete Gratis", descricao: "..." },
    { titulo: "Descontos", descricao: "..." },
    // mais 20 itens...
  ];

  return <div>...</div>;
}

// DEPOIS - Dados em arquivo separado (CERTO)
// vip-content.ts
export const beneficios = [
  { titulo: "Frete Gratis", descricao: "..." },
  { titulo: "Descontos", descricao: "..." },
];

// VIPLanding.tsx
import { beneficios } from "./vip-content";

function VIPLanding() {
  return <div>...</div>;
}
```

---

## Organizacao de Pasta de Componentes

### Para Paginas com Multiplos Componentes

```
pagina/
  page.tsx                 # Server component (data fetching)
  PaginaClient.tsx         # Client component principal
  components/
    index.ts               # Re-exports
    types.ts               # Interfaces locais
    SubComponenteA.tsx
    SubComponenteB.tsx
    SubComponenteC.tsx
```

### Exemplo: Pagina de Confirmacao

```
confirmacao/
  page.tsx                 # 247 linhas - orquestrador
  ConfirmacaoStepper.tsx   # Stepper visual
  components/
    index.ts
    types.ts               # PedidoStatus, PedidoDetalhes, PageStatus
    LoadingState.tsx       # Tela de loading (~12 linhas)
    ErrorState.tsx         # Tela de erro (~30 linhas)
    SuccessState.tsx       # Resumo do pedido (~110 linhas)
    AccountForm.tsx        # Formulario de conta (~150 linhas)
```

### index.ts para Re-exports

```typescript
// components/index.ts
export { LoadingState } from "./LoadingState";
export { ErrorState } from "./ErrorState";
export { SuccessState } from "./SuccessState";
export { AccountForm } from "./AccountForm";
export type { PedidoStatus, PedidoDetalhes, PageStatus } from "./types";
```

---

## Componentes Compartilhados

### Icones (`src/components/figma-shared/icons/`)

```typescript
// Icones com variantes
import { VerifiedIcon, ChevronRightIcon } from "@/components/figma-shared/icons";

// Uso
<VerifiedIcon className="w-6 h-6 text-green-500" />
<VerifiedIcon className="w-8 h-8" variant="gold" />
<ChevronRightIcon className="w-4 h-4" variant="stroke" />
<ChevronRightIcon className="w-4 h-4" variant="filled" />
```

### Icones Disponiveis

| Icone | Variantes | Uso |
|-------|-----------|-----|
| `VerifiedIcon` | `default`, `gold` | Status aprovado, verificado |
| `PendingIcon` | - | Status pendente |
| `ChevronRightIcon` | `stroke`, `filled` | Navegacao, steppers |
| `ArrowForwardIcon` | - | Botoes, progresso |

### Quando Criar Novo Icone

1. Verificar se ja existe em `figma-shared/icons/`
2. Se nao existir, criar seguindo o padrao:

```typescript
// src/components/figma-shared/icons/NovoIcon.tsx
interface NovoIconProps {
  className?: string;
  variant?: "default" | "alt";
}

export function NovoIcon({ className = "", variant = "default" }: NovoIconProps) {
  const color = variant === "alt" ? "#color" : "currentColor";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="..." fill={color} />
    </svg>
  );
}

// Adicionar no index.ts
export { NovoIcon } from "./NovoIcon";
```

---

## Componentes de Formulario

### Padrao com FormField

```typescript
// Componente FormField reutilizavel
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// Uso
<FormField label="CPF" error={errors.cpf}>
  <input
    type="text"
    value={formData.cpf}
    onChange={handleChange}
    className="w-full p-2 border rounded"
  />
</FormField>
```

### Inputs com Formatacao

```typescript
import { formatCPF, formatTelefone } from "@/lib/formatters";

// Input com formatacao automatica
<input
  type="text"
  value={formData.cpf}
  onChange={(e) => {
    const formatted = formatCPF(e.target.value);
    handleChange({ ...formData, cpf: formatted });
  }}
  maxLength={14}  // 000.000.000-00
/>
```

---

## State Machines para Paginas Complexas

### Padrao com PageStatus

```typescript
// types.ts
type PageStatus = "loading" | "error" | "success" | "form";

// page.tsx
function ConfirmacaoPage() {
  const [status, setStatus] = useState<PageStatus>("loading");

  // Renderizacao condicional por status
  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState onRetry={retry} />;
  if (status === "success") return <SuccessState pedido={pedido} />;
  if (status === "form") return <AccountForm onSubmit={handleSubmit} />;
}
```

---

## Componentes de Loading

### Skeleton Pattern

```typescript
// Skeleton para cards
function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 h-48 rounded-lg mb-4" />
      <div className="bg-gray-200 h-4 w-3/4 rounded mb-2" />
      <div className="bg-gray-200 h-4 w-1/2 rounded" />
    </div>
  );
}

// Uso durante loading
{isLoading ? (
  <ProductCardSkeleton />
) : (
  <ProductCard product={product} />
)}
```

### Spinner Pattern

```typescript
function LoadingSpinner({ message = "Carregando..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}
```

---

## Checklist de Componente

Antes de finalizar um componente, verifique:

- [ ] Menos de 200 linhas
- [ ] Props tipadas com interface
- [ ] Sem componentes inline (definidos dentro do componente)
- [ ] Sem dados hardcoded (extrair para arquivo)
- [ ] Logica complexa em hook separado
- [ ] Usando formatters de `@/lib/formatters`
- [ ] Usando icones de `@/components/figma-shared/icons`
- [ ] Sem imports de `useMeuContexto` (usar hooks especificos)

---

## Proximos Passos

Leia [04-hooks-contextos.md](./04-hooks-contextos.md) para entender hooks e contextos.
