## Relatório de Segurança - Vulnerabilidades Críticas

A análise revelou **13 vulnerabilidades** no sistema de carrinho/checkout. Aqui estão as mais críticas:

---

### CRÍTICAS (Risco Alto - Fraude Financeira Direta)

#### 1. Manipulação de Preços via DevTools
**Arquivo:** `src/app/api/pedido/route.ts:17-46`

O backend **NÃO valida preços** - aceita o que o cliente enviar:
```typescript
const pedido = await prisma.pedido.create({
  data: {
    items: body.items,           // Preços do cliente!
    descontos: body.descontos,   // Desconto do cliente!
    total_pedido: body.total_pedido, // Total do cliente!
  },
});
```

**Ataque:** Usuário abre DevTools, altera `localStorage.cart` ou manipula React state, envia pedido com preço adulterado.

---

#### 2. Cupom Sem Validação no Servidor
**Arquivo:** `src/modules/cupom/domain.ts:1-21`

Cupons são buscados no frontend e aplicados sem verificar:
- Data de validade
- Usos restantes
- Se cliente é elegível

---

#### 3. Quantidade Não Validada
**Arquivo:** `src/utils/cart-operations.ts:30-38`

```typescript
newCart[product.id].quantity += 1; // Sem limite!
```

Usuário pode modificar `quantity: 999999` e criar pedido impossível.

---

#### 4. Frete Não Validado
**Arquivo:** `src/hooks/checkout/useCreateOrder.ts:98-100`

Valor de frete vem direto do cliente sem recálculo no servidor.

---

### ALTAS (Exposição de Dados)

#### 5. Dados Sensíveis em localStorage (Texto Plano)
**Arquivos:**
- `src/app/(figma-checkout)/figma/checkout/identificacao/IdentificacaoPageClient.tsx:30-39`
- `src/app/(figma-checkout)/figma/checkout/entrega/EntregaPageClient.tsx:44-74`

```typescript
localStorage.setItem("checkoutIdentificacao", JSON.stringify(formData));
// CPF, nome, telefone, endereço completo em texto plano!
```

---

#### 6. Senha Temporária em Log
**Arquivo:** `src/app/api/pedido/route.ts:149-153`

```typescript
logMessage("Nova conta criada", {
  senhaTemporaria: senhaTemporaria, // NUNCA logar senha!
});
```

---

#### 7. Webhook PagBank Sem Assinatura
**Arquivo:** `src/app/api/pagbank/webhook/route.ts:21-30`

Qualquer pessoa pode enviar webhook falso e marcar pedido como pago.

---

### SUGESTÕES DE CORREÇÃO

1. **Middleware de validação de pedido** - Recalcula tudo no servidor antes de criar
2. **API de validação de cupom** - Verifica validade, elegibilidade e usos
3. **Rate limiting** - Protege contra brute force e spam
4. **Validação de webhook** - Verifica assinatura HMAC do PagBank
5. **Criptografia de dados sensíveis** - Migra localStorage para sessionStorage criptografado

Recomenda-se começar pela **validação de preços no backend**, pois é a vulnerabilidade mais crítica que permite fraude financeira direta.
