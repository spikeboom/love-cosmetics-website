# DRE no Admin /pedidos — Plano de Implementação

> Fonte da regra: `C:\Users\Administrator\Downloads\Reuniões_Tarefas.docx`
> Data: 2026-04-18

## 1. Regra de Cálculo do DRE (Lovè)

Filtro: **Mês/Ano** — considerar dados até o último dia do mês.

```
  Receita Bruta
(-) CPV
= Margem Bruta
(-) Despesas Operacionais
= EBITDA
= Resultado do Exercício
```

### 1.1 Receita Bruta
- **Fonte**: Notas fiscais de saída (NF-e / NFC-e) emitidas no período.
- **Cálculo**: `Σ (valor total das NFs emitidas no período)`.
- **Critério de data**: `dataEmissao` da NF.

### 1.2 (-) CPV (Custo dos Produtos Vendidos)
- ⚠️ **NÃO usar CMV do Bling.**
- **Fonte**:
  - Quantidade vendida → itens das NFs emitidas.
  - Custo unitário → **base interna por SKU** (fixo, não depende de estoque).
- **Cálculo**: `Σ (quantidade vendida por SKU × custo unitário interno do SKU)`.
- Kits devem ser explodidos em componentes (já existe util em `src/lib/bling/invoice.ts` — `explodeKitItems`, e mapa `KIT_COMPONENTS` em `src/app/api/admin/dashboard/route.ts:20`).

### 1.3 Margem Bruta
`Margem Bruta = Receita Bruta − CPV`

### 1.4 (-) Despesas Operacionais
- **Fonte**: Contas a pagar (Bling).
- **Categorias**: Marketing / Operacional / Administrativo / Outros.
- **Cálculo**: `Σ (despesas do período)`.
- **Critério de data**: `dataEmissao` ou `dataVencimento` (a definir — doc diz "data de lançamento/vencimento").

### 1.5 EBITDA = Resultado do Exercício
`EBITDA = Margem Bruta − Despesas Operacionais`

Não considerar: Depreciação, Amortização, Juros, Impostos.

---

## 2. Endpoints do Bling necessários

Autenticação já está pronta em `src/lib/bling/simple-auth.ts` (OAuth2, token no Postgres via `AuthToken`). Base: `https://api.bling.com.br/Api/v3`. Usar `makeAuthenticatedRequest` (já existe).

**Limites oficiais da API (já tratados em `src/lib/bling/invoice.ts`)**:
- 3 requisições/segundo → `BLING_RATE_LIMIT_DELAY_MS = 350`.
- Intervalos > 1 ano retornam HTTP 400.
- Retry com backoff exponencial para 429 via `withRetry`.

| Dado DRE | Método/Endpoint | Query params principais |
|---|---|---|
| **Lista de NFs do período** | `GET /nfe` | `tipo=1` (saída), `situacao=5` (autorizada), `dataEmissaoInicial`, `dataEmissaoFinal`, `pagina`, `limite` |
| **Itens de cada NF (qtd × SKU)** | `GET /nfe/{idNotaFiscal}` | — |
| **Despesas do período** | `GET /contas/pagar` | `dataEmissaoInicial`/`Final`, `dataVencimentoInicial`/`Final`, `dataPagamentoInicial`/`Final`, `situacao`, `idContato`, `pagina`, `limite` |
| **Categorias para classificar despesas** | `GET /categorias/receitas-despesas` | `tipo`, `situacao`, `pagina`, `limite` |
| (opcional) Detalhe de produto por SKU | `GET /produtos/{id}` | — *(regra pede base interna, então não deve ser necessário)* |

