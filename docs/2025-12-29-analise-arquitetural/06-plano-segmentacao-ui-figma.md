# Plano de Segmentacao UI - Grupo Figma

> Analise completa e plano de refatoracao para segmentar a UI do grupo de rotas `(figma)`

## Sumario Executivo

### Arquivos Analisados

| Arquivo | Linhas | Severidade | Problemas |
|---------|--------|------------|-----------|
| `confirmacao/page.tsx` | 557 | CRITICO | Monolitico, multiplas telas em 1 arquivo |
| `ProductPageClient.tsx` | 493 | CRITICO | SRP violado, logica mista |
| `VIPLandingClient.tsx` | 464 | CRITICO | Componentes inline, dados hardcoded |
| `PagamentoCartaoReal.tsx` | 440 | GRAVE | Formulario grande, logica acoplada |
| `EntregaPageClient.tsx` | 438 | CRITICO | 3 useEffects complexos, validacao mista |
| `DetalhesPedidoClient.tsx` | 393 | GRAVE | Calculos inline, icones duplicados |
| `MeusPedidosClient.tsx` | 368 | CRITICO | PedidoCard inline (200+ linhas) |
| `PagamentoPixReal.tsx` | 357 | GRAVE | Similar ao CartaoReal |
| `cadastrar/page.tsx` | 342 | MODERADO | Formulario grande |
| `CartProductCard.tsx` | 298 | MODERADO | Logica de quantidade inline |
| `IdentificacaoPageClient.tsx` | 286 | GRAVE | Formatacao e validacao mistas |

**Total de arquivos >200 linhas:** 15
**Linhas totais nos maiores arquivos:** ~5.400

---

## PARTE 1: Componentes Inline a Extrair

### 1.1 VIPLandingClient.tsx (464 linhas)

**Componentes inline detectados:**

```typescript
// Linha 86-103
function IconBox({ icon }: { icon: string }) { ... }

// Linha 105-121
function CTAButton({ children, secondary = false }: { ... }) { ... }

// Linha 123-136
function Pill({ children, accent = false }: { ... }) { ... }
```

**Acao:** Extrair para `src/app/(figma)/(landing)/vip/components/`

| Componente | Destino | Reutilizavel? |
|------------|---------|---------------|
| `IconBox` | `vip/components/IconBox.tsx` | Sim |
| `CTAButton` | `vip/components/CTAButton.tsx` | Sim |
| `Pill` | `vip/components/Pill.tsx` | Sim |

**Dados hardcoded a extrair:**

```typescript
// Linhas 10-72
const beneficios = [...];
const diferenciais = [...];
const passos = [...];
const faqs = [...];
```

**Acao:** Criar `vip/data/vip-content.ts`

---

### 1.2 MeusPedidosClient.tsx (368 linhas)

**Componente inline detectado:**

```typescript
// Linhas 73-204 (131 linhas!)
function PedidoCard({ pedido, formatDate, formatTime, formatPrice }) { ... }
```

**Acao:** Extrair para `minha-conta/pedidos/components/PedidoCard.tsx`

**Icones inline detectados:**

```typescript
// Linhas 55-69
function ArrowForwardIcon() { ... }
function VerifiedIcon() { ... }
```

**Acao:** Mover para `src/components/figma-shared/icons/`

---

### 1.3 DetalhesPedidoClient.tsx (393 linhas)

**Icones inline detectados:**

```typescript
// Linhas 66-90
function VerifiedIcon({ className }) { ... }
function PendingIcon({ className }) { ... }
function ChevronRightIcon({ className }) { ... }
```

**Acao:** Consolidar em `src/components/figma-shared/icons/StatusIcons.tsx`

---

### 1.4 confirmacao/page.tsx (557 linhas)

**Icone inline detectado:**

```typescript
// Linhas 10-16
function VerifiedIcon({ className }) { ... }
```

**Problema principal:** Arquivo monolitico com 4 telas diferentes:
- Loading
- Error
- Success (confirmacao logada)
- Form (criar conta ou login)

**Acao:** Dividir em componentes:

| Componente | Responsabilidade |
|------------|------------------|
| `ConfirmacaoLoading.tsx` | Tela de loading |
| `ConfirmacaoError.tsx` | Tela de erro |
| `ConfirmacaoSuccess.tsx` | Tela de sucesso com resumo |
| `ConfirmacaoForm.tsx` | Formulario de conta/login |
| `ConfirmacaoContent.tsx` | Orquestrador (state machine) |

---

## PARTE 2: Utilitarios de Formatacao a Criar

### 2.1 Funcoes de Formatacao Duplicadas

**Encontradas em multiplos arquivos:**

