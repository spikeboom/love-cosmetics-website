# Parecer sobre a Implementação de Prevenção de Pagamento Duplicado

## Resumo

A implementação é **sólida e bem estruturada**, com múltiplas camadas de proteção. O Codex aplicou uma estratégia defensiva em profundidade (defense in depth) que cobre os principais vetores de duplicação.

---

## Camadas de Proteção Implementadas

### 1. Frontend - `PagamentoPageClient.tsx`

**Mecanismo:** Assinatura do carrinho + sessionStorage

```typescript
// Linhas 18-19, 63-84, 86-110
const CHECKOUT_PEDIDO_ID_KEY = "checkoutPedidoId";
const CHECKOUT_PEDIDO_SIG_KEY = "checkoutPedidoSig";

const computePedidoSignature = () => {
  // Gera hash baseado em: items, total, descontos, frete, cupons
};
```

**Avaliação:** ✅ Bom
- Reutiliza o `pedidoId` se o carrinho não mudou (refresh/back button)
- Invalida se o carrinho foi alterado (remove do sessionStorage)
- Usa `restoredPedidoRef` para evitar execução múltipla do useEffect

---

### 2. Hook - `useCreateOrder.ts`

**Mecanismo:** `inFlightRef` para deduplicar chamadas concorrentes

```typescript
// Linhas 47, 60-64, 179-184
const inFlightRef = useRef<Promise<CreateOrderResult> | null>(null);

const createOrder = useCallback((): Promise<CreateOrderResult> => {
  if (inFlightRef.current) {
    return inFlightRef.current; // Retorna a mesma Promise se já está em voo
  }
  // ...
});
```

**Avaliação:** ✅ Excelente
- Evita double-click e race conditions no mesmo componente
- Pattern correto de "request deduplication"

---

### 3. Hook - `usePagBankPayment.ts`

**Mecanismo:** `paymentRequestsRef` com chaves por método+pedido

```typescript
// Linhas 69, 163-227, 231-304
const paymentRequestsRef = useRef<Record<string, Promise<PaymentResult>>>({});

const createPixPayment = useCallback((pedidoId: string): Promise<PaymentResult> => {
  const key = `pix:${pedidoId}`;
  const existing = paymentRequestsRef.current[key];
  if (existing) return existing; // Retorna Promise existente
  // ...
});
```

**Avaliação:** ✅ Excelente
- Deduplicação por tipo de pagamento + pedido
- Também verifica `checkOrderStatus` antes de criar pagamento

---

### 4. Backend - `create-order/route.ts`

**Mecanismo:** Múltiplas verificações + lock otimista no banco

```typescript
// Linhas 51-64: Verifica se já está pago
if (PAID_STATUSES.has(pedido.status_pagamento)) {
  return 400; // "Este pedido ja foi pago"
}

// Linhas 66-71: Verifica se está em processamento
if (pedido.status_pagamento === PROCESSING_STATUS) {
  return 409; // "Pagamento em processamento"
}

// Linhas 73-90: Evita misturar PIX e Cartão
if (paymentMethod === "pix" && pedido.pagbank_charge_id) {
  return 409; // "Ja existe pagamento com cartao"
}

// Linhas 92-121: Idempotência - retorna dados existentes se já criado

// Linhas 161-216: LOCK OTIMISTA
const lock = await prisma.pedido.updateMany({
  where: { id: pedidoId, status_pagamento: null },
  data: { status_pagamento: PROCESSING_STATUS },
});
if (lock.count === 0) {
  // Outra requisição ganhou a corrida - re-verificar estado
}
```

**Avaliação:** ✅ Excelente
- Lock otimista com `updateMany` + `where` condicional é o pattern correto
- Idempotência: retorna dados existentes em vez de criar duplicado
- Previne mistura de métodos de pagamento
- Trata erro com rollback para `PAYMENT_FAILED`

---

## Pontos Positivos

1. **Defense in depth** - 4 camadas independentes de proteção
2. **Lock otimista correto** - Usa `updateMany` com condição, não `update` simples
3. **Idempotência** - Retorna dados existentes em vez de erro
4. **Cleanup no erro** - Reseta status para `PAYMENT_FAILED` se falhar
5. **Separação de métodos** - Evita pagar com PIX e Cartão no mesmo pedido

---

## Pontos de Atenção

| Item | Severidade | Descrição |
|------|------------|-----------|
| sessionStorage | Baixa | Usuário pode limpar storage e criar novo pedido. Não é crítico pois o backend protege. |
| Timeout do PROCESSING | Média | Se a requisição ao PagBank travar, o status fica `PROCESSING` indefinidamente. Considerar um job de limpeza ou TTL. |
| Erro 409 genérico | Baixa | O frontend mostra alert genérico. Poderia ter UX melhor para "aguarde e tente novamente". |

---

## Conclusão

**A implementação está aprovada.** É uma solução robusta que protege contra:
- Double-click
- Refresh da página
- Back button
- Race conditions
- Múltiplas abas
- Requests concorrentes ao backend

A única melhoria sugerida é adicionar um mecanismo de timeout/cleanup para pedidos que ficaram travados em `PROCESSING` (por exemplo, um cron job que reseta pedidos em PROCESSING há mais de 5 minutos para `null` ou `PAYMENT_FAILED`). Mas isso não é bloqueante para produção.

---

## Pedido Travado em PROCESSING - Impacto

**O que acontece se um pedido travar em PROCESSING:**

1. O pedido **aparece na lista de pedidos** do usuário (pois foi criado no banco)
2. O usuário **não consegue pagar** - recebe erro 409: "Pagamento em processamento. Aguarde e tente novamente."
3. O pedido fica **travado indefinidamente** até intervenção manual no banco

**Impacto:** Usuário não consegue finalizar a compra e não há recuperação automática.

**Solução recomendada:** Criar um job que reseta pedidos em `PROCESSING` há mais de 5 minutos para `null` (permitindo nova tentativa) ou `PAYMENT_FAILED`.

---

*Parecer gerado em: Janeiro/2026*