Referências oficiais:
- [developer.bling.com.br/referencia](https://developer.bling.com.br/referencia)
- [developer.bling.com.br/bling-api](https://developer.bling.com.br/bling-api) (autenticação)
- [developer.bling.com.br/limites](https://developer.bling.com.br/limites)
- [github.com/AlexandreBellas/bling-erp-api-js](https://github.com/AlexandreBellas/bling-erp-api-js) (signatures confirmadas)

### Situações NFe (Bling)
- `5` = Autorizada → **incluir**
- `6` = Cancelada → **excluir**
- Demais → ignorar

### Situações Contas a Pagar (Bling)
A confirmar se filtramos por `situacao` (ex.: apenas pagas vs. todas lançadas). Doc DRE diz "data de lançamento/vencimento", sugerindo que não depende do pagamento efetivo.

---

## Validação com API real (2026-04-18)

Script: `scripts/test-bling-dre-endpoints.js` (faz refresh do token + bate nos 4 endpoints do DRE).

| Endpoint | Status | Observação |
|---|---|---|
| `GET /nfe?tipo=1&situacao=5&dataEmissao…` | ✅ HTTP 200 | Retorna lista paginada. Campos úteis: `id`, `numero`, `dataEmissao`, `situacao`, `contato`. Abril/2026 vazio no momento do teste; março/2026 retornou 5 NFs. |
| `GET /nfe/{id}` | ✅ HTTP 200 | Payload completo com `valorNota`, `valorFrete`, **`itens[]`** contendo `codigo` (SKU), `descricao`, `quantidade`, `valor`, `valorTotal`, `gtin`, `cfop`. Exatamente o necessário para CPV. |
| `GET /contas/pagar` | ❌ HTTP 403 `insufficient_scope` | App OAuth atual não tem permissão de leitura em Finanças. |
| `GET /categorias/receitas-despesas` | ❌ HTTP 403 `insufficient_scope` | Idem. |

### Ações de habilitação (pré-requisito para o DRE)

1. No painel de desenvolvedor do Bling (https://developer.bling.com.br), editar o app (`client_id=0fc9335fe026c928d97d7571eca24580ebe72aae`) e marcar os escopos:
   - `Finanças → Contas a pagar` (leitura).
   - `Finanças → Categorias de receitas e despesas` (leitura).
2. Re-autorizar o app via `/bling-auth` no admin (gera novo consent com os escopos ampliados).
3. Re-executar `node scripts/test-bling-dre-endpoints.js` para confirmar HTTP 200 nos dois endpoints.

Enquanto esses escopos não forem liberados, o DRE só consegue calcular **Receita Bruta**, **CPV** e **Margem Bruta**. **Despesas** e **EBITDA** ficam bloqueados.

---

## 3. Arquitetura proposta

### 3.1 Aba nova "DRE" em `/pedidos`

Adicionar ao array em `src/app/(admin)/pedidos/page.tsx:13`:

```ts
const TABS = ["pedidos", "abandonos", "ceps", "funil", "dashboard", "dre", "instagram"] as const;
```

Novo componente: `src/app/(admin)/pedidos/components/DREPanel.tsx`
- Filtro Mês/Ano (reaproveitar estilo de `PeriodoFilter`).
- Tabela DRE vertical (Receita → CPV → Margem → Despesas agrupadas → EBITDA).
- Botão "Exportar CSV".

### 3.2 Rota de API

`src/app/api/admin/dre/route.ts`:

Input: `?mes=4&ano=2026`.

Pipeline (em paralelo onde possível):
1. `GET /nfe?tipo=1&situacao=5&dataEmissaoInicial=...&dataEmissaoFinal=...` paginado (limite=100).
2. Para cada NF listada → `GET /nfe/{id}` para obter itens (qtd × código/SKU).
3. `GET /contas/pagar?dataEmissaoInicial=...&dataEmissaoFinal=...` paginado.
4. `GET /categorias/receitas-despesas` (cache diário — raramente muda).
5. Calcular:
   - `receitaBruta = Σ NF.total`
   - `cpv = Σ (qtdItem × CUSTO_INTERNO[sku])` — com kits explodidos.
   - `despesasPorGrupo = agrupar contasPagar por idCategoria → grupo DRE`.
   - `margemBruta`, `ebitda`.

Output:
```json
{
  "periodo": { "mes": 4, "ano": 2026, "inicio": "2026-04-01", "fim": "2026-04-30" },
  "receitaBruta": 12345.67,
  "cpv": 3456.78,
  "margemBruta": 8888.89,
  "despesas": {
    "marketing": 1200.00,
    "operacional": 800.00,
    "administrativo": 500.00,
    "outros": 0.00,
    "total": 2500.00
  },
  "ebitda": 6388.89,
  "resultadoExercicio": 6388.89,
  "detalhes": {
    "nfsAnalisadas": 42,
    "quantidadePorSku": { "espuma": 18, "serum": 12, ... },
    "despesasSemCategoria": []
  }
}
```

### 3.3 Cache

O gargalo é `GET /nfe/{id}` item-a-item (rate limit 3/s → 100 NFs ≈ 35s).

**Proposta**: nova tabela Prisma `NfItemCache` (id, numeroNf, dataEmissao, itensJson). Invalidar se NF foi cancelada posteriormente. Primeira carga do mês: lenta. Subsequentes: instantâneas.

Alternativa leve: cache em memória + revalidação sob demanda (`force=true`).

### 3.4 Custo interno por SKU

Hoje hardcoded em `src/app/api/admin/dashboard/route.ts:9`:

```ts
const CUSTO_OPERACIONAL_BASE: Record<string, number> = {
  Espuma: 44.9,
  Máscara: 44.17,
  Sérum: 45.7,
  Hidratante: 58.54,
  Manteiga: 56.45,
};
```

Opções:
- (A) Reaproveitar como está.
- (B) Extrair para `src/core/pricing/custos-internos.ts` e deixar editável por um admin (tabela Prisma `ProdutoCusto` com histórico por data de vigência).

### 3.5 Mapeamento categoria Bling → grupo DRE

Contas a pagar trazem `categoria.id`. Precisa-se de um mapa `idCategoriaBling → "marketing" | "operacional" | "administrativo" | "outros"`.

Opções:
- (A) JSON fixo em `src/config/dre-categorias.json`.
- (B) Nova tabela Prisma `DRECategoriaMap` editável via UI admin.
- (C) MVP: tudo em "outros" e mostrar aviso "X despesas sem classificação — configure mapeamento".

---

## 4. Pontos abertos (decisão do usuário)

1. **Cache de NFs**: tabela dedicada ou memória?
2. **Custo por SKU**: manter hardcoded ou painel admin editável?
3. **Mapeamento categoria → grupo DRE**: JSON fixo, painel admin ou MVP "outros"?
4. **Filtro de data de despesa**: `dataEmissao` ou `dataVencimento`? (doc é ambígua)
5. **Contas a pagar**: incluir todas ou só as com status "paga"?

---

## 5. Arquivos que serão criados/alterados

| Arquivo | Tipo |
|---|---|
| `src/app/(admin)/pedidos/page.tsx` | alterar (adicionar aba) |
| `src/app/(admin)/pedidos/components/DREPanel.tsx` | novo |
| `src/app/api/admin/dre/route.ts` | novo |
| `src/lib/bling/http.ts` | extrair `withRetry`/`sleep` de `invoice.ts` |
| `src/lib/bling/nfe.ts` | novo — `listNfes(periodo)`, `getNfeItens(id)` |
| `src/lib/bling/contas-pagar.ts` | novo — `listContasPagar(periodo)` |
| `src/lib/bling/categorias-rd.ts` | novo — `listCategoriasReceitasDespesas()` |
| `src/core/dre/calcular.ts` | novo — função pura que recebe NFs/despesas e retorna estrutura DRE |
| `src/core/dre/custos-internos.ts` | novo (ou dep. item 4) |
| `prisma/schema.prisma` | alterar — tabela `NfItemCache` (e opcionais) |

---

## 6. Ordem de execução sugerida

1. Responder pontos abertos (§4).
2. Extrair `http.ts` compartilhado do Bling.
3. Implementar `src/lib/bling/nfe.ts` + `contas-pagar.ts` + `categorias-rd.ts`.
4. Implementar `src/core/dre/calcular.ts` com testes unitários (fixtures).
5. Implementar rota `/api/admin/dre` (sem cache persistente).
6. Implementar `DREPanel.tsx` + aba.
7. Adicionar cache (`NfItemCache`).
8. Polir: loading states, export CSV, aviso de despesas sem categoria.
