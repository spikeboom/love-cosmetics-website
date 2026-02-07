# Plano — Resumo da compra (Carrinho/Checkout/Pedidos)

## Inputs (o que guiou este plano)

### Slide 27 — **Carrinho (Clareza)**
Objetivo: no carrinho o usuário ainda compara e decide avançar; **transparência** é prioridade.

Resumo sugerido (campos/ordem):
- **Produtos (sem descontos)** (exibir total “De” / preço de lista)
- **Frete**
- **Descontos** (descontos “do site”, implícitos entre *De* e *Por*)
- **Cupom** (se houver; ex.: `Cupom (30% OFF)`)
- **Total**

Referência visual: cartão simples com linhas e botão “Continuar”.

### Slide 28 — **Pagamento (Confiança)**
Objetivo: aqui o usuário não está “garimpando preço”; quer saber **se está pagando o valor correto**.

Resumo sugerido (campos/ordem):
- **Produtos** com **De/Por** (mostrar “R$ De” riscado + “R$ Por”)
- **Entrega** (endereço + valor / grátis)
- **Total economizado** (unificar descontos do site + cupom)
- **Valor total**

Detalhamento opcional (expandir):
- **Descontos** (site)
- **Cupom** (percentual/valor)

Referências visuais:
- “Ocultar resumo” (padrão de **colapsar/expandir**)
- “Você vai economizar R$ X” (tag/linha de reforço)

### WhatsApp (áudio transcrito) — regra de leitura do usuário
- “Descontos concedidos pelo site” ficam **entre preço De e preço Por**
- **Cupom** vem como linha separada (quando existir)
- Reforço final: **“Você vai economizar R$ X”**
- Fórmula citada: **(Preço De − Preço Por) + Cupom**

---

## Objetivo do projeto (onde aplicar)
Padronizar e deixar coerente o **Resumo da compra** em:
- Figma: `cart`
- Figma: `checkout/pagamento`
- Figma: `checkout/confirmacao`
- Figma: `minha-conta` (detalhes do pedido)
- `(admin)/pedidos`

---

## Contrato de dados (alinha com o projeto existente)
Base (já documentado no projeto):
- `preco` = **preço final unitário** (já com cupom quando aplicado)
- `preco_de` = **preço “De” (lista/original)** para exibição, quando fizer sentido
- `backup.preco` = **preço unitário antes do cupom** (para calcular desconto de cupom e reverter)

Referência: `docs/2026-02-05-cupons-preco-de/02-proposta-simplificada.md`.

---

## Definições do resumo (nomes consistentes)
Usaremos 3 “totais de produtos”:

1) **Produtos (De / sem descontos)**  
`produtosDe = Σ (unitDe * qtd)`  
Onde `unitDe` é o melhor candidato disponível para “De”:
- preferir `item.preco_de` quando `preco_de > precoBaseSemCupom` (ou `> preco` se não houver cupom)
- senão, usar `precoBaseSemCupom` (para não inventar desconto)

2) **Produtos (Por / sem cupom)**  
`produtosPor = Σ (unitPor * qtd)`  
Onde `unitPor = item.backup?.preco ?? item.preco`.

3) **Produtos (Final / com cupom)**  
`produtosFinal = Σ (item.preco * qtd)`.

Derivações:
- **Descontos (site)**: `descontoSite = max(0, produtosDe - produtosPor)`
- **Cupom**: `descontoCupom = max(0, produtosPor - produtosFinal)`
  - em telas de pedido, `descontoCupom` pode vir direto de `pedido.descontos` (hoje já representa “cupom”)
- **Total economizado**: `totalEconomizado = descontoSite + descontoCupom`
- **Total**: `total = produtosFinal + frete`

Observação importante: manter o comportamento já existente de “Acréscimo” caso algum valor seja negativo (defensivo), mas o cenário esperado é desconto ≥ 0.

---

## UI/UX — o que cada tela deve mostrar

### 1) `figma/cart` (clareza)
**Mostrar linhas sempre na mesma ordem:**
- Produtos (sem descontos) → `produtosDe`
- Frete → `frete` (ou “Calcule o frete”)
- Descontos → `descontoSite` (se `> 0`)
- Cupom (ex.: `Cupom (15%)`) → `descontoCupom` (se `> 0`)
- Total → `total`

**Notas de UX**
- “Descontos” e “Cupom” **não devem ser a mesma coisa**.
- Se existirem múltiplos cupons (array), exibir label compacta:
  - `Cupom (10% + R$5,00)` (reaproveitar `getTipoDesconto(cupons)`).

Arquivos atuais (para orientar implementação):
- `src/app/(figma)/(main)/figma/cart/CartSummary.tsx`
- Totais hoje: `src/contexts/cart-totals/CartTotalsContext.tsx` e `src/utils/cart-calculations.ts`

### 2) `figma/checkout/pagamento` (confiança)
**Resumo deve priorizar “estou pagando o correto”:**
- Produtos com **De/Por** (no cabeçalho do bloco, não precisa por item)
- Entrega (endereço + grátis/valor)
- Cupom (se houver)
- Valor total
- Tag “Você vai economizar R$ X” → `totalEconomizado`

**Detalhamento opcional (expandir/colapsar)**
Ao expandir, mostrar:
- Descontos → `descontoSite`
- Cupom → `descontoCupom`

