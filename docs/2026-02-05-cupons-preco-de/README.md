## Plano: Cupons, descontos e `preco_de` (Figma)

### Objetivo
Corrigir e simplificar a regra de **preço riscado (`preco_de`)**, **% OFF**, **cupom** e **descontos** para ficar coerente em:
- Vitrines/Home (Figma)
- PDP (produto)
- Busca
- Carrinho
- Checkout (resumos)
- Criação do pedido e envio ao PagBank

### Escopo
Foco em `src/app/(figma)/...` e nos módulos/contexts/utils usados por essa área (fora de Figma).

### Regras novas (hard-coded)
- **Kit Uso Diário**: `10% OFF`
- **Kit Full Lovè**: `15% OFF`
- Se aplicar cupom nesses itens, **o desconto do cupom soma** (stack) ao desconto próprio do item (cupom aplica em cima do preço já com desconto do kit).

### Cupom `BEMVINDOLOVE15` (primeira compra)
Proposta: cupom válido **somente na primeira compra** (cliente logado ou não) com validação **server-side** usando CPF/email (e, quando existir, `clienteId`).

### Entregáveis deste plano
1) `01-mapeamento-atual.md`: onde existem `% OFF` hard-coded/dinâmico, onde desconto é aplicado, onde `preco_de` é alterado, e como é exibido no fluxo.
2) `02-proposta-simplificada.md`: contrato de dados e passos de implementação para evitar regressões.

