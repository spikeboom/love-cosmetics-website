# Fase 03 - Extracao do PedidoCard

> Extrai o componente PedidoCard inline de MeusPedidosClient para componente reutilizavel

## Status: CONCLUIDO

Data: 2025-12-29

## Problema Identificado

O `MeusPedidosClient.tsx` tinha ~340 linhas com o componente `PedidoCard` definido inline (~120 linhas).
Isso violava SRP e dificultava reutilizacao.

## Solucao Implementada

### Arquivos Criados

1. `src/app/(figma)/(main)/figma/minha-conta/pedidos/components/PedidoCard.tsx`
   - Componente extraido com ~165 linhas
   - Inclui tipos: `Pedido`, `ProdutoImagem`, `HistoricoStatus`
   - Inclui constante `STATUS_LABELS`
   - Usa icons e formatters centralizados

2. `src/app/(figma)/(main)/figma/minha-conta/pedidos/components/index.ts`
   - Re-exporta PedidoCard e tipo Pedido

### Arquivos Modificados

1. `MeusPedidosClient.tsx`
   - Removido: ~175 linhas (PedidoCard + tipos + STATUS_LABELS)
   - Adicionado: import de `PedidoCard` e `Pedido`
   - Arquivo final: ~170 linhas (reducao de 50%)

## Resultado

| Metrica | Antes | Depois |
|---------|-------|--------|
| MeusPedidosClient.tsx | 340 linhas | 170 linhas |
| PedidoCard.tsx | inline | 165 linhas |
| Reutilizabilidade | Nenhuma | Componente isolado |

## Imports Removidos do MeusPedidosClient

```typescript
// Removidos (agora no PedidoCard)
import Image from "next/image";
import { VerifiedIcon, ArrowForwardIcon } from "@/components/figma-shared/icons";
import { formatDate, formatDateTime, formatPrice } from "@/lib/formatters";
```

## Verificacao

```bash
npx tsc --noEmit  # Passou sem erros
```