Padrão sugerido:
- Mobile: “Ver/ocultar resumo” (padrão do slide)
- Desktop: resumo sempre visível na coluna lateral (como já é hoje)

Arquivos atuais:
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoResumo.tsx`
- `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx`

### 3) `figma/checkout/confirmacao` (pós-compra)
Reaproveitar o mesmo modelo do pagamento, com menos ação:
- Produtos (De/Por) + lista
- Entrega
- Cupom (se houver)
- Total economizado (opcional, mas recomendado para reforço positivo)
- Valor total

Arquivos atuais:
- `src/app/(figma)/(checkout)/figma/checkout/confirmacao/components/SuccessState.tsx`

### 4) `figma/minha-conta/pedidos/[id]` (detalhes do pedido)
Objetivo: consistência + leitura rápida.

Mostrar:
- Produtos (De/Por) + lista
- Entrega
- Cupom (se houver)
- Total economizado
- Pagamento (método + total)

Dados:
- `pedido.subtotal_produtos` (De)
- `pedido.descontos` (cupom)
- `pedido.total` e `pedido.frete`

Arquivo atual:
- `src/app/(figma)/(main)/figma/minha-conta/pedidos/[id]/DetalhesPedidoClient.tsx`

### 5) `(admin)/pedidos` (backoffice)
Objetivo: dar ao admin a mesma clareza do que foi “De/Por/Cupom/Total”.

No `PedidoCard` expandido, adicionar um bloco “Resumo do pedido” com:
- Produtos (De/Por)
- Frete
- Descontos (site)
- Cupom
- Total economizado
- Total

Dados:
- `pedido.subtotal_produtos` (De) quando disponível
- `pedido.descontos` (cupom)
- `pedido.total_pedido` e `pedido.frete_calculado`

Arquivos atuais:
- `src/app/(admin)/pedidos/components/PedidoCard.tsx`
- Tipos: `src/app/(admin)/pedidos/components/types.ts`

---

## Estratégia técnica (para evitar divergências)

### A) Centralizar o cálculo do “breakdown”
Criar um helper único (nome sugestão):
- `src/core/pricing/resumo-compra.ts`

Exports sugeridos:
- `calculateCartResumoCompra(cartItems): { produtosDe, produtosPor, produtosFinal, descontoSite, descontoCupom, totalEconomizado }`
- `calculatePedidoResumoCompra(pedido): { produtosDe, produtosPor, descontoSite, descontoCupom, totalEconomizado }`

Assim evitamos “cada tela inventa sua conta”.

### B) Reaproveitar o máximo de UI
Criar 1 componente base (nome sugestão):
- `src/components/checkout/ResumoCompraCard.tsx`

Variantes via props:
- `mode="cart"` (clareza: linhas completas)
- `mode="payment"` (confiança: De/Por + economizado + expand)
- `mode="order"` (pós-compra: semelhante ao payment, sem CTA de alterar)

---

## Sequência de implementação (passo a passo)
1) **Definir o breakdown** e adicionar helper central (`resumo-compra.ts`) + testes unitários simples (se houver suíte para utils).
2) Atualizar **CartSummary**:
   - manter “Produtos (sem descontos)” como `produtosDe`
   - trocar a linha atual “Descontos” para `descontoSite`
   - adicionar linha “Cupom (...)” com `descontoCupom`
3) Atualizar **PagamentoResumo** (checkout/pagamento):
   - mostrar De/Por no cabeçalho de “Produtos”
   - adicionar “Cupom (...)”
   - adicionar “Você vai economizar R$ X”
   - (opcional) expandir para detalhar Descontos/Cupom
4) Atualizar **SuccessState** (checkout/confirmacao) para o mesmo modelo.
5) Atualizar **DetalhesPedidoClient** (minha-conta) para o mesmo modelo (usando `pedido.subtotal_produtos` + `pedido.descontos`).
6) Atualizar **(admin)/pedidos** adicionando bloco “Resumo do pedido” no expandido do `PedidoCard`.
7) QA manual (checklist abaixo) + ajustar snapshots/Playwright se algum teste depender da UI do carrinho.

---

## Checklist de QA (aceitação)
- Carrinho:
  - Com produto sem `preco_de`: não “cria desconto fantasma”.
  - Com kit/promo (`preco_de` > `preco`): Descontos (site) aparece correto.
  - Com cupom: Cupom aparece separado; Total bate com o botão “Continuar”.
- Checkout/pagamento:
  - Produtos mostra De/Por coerentes com carrinho.
  - “Você vai economizar” = (De − Por) + Cupom.
  - Expandir/colapsar não muda valores; só revela detalhes.
- Confirmação + Minha conta:
  - Valores batem com os dados do pedido (`subtotal_produtos`, `descontos`, `frete`, `total`).
- Admin:
  - Resumo deixa explícito De/Por/Cupom/Total; útil para suporte.

---

## Perguntas em aberto (para fechar antes de codar)
1) No carrinho, o label “Produtos (sem descontos)” deve ser **sempre** o “De” (lista) mesmo quando `preco_de` não existe? (proposta: sim, mas `De == Por` nesses casos)
2) Quando houver **mais de 1 cupom** (array), o resumo mostra:
   - 1 linha agregada (“Cupom (10% + R$5,00) -R$X”), ou
   - 1 linha por cupom?
3) “Total economizado” aparece também no carrinho (além do pagamento)? (proposta: **não**; manter foco em clareza e comparação)

