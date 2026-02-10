## Plano: cupom aplica no total (nao no preco do item)

### Objetivo
Quando houver cupom aplicado, o desconto **nao pode alterar o preco do produto/itens** (nem no carrinho, nem no checkout, nem no pedido salvo).
O desconto deve aparecer como **linha de desconto no resumo** e ser aplicado **somente no total do pedido**.

### Regra-alvo (contrato)
- `item.preco`: preco base do item (ja com descontos do produto/kit vindos do Strapi), **sem cupom**.
- `subtotal_itens`: soma de `item.preco * quantity`.
- `desconto_cupom`: calculado no **total** do pedido (nao por item).
- `total_pedido`: `max(0, subtotal_itens - desconto_cupom) + frete`.
- `pedido.cupom_valor`: valor do desconto do cupom (em reais, 2 casas) para exibicao e integracoes (Bling).

### Motivacao tecnica (estado atual)
- Hoje o cupom e aplicado mutando `item.preco` no carrinho (`src/modules/produto/domain.ts` via `processProdutos`), o que:
  - espalha a logica por varias telas (carrinho, checkout, admin, minha-conta);
  - dificulta integrar com Bling (desconto embutido em item vs desconto no total);
  - cria risco de divergencia/centavos por arredondamento em lugares diferentes.

### Documento principal
- `docs/2026-02-10-desconto-cupom-no-total-do-pedido/PLAN.md`

### Relacionados
- `docs/2026-02-05-cupons-preco-de/README.md` (plano anterior, quando cupom ainda alterava `preco` do item)

