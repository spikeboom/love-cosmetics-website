# Status de Pagamento e Entrega — Resumo

O sistema tem **3 pontos independentes** que indicam o estado de um pedido:

---

## 1. `StatusPagamento` (tabela de auditoria)

- **O que é:** Registro bruto do webhook do PagBank salvo no banco.
- **Campo relevante:** `info -> charges[0] -> status` (ex: `"PAID"`)
- **Quando é criado:** Quando o PagBank envia uma notificação (webhook).
- **Quem cria:**
  - `/api/pagbank/webhook` (rota nova)
  - `/api/payment_notification` (rota antiga/legada)
- **Como aparece no front (`/pedidos`):** Quando `charges[0].status = "PAID"`, aparece o **badge verde "Pago"**. Este é o indicador visual principal de pagamento confirmado na tela admin.

---

## 2. `Pedido.status_pagamento` (campo do pedido)

- **O que é:** Status interno do pedido no banco de dados.
- **Valores possíveis:** `PENDING`, `AWAITING_PAYMENT`, `CREATING_PAYMENT`, `PAID`, `AUTHORIZED`, `DECLINED`, `CANCELED`, etc.
- **Quando muda para PAID:** Atualizado automaticamente pelo webhook.
- **Quem atualiza:**
  - `/api/pagbank/webhook` — **atualiza** (`prisma.pedido.update`)
  - `/api/payment_notification` — **NÃO atualiza** (bug conhecido)
- **Como aparece no front (`/pedidos`):** Não é exibido diretamente. É usado como fallback quando não existe registro em `StatusPagamento`.
- **Problema conhecido:** Pedidos que passaram pela rota antiga ficam com `status_pagamento = PENDING` mesmo tendo sido pagos no PagBank.

---

## 3. `Pedido.status_entrega` (fluxo logístico)

- **O que é:** Status de entrega do pedido, controlado **manualmente** pelo admin na tela `/pedidos`.
- **Valores possíveis:**
  - `AGUARDANDO_PAGAMENTO`
  - `PAGAMENTO_CONFIRMADO`
  - `EM_SEPARACAO`
  - `EMBALADO`
  - `ENVIADO`
  - `EM_TRANSITO`
  - `SAIU_PARA_ENTREGA`
  - `ENTREGUE`
  - `CANCELADO`
  - `DEVOLVIDO`
- **Quando muda:** Manualmente pelo admin, sem relação automática com o PagBank.

---

## Divergências conhecidas

Os pontos 1 e 2 podem divergir. Se o webhook chegou pela rota `/api/payment_notification`, o `StatusPagamento` terá `charges[0].status = "PAID"`, mas o `Pedido.status_pagamento` continuará `PENDING`.

A tela `/pedidos` compensa isso via JOIN com `StatusPagamento`, mas outros fluxos que dependem de `Pedido.status_pagamento` (nota fiscal, relatórios, etc.) podem não detectar o pagamento.
