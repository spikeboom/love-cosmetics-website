## Análise de Vulnerabilidades - Pagamentos Duplicados

Fiz uma análise completa do sistema de checkout e pagamentos. Aqui está o diagnóstico:

---

### ✅ Proteções Existentes

1. **Verificação de status no backend** (`create-order/route.ts:39-54`) - Bloqueia se status já é `PAID` ou `AUTHORIZED`
2. **Verificação no frontend** - PIX e cartão verificam status antes de processar

---

### ⚠️ Vulnerabilidades Identificadas

| # | Vulnerabilidade | Severidade | Risco |
|---|----------------|------------|-------|
| 1 | **Race Condition** | CRÍTICA | Dois requests simultâneos passam pela verificação |
| 2 | **Sem Transaction/Lock** | CRÍTICA | Não há atomicidade na criação do pagamento |
| 3 | **Sem Idempotency Key** | ALTA | Retries de rede podem duplicar cobranças |
| 4 | **Webhook sem validação** | CRÍTICA | Qualquer um pode enviar webhook fake |
| 5 | **Webhook aceita duplicatas** | MÉDIA | Mesmo webhook processado múltiplas vezes |
| 6 | **Schema sem constraints** | ALTA | `pagbank_order_id` permite duplicatas |

---

### 🔧 Sugestões de Melhoria

Posso implementar as seguintes correções:

**1. Transação Prisma com Lock (Race Condition)**
```typescript
// create-order/route.ts
await prisma.$transaction(async (tx) => {
  const pedido = await tx.pedido.findUnique({
    where: { id: pedidoId },
  });

  if (pedido?.status_pagamento === "PAID") {
    throw new Error("Pedido já pago");
  }

  // Marcar como PROCESSING antes de chamar PagBank
  await tx.pedido.update({
    where: { id: pedidoId },
    data: { status_pagamento: "PROCESSING" }
  });
});
```

**2. Idempotency Key no PagBank**
```typescript
const idempotencyKey = `${pedidoId}-${paymentMethod}`;

const response = await fetch(PAGBANK_API_URL, {
  headers: {
    "x-idempotency-key": idempotencyKey, // PagBank suporta
  }
});
```

**3. Validação do Webhook**
```typescript
// webhook/route.ts
const signature = req.headers.get('x-pagbank-signature');
const expectedSignature = crypto
  .createHmac('sha256', PAGBANK_WEBHOOK_SECRET)
  .update(await req.text())
  .digest('hex');

if (signature !== expectedSignature) {
  return NextResponse.json({ error: 'Invalid' }, { status: 401 });
}
```

**4. Deduplicação de Webhook**
```typescript
// Verificar se webhook já foi processado
const jaProcessado = await prisma.statusPagamento.findFirst({
  where: {
    info: { path: ['id'], equals: body.id }
  }
});

if (jaProcessado) {
  return NextResponse.json({ success: true, message: 'Já processado' });
}
```

**5. Schema com Constraints**
```prisma
model Pedido {
  pagbank_order_id   String?  @unique
  pagbank_charge_id  String?  @unique

  @@index([status_pagamento])
}
```

**6. Status Intermediário "PROCESSING"**
```typescript
// Antes de chamar PagBank
await prisma.pedido.update({
  where: { id: pedidoId },
  data: { status_pagamento: "PROCESSING" }
});

// Isso bloqueia outros requests de passarem na verificação
```

---

### 📋 Prioridade de Implementação

1. 🔴 **Transação + Status PROCESSING** - Resolve race condition
2. 🔴 **Idempotency Key** - Protege contra retries
3. 🔴 **Validação webhook** - Segurança crítica
4. 🟡 **Deduplicação webhook** - Evita reprocessamento
5. 🟡 **Schema constraints** - Integridade dos dados
