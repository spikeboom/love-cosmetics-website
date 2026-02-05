## 02) Proposta simplificada (sem over-engineering)

### 1) Contrato de significado (1 fonte de verdade)
**Manter os significados simples e não misturar responsabilidades:**

- `preco` = **preço unitário efetivo** (o que o cliente paga; já inclui desconto do kit/promo e inclui cupom quando aplicado).
- `preco_de` = **preço riscado (lista/original)** exclusivamente para exibição (quando existir).
  - Regra: só existe se for **maior que** `preco` e fizer sentido visual.
- `backup.preco` = **preço unitário antes do cupom** (serve para calcular desconto do cupom e reverter).

Isso evita usar `preco_de` como “base do cupom”.

### 2) Regra hard-coded dos Kits (desconto próprio do item)
**Objetivo:** os kits sempre exibem o desconto fixo e o “preço de” riscado correspondente.

- Identificação recomendada (simples e estável):
  - preferir `slug` (quando disponível no objeto do produto),
  - fallback para `nome` normalizado (remover acentos + lowercase).
- Tabela fixa:
  - `kit-uso-diario` → `10% OFF`
  - `kit-full-love` (ou equivalente do slug atual) → `15% OFF`

**Cálculo (antes do cupom):**
- `preco_de` (lista) = preço base do kit (fonte definida no passo 5)
- `preco_base_sem_cupom` = `preco_de * (1 - desconto_kit)`
- `preco` (no carrinho/UI) começa como `preco_base_sem_cupom`

### 3) Cupom em cima do kit (stack)
Cupom aplica **em cima do preço já com desconto do kit**.

Regra de cálculo (mantendo o comportamento atual de multiplacar/diminuir):
- `preco_final = preco_base_sem_cupom * multiplacar - diminuir`
- clamp para não ir abaixo de zero (ex.: `Math.max(0, preco_final)`)

Armazenamento no carrinho:
- ao aplicar cupom: salvar `backup.preco = preco_base_sem_cupom` e sobrescrever `preco = preco_final`
- ao remover cupom: reverter `preco` para `backup.preco` (como já existe)
- **não escrever** `preco_de` no fluxo do cupom (deixar só para “preço riscado” real).

### 4) Onde o “preço de” riscado deve aparecer (UI)
Padronizar a regra de exibição em todos os componentes:
- mostrar `preco_de` riscado apenas se `preco_de > preco` (com tolerância de centavos)
- mostrar `% OFF`:
  - para kits: sempre `10% OFF` / `15% OFF`
  - para demais: derivar de `preco_de` e `preco` quando existir
- cupom aparece como:
  - linha no resumo (“Cupom (15%) -R$X”) e/ou
  - badge “Cupom aplicado” no item (opcional), sem depender de `preco_de`.

Itens a corrigir (alto impacto):
- remover mocks em `src/app/(figma)/(main)/figma/cart/CartProductsList.tsx` que forçam `40%` e `preco*1.4`
- em `src/app/(figma)/(main)/figma/product/[slug]/ProductPageClient.tsx`, trocar textos hard-coded por `priceInfo.desconto` e `priceInfo.precoOriginalFormatado`.

### 5) Fonte do preço base do Kit (decisão necessária)
Para o hard-code dos kits ser consistente **em client + server (validação)**, precisamos decidir de onde sai o “preço base” do kit:

Opção A (mais simples operacionalmente): **Strapi `preco` = preço de lista do kit**
- Strapi: `preco_de` do kit pode ficar `null` (opcional).
- App: calcula `preco` com desconto do kit e seta `preco_de = preco_strapi`.
- Server validation: usa `produtoReal.preco` como lista do kit e aplica a mesma regra.

Opção B (mais flexível): **buscar também `preco_de` do Strapi no server**
- ampliar `src/lib/strapi/produtos.ts` para buscar `preco_de` (e preferencialmente `slug`)
- definir `preco_de` (lista) do kit como `produtoReal.preco_de ?? produtoReal.preco`
- isso reduz risco se o preço do kit já vier “com desconto” no `preco` do Strapi.

Escolha para esta implementação: **Opção A** (Strapi `preco` = preço de lista do kit).

Observação: se no futuro o cadastro no Strapi mudar (ex.: `preco` já vier “com desconto”), vale migrar para a Opção B para reduzir ambiguidade.

### 6) Validação server-side (evitar divergência de total)
Atualizar as validações para usar a mesma regra dos kits:
- `src/app/api/carrinho/validar/route.ts` (cálculo de `precoAtual` e `precoAtualComCupom`)
- `src/lib/pedido/validate-order.ts` (cálculo de `precoOriginal` e `precoComCupom`)

Importante: manter `Pedido.descontos` como “desconto de cupom” por enquanto (minimiza impacto no checkout e no PagBank). A economia de promo/kit pode ser calculada para UI separadamente depois.

### 7) Cupom `BEMVINDOLOVE15` (somente primeira compra)
Implementação recomendada: **bloqueio no backend** no momento de criar pedido.

Ponto de enforcement:
- `src/app/api/pedido/route.ts` (já tem `cpf`, `email` e sessão opcional)

Regra:
- se `cupons` contém `BEMVINDOLOVE15`:
  - se existir pedido anterior **pago/autorizado** com mesmo `cpf` **ou** `email`, negar
  - se existir cliente logado: também checar `CupomUsado` por `clienteId` e `cupom`

Retorno:
- `status 400` com `code: "COUPON_FIRST_PURCHASE_ONLY"` (ou similar)
- frontend trata como “cupom inválido” e remove automaticamente (para evitar loop de erro)

Registro de uso:
- idealmente registrar `CupomUsado` quando o pagamento confirmar (webhook PagBank), para não “queimar” cupom em pedidos abandonados.

### 8) PagBank / pedido
- PagBank precisa receber `items[].unit_amount` e `total` coerentes com o preço final (já com kit + cupom).
- “Desconto enviado ao PagBank” deve ser interpretado como: **total final já descontado** (no checkout transparente). Se for necessário ter um campo separado de desconto (ex.: `discount_amount`), isso só existe hoje em `create-checkout-link.ts` (API antiga de link), não no fluxo de Orders/Charges atual.

### 9) Passos de implementação (sequência segura)
1. Criar um módulo único de preço (ex.: `src/core/pricing/`) com:
   - detecção de kit → percent
   - cálculo de `preco_de`/`% OFF` para exibição
   - aplicação do cupom sobre `preco_base_sem_cupom`
2. Trocar mocks/hard-codes na UI Figma (cart/PDP/vitrines) para usar o módulo.
3. Ajustar `processProdutos(...)` e `refreshCartPrices()` para não sobrescrever `preco_de` indevidamente.
4. Ajustar validações server-side (`/api/carrinho/validar`, `validate-order`) para a regra dos kits.
5. Implementar regra `BEMVINDOLOVE15` no `/api/pedido` (e, opcionalmente, uma checagem antecipada no checkout quando CPF/email já existe).
6. Revisar exibição em:
   - carrinho (item + resumo)
   - checkout/pagamento (resumo)
   - confirmação
7. Atualizar/ajustar testes existentes (`tests/cart-and-coupon.spec.ts`) se o UI do carrinho mudar.
