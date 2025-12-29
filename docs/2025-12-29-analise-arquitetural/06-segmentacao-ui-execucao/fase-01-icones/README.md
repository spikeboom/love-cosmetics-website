# Fase 01 - Extracao de Icones Duplicados

> Status: CONCLUIDO
> Data: 2025-12-29

## Resumo

Centralizacao de icones SVG duplicados em multiplos arquivos para uma pasta compartilhada.

## Arquivos Criados

```
src/components/figma-shared/icons/
  index.ts              # Re-exports de todos os icones
  VerifiedIcon.tsx      # Icone de verificado (com variante gold)
  PendingIcon.tsx       # Icone de pendente (circulo vazio)
  ChevronRightIcon.tsx  # Icone de seta para direita (com variantes)
  ArrowForwardIcon.tsx  # Icone de seta para frente
```

## Arquivos Modificados

| Arquivo | Mudanca |
|---------|---------|
| `MeusPedidosClient.tsx` | Removido VerifiedIcon e ArrowForwardIcon inline, importa de @/components/figma-shared/icons |
| `DetalhesPedidoClient.tsx` | Removido VerifiedIcon, PendingIcon e ChevronRightIcon inline |
| `CheckoutStepper.tsx` | Removido ChevronRightIcon inline |
| `ConfirmacaoStepper.tsx` | Removido ChevronRightIcon inline |
| `confirmacao/page.tsx` | Removido VerifiedIcon inline, usa variante "gold" |

## Icones Extraidos

### VerifiedIcon
- **Uso:** Badge de verificado, status aprovado, pedido entregue
- **Variantes:** `default` (currentColor) e `gold` (#E7A63A)
- **Arquivos originais:** 3 (confirmacao, MeusPedidosClient, DetalhesPedidoClient)

### PendingIcon
- **Uso:** Status pendente na timeline de pedidos
- **Arquivos originais:** 1 (DetalhesPedidoClient)

### ChevronRightIcon
- **Uso:** Steppers, navegacao, separadores
- **Variantes:** `stroke` (linha) e `filled` (preenchido)
- **Arquivos originais:** 3 (CheckoutStepper, ConfirmacaoStepper, DetalhesPedidoClient)

### ArrowForwardIcon
- **Uso:** Botoes de navegacao, indicador de progresso
- **Arquivos originais:** 1 (MeusPedidosClient)

## Metricas

| Metrica | Antes | Depois |
|---------|-------|--------|
| Icones duplicados | 8 | 0 |
| Linhas de codigo removidas | ~60 | - |
| Arquivos com icones inline | 5 | 0 |

## Como Usar

```tsx
// Importar icones individuais
import { VerifiedIcon, ChevronRightIcon } from "@/components/figma-shared/icons";

// Usar com variantes
<VerifiedIcon className="w-6 h-6 text-green-500" />
<VerifiedIcon className="w-8 h-8" variant="gold" />
<ChevronRightIcon className="w-4 h-4" variant="stroke" />
<ChevronRightIcon className="w-4 h-4" variant="filled" />
```

## Proximos Passos

Continuar com a Fase 02: Criar utilitarios de formatacao.
