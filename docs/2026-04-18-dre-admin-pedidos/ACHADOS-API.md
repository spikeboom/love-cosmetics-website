# Achados da exploração da API do Bling

Run: `2026-04-18T20:48:12Z` — `scripts/bling-mega-explore.js`
Dump completo: `bling-scan-2026-04-18T20-48-12-487Z.json`

---

## 1. Escopos liberados (inventário)

Sondei 40 endpoints com `GET limite=1`. Resultado: **15 liberados**, **13 bloqueados por escopo**, **12 404** (endpoint não existe no path que testei ou path difere do esperado).

### ✅ Liberados (15)

**Finanças** — tudo essencial para DRE liberado:
- `/contas/pagar`
- `/contas/receber`
- `/contas-contabeis`
- `/categorias/receitas-despesas`

**Fiscal**:
- `/nfe`, `/nfce`, `/naturezas-operacoes`

**Vendas**:
- `/pedidos/vendas`, `/vendedores`

**Compras**:
- `/pedidos/compras`

**Produtos**:
- `/produtos`, `/produtos/fornecedores`, `/grupos-produtos`

**Cadastros**:
- `/contatos/tipos`

**Sistema**:
- `/notificacoes`

### 🔒 Bloqueados por escopo (13)
`nfse`, `propostas-comerciais`, `canais-venda`, `produtos/lojas`, `categorias/produtos`, `categorias/lojas`, `depositos`, `contatos`, `contratos`, `logisticas`, `logisticas/etiquetas`, `logisticas/servicos`, `ordens-producao`.

> Para o DRE nenhum deles é crítico. **Todos os endpoints necessários estão liberados.**

### ❓ 404 (12)
Alguns paths que testei provavelmente têm nome diferente (ex: `/formas-de-pagamento` → possivelmente `/formas-pagamento`; `/estoques` pode ser `/estoques/saldos`, etc.). Não são necessários para o DRE — ignorar.

---

## 2. `/nfe` — Deep dive (Receita Bruta + CPV)

| Período | Status | Qtd NFs | Sum `valorNota` |
|---|---|---|---|
| 2026-04-01 .. 2026-04-30 | ✅ | 0 | R$ 0,00 |
| 2026-03-01 .. 2026-03-31 | ✅ | **12** | (ver nota) |
| 2026-02-01 .. 2026-02-28 | ✅ | 4 | (ver nota) |
| 2026-01-01 .. 2026-01-31 | ✅ | 0 | R$ 0,00 |