| Funcao | Arquivos | Linhas totais |
|--------|----------|---------------|
| `formatPrice` | 8 arquivos | ~40 |
| `formatDate` | 4 arquivos | ~20 |
| `formatDateTime` | 2 arquivos | ~10 |
| `formatCPF` | 3 arquivos | ~24 |
| `formatTelefone` | 2 arquivos | ~14 |
| `formatCEP` | 2 arquivos | ~8 |
| `formatCardNumber` | 2 arquivos | ~16 |
| `formatValidade` | 1 arquivo | ~8 |

**Acao:** Criar `src/lib/formatters/`

```
src/lib/formatters/
  index.ts              # Re-exports
  currency.ts           # formatPrice, formatCurrency
  date.ts               # formatDate, formatDateTime, formatTime
  document.ts           # formatCPF, formatCNPJ
  contact.ts            # formatTelefone, formatCEP
  payment.ts            # formatCardNumber, formatValidade
```

### 2.2 Implementacao Proposta

```typescript
// src/lib/formatters/currency.ts
export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).replace("R$", "R$ ");
}

// src/lib/formatters/document.ts
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

export function formatTelefone(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return numbers
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}
```

---

## PARTE 3: Hooks Customizados a Criar

### 3.1 Hooks de Formulario

**Problema:** Logica de formulario repetida em:
- `IdentificacaoPageClient.tsx`
- `EntregaPageClient.tsx`
- `cadastrar/page.tsx`

**Acao:** Criar hooks especificos:

```typescript
// src/hooks/checkout/useIdentificacaoForm.ts
export function useIdentificacaoForm() {
  // Estado do form
  // Validacao
  // Formatacao
  // Persistencia localStorage
  // Carregamento usuario logado
}

// src/hooks/checkout/useEntregaForm.ts
export function useEntregaForm() {
  // Estado do form
  // Integracao ViaCep
  // Validacao
  // Sincronizacao com ShippingContext
}
```

### 3.2 Hooks de Pedidos

**Problema:** Logica duplicada em `MeusPedidosClient` e `DetalhesPedidoClient`

```typescript
// src/hooks/pedidos/usePedidos.ts
export function usePedidos(options?: { limit?: number }) {
  // Fetch lista de pedidos
  // Paginacao
  // Loading/error states
}

// src/hooks/pedidos/usePedidoDetalhes.ts
export function usePedidoDetalhes(pedidoId: string) {
  // Fetch detalhes
  // Calculos de totais
  // Formatacao de status
}
```

---

## PARTE 4: Estrutura de Pastas Proposta

### 4.1 Estrutura Atual vs Proposta

**Atual:**
```
src/app/(figma)/
  (main)/figma/
    components/           # 20 componentes misturados
    cart/                 # 6 arquivos
    minha-conta/pedidos/  # 4 arquivos
    product/[slug]/       # 2 arquivos
  (checkout)/figma/checkout/
    pagamento/components/ # 8 arquivos
  (landing)/vip/          # 2 arquivos
```

**Proposta:**
```
src/app/(figma)/
  (main)/figma/
    components/
      layout/             # Header, Footer
      product/            # ProductGallery, ProductInfo, ProductActionButtons
      sections/           # BannerPrincipal, VitrineSection, CertificadosSection
      shared/             # Breadcrumbs, NavigationArrows, ExpandableSection
    cart/
      components/         # CartHeader, CartProductCard, CartSummary, etc
    minha-conta/
      pedidos/
        components/       # PedidoCard, PedidoTimeline
        [id]/
  (checkout)/figma/checkout/
    components/           # CheckoutStepper, CheckoutHeader, CheckoutFooter
    pagamento/
      components/         # Separar por metodo de pagamento
        cartao/
        pix/
        shared/
    confirmacao/
      components/         # ConfirmacaoSuccess, ConfirmacaoForm, etc
  (landing)/
    vip/
      components/         # IconBox, CTAButton, Pill
      data/               # vip-content.ts

src/components/figma-shared/
  icons/                  # Icones compartilhados (VerifiedIcon, etc)
  feedback/               # LoadingSpinner, ErrorMessage, etc
```

---

## PARTE 5: Plano de Refatoracao Incremental

### Fase 1: Extrair Icones (Risco: BAIXO)

**Estimativa:** ~30 minutos

1. Criar `src/components/figma-shared/icons/`
2. Extrair `VerifiedIcon` (usado em 3 arquivos)
3. Extrair `PendingIcon`, `ChevronRightIcon`
4. Extrair `ArrowForwardIcon`
5. Atualizar imports nos arquivos originais

**Arquivos afetados:** 4
**Linhas removidas:** ~60

---

### Fase 2: Criar Utilitarios de Formatacao (Risco: BAIXO)

**Estimativa:** ~45 minutos

