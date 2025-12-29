# Etapa 01: Resolver Import Cruzado FreightOptions

**Status:** CONCLUIDO
**Data:** 29/12/2024
**Risco:** Baixo

---

## Problema

O arquivo `EntregaPageClient.tsx` em `(figma-checkout)` importava o componente `FreightOptions` diretamente de `(figma-main)`:

```typescript
// ANTES - Import cruzado entre route groups
import { FreightOptions } from "@/app/(figma-main)/figma/components/FreightOptions";
```

Isso criava acoplamento entre route groups que deveriam ser independentes.

---

## Solucao Implementada

### 1. Criada pasta compartilhada

```
src/components/figma-shared/
├── FreightOptions.tsx    # Componente movido para ca
└── index.ts              # Re-exports
```

### 2. Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/components/figma-shared/FreightOptions.tsx` | CRIADO - componente movido |
| `src/components/figma-shared/index.ts` | CRIADO - barrel export |
| `src/app/(figma-checkout)/.../EntregaPageClient.tsx` | Import atualizado |
| `src/app/(figma-main)/.../ShippingCalculator.tsx` | Import atualizado |
| `src/app/(figma-main)/.../FreightOptions.tsx` | REMOVIDO |

### 3. Novos imports

```typescript
// DEPOIS - Import de pasta compartilhada
import { FreightOptions } from "@/components/figma-shared";
```

---

## Verificacao

Para verificar que a mudanca funcionou:

```bash
# Verificar que nao ha mais imports cruzados entre route groups
grep -r "from.*figma-main.*figma-checkout\|from.*figma-checkout.*figma-main" src/app/
```

---

## Proximos Passos

Se outros componentes precisarem ser compartilhados entre route groups Figma, adicionar em `src/components/figma-shared/`.