**⚠️ Importante**: o `sumValorNota` aparece como R$0,00 na lista porque **o endpoint `GET /nfe` listagem não retorna o campo `valorNota`** (veja [§2.1](#21-shape-do-get-nfe-listagem)). Para somar a Receita Bruta precisamos buscar cada NF individualmente em `GET /nfe/{id}`.

### 2.1 Shape do `GET /nfe` (listagem)
Campos retornados: `id`, `tipo`, `situacao`, `numero`, `dataEmissao`, `dataOperacao`, `chaveAcesso`, `contato`, `naturezaOperacao`, `loja`.

**Não traz**: `valorNota`, `valorFrete`, `itens`. Ou seja, a listagem só serve para descobrir IDs.

### 2.2 Shape do `GET /nfe/{id}` (detalhe) — o que interessa para DRE
```json
{
  "id": 25376077811,
  "valorNota": 212,          // ← Receita Bruta (por NF)
  "valorFrete": 0,
  "situacao": 5,             // 5=autorizada, 6=cancelada
  "dataEmissao": "2026-03-22 12:11:48",
  "itens": [                 // ← CPV (qtd × SKU)
    { "codigo": "8",   "descricao": "Espuma Facial",    "quantidade": 1, "valorTotal": 59.4, "gtin": "7909839105180" },
    { "codigo": "4",   "descricao": "Hidratante Facial","quantidade": 1, "valorTotal": 58.2, "gtin": "7909839105210" },
    { "codigo": "107", "descricao": "Máscara de Argila","quantidade": 1, "valorTotal": 58.8, "gtin": "7909839105197" },
    { "codigo": "10",  "descricao": "Sérum Facial",     "quantidade": 1, "valorTotal": 54.6, "gtin": "7909839105203" }
  ]
}
```

### 2.3 Mapeamento SKU → custo interno

O campo `codigo` é o SKU numérico do Bling. Exemplos capturados:
- `codigo=8`   → Espuma Facial
- `codigo=4`   → Hidratante Facial
- `codigo=10`  → Sérum Facial
- `codigo=107` → Máscara de Argila
- (falta: Manteiga)

**Hoje o custo está hardcoded em `src/app/api/admin/dashboard/route.ts:9` indexado por NOME do produto** ("Espuma", "Sérum", etc.). Para o DRE precisamos de **lookup por `codigo`/`descricao`** (não por nome de kit):

- Espuma Facial → R$ 44,90
- Hidratante Facial → R$ 58,54
- Sérum Facial → R$ 45,70
- Máscara de Argila → R$ 44,17
- Manteiga → R$ 56,45

Ação: criar mapa `{ [codigo]: custo }` em novo módulo (ex: `src/core/dre/custos-internos.ts`), indexado por `codigo` do Bling.

### 2.4 Implicação de performance

Para fechar 1 mês → N requests (listagem paginada) + **M requests** (um por NF) para pegar itens. Março tem 12 NFs = ~13 requests = **~5 segundos** a 3 req/s.

Viável sem cache. Para fevereiro+março somados (16 NFs) ainda é rápido.

Se no futuro houver +100 NFs/mês, vale cachear (`NfItemCache` tabela Prisma) — mas não é prioridade no MVP.

---

## 3. `/contas/pagar` — Deep dive (Despesas Operacionais)

### 3.1 Status dos filtros de data

| Query | Count | |
|---|---|---|
| `sem filtro` (limite=20) | **8** | 8 contas a pagar totais no banco |
| `dataEmissao 2026-01..2026-04` | 1 | Só 1 tem `dataEmissao` dentro do período |
| `dataVencimento 2026-01..2026-04` | 1 | |
| `dataPagamento 2026-01..2026-04` | 1 | |

> **Descoberta**: vocês têm **pouquíssimas contas a pagar cadastradas** (8 no total). Isso explica os zeros. Quando o pessoal de finanças começar a registrar despesas regularmente, o DRE preenche.

### 3.2 Shape listagem (resumida)
`id`, `situacao`, `vencimento`, `valor`, `contato.id`, `formaPagamento.id`.
> **Listagem NÃO traz `categoria`**. Para classificar no DRE precisamos do detalhe.

### 3.3 Shape detalhe (`GET /contas/pagar/{id}`)
```json
{
  "id": 25026653137,
  "situacao": 2,                       // 1=aberto, 2=pago (a confirmar)
  "vencimento": "2026-02-05",
  "valor": 1206,
  "saldo": 0,
  "dataEmissao": "2026-01-30",
  "competencia": "2026-01-30",         // ← candidato a "data de lançamento"
  "historico": "O valor de R$500,00 foi de um serviço extra de alteração de CNAE",
  "contato": { "id": 17334062187 },
  "categoria": { "id": 0 },            // ← ATENÇÃO: esta conta está SEM categoria
  "formaPagamento": { "id": 6810400 },
  "borderos": [25026739811],
  "ocorrencia": { ... }
}
```

### 3.4 Problema crítico: `categoria.id = 0`

A conta de exemplo tem `categoria.id = 0` — ou seja, **não está classificada em nenhuma categoria de receita/despesa**. Se a maioria das contas de vocês está assim, a classificação DRE vai pular tudo para "Outros".

**Ação de negócio**: precisa revisar processo financeiro — toda conta a pagar deveria ter categoria atribuída no lançamento dentro do Bling. Alternativamente podemos usar `historico`/`contato` como fallback heurístico, mas é frágil.

**Campos de data disponíveis**: `dataEmissao`, `vencimento`, `competencia`. A doc do DRE diz "data de lançamento/vencimento" — **recomendo usar `competencia`** (é o mês contábil em que a despesa pertence). Fallback: `dataEmissao`.

---

## 4. `/categorias/receitas-despesas` — Deep dive (classificação DRE)

### 4.1 Descoberta principal: **o Bling já classifica por `idGrupoDre`**

O campo `idGrupoDre` em cada categoria é literalmente o grupo do DRE. **Não precisa criar mapping manual** como eu tinha proposto no ponto aberto #3.

### 4.2 Mapa de `idGrupoDre` encontrado

Tipos Bling: `tipo=1`=despesa, `tipo=2`=receita, `tipo=3/4/5`=transferência.

| idGrupoDre | tipo | Count | Exemplos | Grupo DRE (nosso) |
|---|---|---|---|---|
| **2** | 2 (receita) | 3 | Vendas de produtos, Vendas de mercadorias, Vendas de serviços | Receita Bruta |
| **8** | 2 (receita) | 5 | Rendimento de aplicação, Juros recebidos | Receitas financeiras *(fora do DRE que pediram)* |
| **10** | 2 (receita) | 3 | Indenização de seguro, Venda de ativo, Transferências recebidas | Outras receitas |
| **1** | 1 (despesa) | 2 | Compras de fornecedores, Compra de insumos e matéria prima | CPV/Compras (⚠️ mas CPV do DRE usa custo interno, ignorar) |
| **3** | 1 (despesa) | 3 | Devoluções de vendas, Descontos incondicionais, Impostos sobre vendas | Deduções |
| **5** | 1 (despesa) | 3 | Custo dos produtos vendidos, Custo das mercadorias vendidas | CPV Bling (⚠️ ignorar — usamos interno) |
| **7** | 1 (despesa) | **30** | Despesas comerciais, Alimentação, Brindes... | **Despesas Operacionais** ← DRE pediu |
| **9** | 1 (despesa) | 7 | Tarifa bancária, Juros pagos | Despesas financeiras |
| **11** | 1 (despesa) | 1 | Perda de capital na alienação de ativo | Outras despesas |
| **13** | 1 (despesa) | 2 | Imposto de renda, CSLL | Impostos (⚠️ DRE não considera) |
| 1 | 3/4/5 | 3 | Transferências | Transferências (ignorar — não afeta DRE) |

### 4.3 Mapeamento final para nosso DRE

A doc diz: **Receita Bruta** (NF) − **CPV** (interno) − **Despesas Operacionais** (Marketing / Operacional / Admin / Outros).

```ts
// Nosso mapa: idGrupoDre → grupo do nosso DRE
const GRUPO_DRE_BLING_PARA_LOCAL = {
  // Receita — NÃO vem daqui no modelo da Lovè (vem de NFe). Ignorar.
  2: 'ignorar',    // Vendas
  8: 'ignorar',    // Receitas financeiras (doc: não considerar juros)
  10: 'ignorar',   // Outras receitas
  // CPV — NÃO vem daqui (doc: usar custo interno). Ignorar.
  1: 'ignorar',    // Compras
  5: 'ignorar',    // CPV Bling
  // Deduções — doc não pediu. Ignorar por enquanto.
  3: 'ignorar',
  // Despesas Operacionais — O QUE ENTRA NO DRE
  7: 'operacional', // As 30 categorias aqui precisam de sub-classificação
  // Financeiras/impostos — doc: não considerar juros/impostos
  9: 'ignorar',
  11: 'ignorar',
  13: 'ignorar',
};
```

### 4.4 Sub-classificação das 30 categorias de `idGrupoDre=7`

A doc pede **Marketing / Operacional / Administrativo / Outros**. Só 3 exemplos apareceram no sample ("Despesas comerciais", "Alimentação", "Brindes") — o JSON dump tem todas as 30 (em `todas`).

**O Bling NÃO expõe campo que diferencia "marketing" de "admin" dentro de `idGrupoDre=7`**. Opções:

(A) Mapeamento manual JSON `{ [idCategoria]: 'marketing' | 'operacional' | 'admin' | 'outros' }` — eu ou você preenche uma vez usando a lista das 30.

(B) Heurística por `descricao` (regex: "marketing", "ads", "tráfego" → marketing; "aluguel", "energia", "telefone" → admin; etc.) — frágil.

(C) UI no admin para mapear categoria → grupo DRE — a forma certa para produção mas mais trabalho.

**Recomendação para MVP**: (A) começar com um JSON inicial baseado no nome, entregável em 10 min; evoluir para (C) quando virar atrito.

### 4.5 Estrutura hierárquica

Categorias têm `idCategoriaPai` (arvorezinha). Algumas categorias de `idGrupoDre=7` podem ter pai, e o pai pode ser mais genérico. Vale somar no nível pai para não perder dinheiro.

---

## 5. Lista completa das 62 categorias

Ver `bling-scan-2026-04-18T20-48-12-487Z.json` → `deepDives.categoriasRD.todas`.

Para ver só as de despesa operacional (`idGrupoDre=7`):
```bash
node -e "const d=require('./docs/2026-04-18-dre-admin-pedidos/bling-scan-2026-04-18T20-48-12-487Z.json'); d.deepDives.categoriasRD.todas.filter(c=>c.idGrupoDre===7).forEach(c=>console.log(c.id, c.descricao))"
```

---

## 6. Ajustes ao PLANO.md original

Todos os 5 pontos abertos têm respostas agora:

| # | Ponto | Decisão |
|---|---|---|
| 1 | Cache de NFs | **MVP sem cache.** ~13 NFs/mês = 5s. Cachear só quando dor aparecer. |
| 2 | Custo por SKU | Começar hardcoded (extraído de `dashboard/route.ts:9`), mas **indexado por `codigo` do Bling**, não por nome de kit. Criar `src/core/dre/custos-internos.ts`. Evoluir para tabela editável quando crescer. |
| 3 | Mapa categoria→grupo DRE | Usar `idGrupoDre` do Bling para separar Operacional vs ignorar; **dentro do grupo 7 (30 cats), manter JSON manual** `marketing/operacional/admin/outros`. |
| 4 | Filtro de data de despesa | Usar **`competencia`** (se existir no filtro da API; se não, cair para `dataEmissao`). |
| 5 | Situação de contas a pagar | Incluir todas — a doc diz "lançamento/vencimento", não depende de estar paga. |

---

## 7. Próximos passos sugeridos

1. **Decisão sua**: confirma recomendações §6? (ou quer mudar alguma)
2. **Inspecionar as 30 categorias de `idGrupoDre=7`** — você olha a lista e me diz quais são Marketing/Op/Admin/Outros (10 min seu). Alternativamente, eu chuto por descrição e você revisa.
3. **Verificar no Bling**: por que a conta de exemplo tem `categoria.id=0`? Processo de cadastro está sem categorizar?
4. Implementar (ordem do PLANO.md §6).

---

## 8. Scripts gerados nessa investigação

- `scripts/test-bling-dre-endpoints.js` — teste focado nos 4 endpoints DRE (com auto-refresh token).
- `scripts/bling-mega-explore.js` — scope scan + deep dives. Re-executável a qualquer momento.
- `docs/2026-04-18-dre-admin-pedidos/bling-scan-*.json` — dumps completos.