1. Criar `src/lib/formatters/`
2. Implementar `currency.ts`, `date.ts`, `document.ts`, `contact.ts`, `payment.ts`
3. Criar `index.ts` com re-exports
4. Substituir funcoes inline nos componentes

**Arquivos afetados:** 10+
**Linhas removidas:** ~140

---

### Fase 3: Extrair PedidoCard (Risco: BAIXO)

**Estimativa:** ~20 minutos

1. Criar `minha-conta/pedidos/components/PedidoCard.tsx`
2. Mover componente de `MeusPedidosClient.tsx`
3. Atualizar imports

**Arquivos afetados:** 2
**Linhas movidas:** ~130

---

### Fase 4: Segmentar VIPLandingClient (Risco: BAIXO)

**Estimativa:** ~30 minutos

1. Criar `vip/components/IconBox.tsx`
2. Criar `vip/components/CTAButton.tsx`
3. Criar `vip/components/Pill.tsx`
4. Criar `vip/data/vip-content.ts`
5. Refatorar `VIPLandingClient.tsx`

**Linhas reduzidas:** ~100

---

### Fase 5: Segmentar confirmacao/page.tsx (Risco: MEDIO)

**Estimativa:** ~1 hora

1. Criar `confirmacao/components/ConfirmacaoLoading.tsx`
2. Criar `confirmacao/components/ConfirmacaoError.tsx`
3. Criar `confirmacao/components/ConfirmacaoSuccess.tsx`
4. Criar `confirmacao/components/ConfirmacaoForm.tsx`
5. Refatorar `page.tsx` como orquestrador

**Linhas originais:** 557
**Linhas apos refactor:** ~100 (page.tsx) + 4 componentes de ~100 cada

---

### Fase 6: Criar Hooks de Checkout (Risco: MEDIO)

**Estimativa:** ~1.5 horas

1. Criar `useIdentificacaoForm` hook
2. Criar `useEntregaForm` hook
3. Refatorar `IdentificacaoPageClient.tsx`
4. Refatorar `EntregaPageClient.tsx`

**Beneficio:** Separacao clara entre logica e UI

---

### Fase 7: Segmentar ProductPageClient (Risco: MEDIO)

**Estimativa:** ~1 hora

1. Extrair logica de compartilhamento para `useShareProduct`
2. Extrair secao de filtros para `ProductFiltersAccordion`
3. Extrair logica de imagens para `useProductGallery`
4. Simplificar componente principal

**Linhas reduzidas:** ~150

---

## PARTE 6: Metricas de Sucesso

### Antes da Refatoracao

| Metrica | Valor |
|---------|-------|
| Arquivos >300 linhas | 11 |
| Arquivos >200 linhas | 15 |
| Componentes inline | 12 |
| Funcoes de formatacao duplicadas | 15+ |
| Icones duplicados | 6 |

### Depois da Refatoracao (Esperado)

| Metrica | Valor |
|---------|-------|
| Arquivos >300 linhas | 3 |
| Arquivos >200 linhas | 6 |
| Componentes inline | 0 |
| Funcoes de formatacao duplicadas | 0 |
| Icones duplicados | 0 |

### Reducao Total Esperada

- **Linhas duplicadas removidas:** ~400
- **Componentes extraidos:** 15+
- **Hooks criados:** 5+
- **Testabilidade:** Aumentada significativamente
- **Manutenibilidade:** Melhorada

---

## PARTE 7: Prioridades de Execucao

### Prioridade ALTA (fazer primeiro)

1. **Fase 2:** Criar utilitarios de formatacao
   - Impacto em 10+ arquivos
   - Risco baixo
   - Beneficio imediato

2. **Fase 3:** Extrair PedidoCard
   - 130 linhas em componente proprio
   - Melhora legibilidade significativamente

### Prioridade MEDIA

3. **Fase 1:** Extrair icones
4. **Fase 4:** Segmentar VIPLandingClient
5. **Fase 5:** Segmentar confirmacao/page.tsx

### Prioridade BAIXA (fazer por ultimo)

6. **Fase 6:** Criar hooks de checkout
7. **Fase 7:** Segmentar ProductPageClient

---

## Conclusao

A UI do grupo Figma tem oportunidades significativas de segmentacao. Os principais problemas sao:

1. **Componentes monoliticos** com 400-550 linhas
2. **Componentes inline** que deveriam ser extraidos
3. **Funcoes de formatacao duplicadas** em multiplos arquivos
4. **Icones SVG duplicados** sem reutilizacao
5. **Logica de negocio misturada** com renderizacao

O plano de 7 fases permite refatoracao incremental com baixo risco, mantendo o sistema funcionando enquanto melhora progressivamente a arquitetura.

**Tempo total estimado:** ~6 horas de trabalho focado
**ROI:** Alto - codigo mais testavel, legivel e manutenivel
