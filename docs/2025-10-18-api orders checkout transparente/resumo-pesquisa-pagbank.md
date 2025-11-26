# Pesquisa - Checkout Transparente PagBank

Terminei a pesquisa! Aqui está tudo o que você precisa saber sobre trazer o checkout de pagamento para o projeto:

## SITUAÇÃO ATUAL

Vocês estão usando **PagSeguro** com a **API antiga de Checkouts** (em src/app/api/pedido/route.ts:210):

```typescript
// API ANTIGA (será descontinuada)
await fetch("https://api.pagseguro.com/checkouts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN_DEV}`,
  },
  body: JSON.stringify(bodyCheckoutPagSeguro),
});
```

Isso cria um link de pagamento e **redireciona o cliente para a página do PagSeguro**.

---

## SOLUÇÃO: MIGRAR PARA API ORDERS (Checkout Transparente)

A **nova API Orders do PagBank** permite processar pagamentos **diretamente no site**, sem redirecionamento. As APIs antigas estão sendo descontinuadas.

### ENDPOINTS PRINCIPAIS

**Sandbox:**
```
POST https://sandbox.api.pagseguro.com/orders
```

**Produção:**
```
POST https://api.pagseguro.com/orders
```

---

## O QUE PRECISA SER IMPLEMENTADO

### 1. CREDENCIAIS (Backend)

Você vai precisar de **2 credenciais diferentes**:

- **Token de Autenticação** (Bearer token) - para autenticar requisições à API
- **Chave Pública (Public Key)** - para criptografar dados do cartão no frontend

Obter em: https://developer.pagbank.com.br/v1/reference/como-obter-token-de-autenticacao

### 2. FRONTEND - Formulário de Pagamento

**a) Incluir SDK JavaScript do PagBank:**

```html
<script src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"></script>
```

**b) Criptografar dados do cartão (no navegador):**

```javascript
const card = PagSeguro.encryptCard({
  publicKey: "SUA_PUBLIC_KEY_AQUI",
  holder: "Nome no Cartão",
  number: "4111111111111111",
  expMonth: "12",
  expYear: "2030",
  securityCode: "123"
});

// Enviar apenas o cartão criptografado para o backend
const encryptedCard = card.encryptedCard;
```

**c) Criar componente de checkout com:**

- Formulário de dados do cartão
- Opção de PIX (gera QR Code)
- Opção de parcelamento
- Campo para CVV, validade, etc.

### 3. BACKEND - Processar Pagamento

**Estrutura da requisição para CARTÃO:**

```typescript
// Endpoint: POST https://sandbox.api.pagseguro.com/orders
// Headers:
// Authorization: Bearer SEU_TOKEN
// Content-Type: application/json

const body = {
  reference_id: pedido.id, // ID do pedido no seu banco
  customer: {
    name: `${body.nome} ${body.sobrenome}`,
    email: body.email,
    tax_id: body.cpf, // CPF sem formatação
    phones: [{
      country: "55",
      area: "11", // DDD
      number: "999999999",
      type: "MOBILE"
    }]
  },
  items: body.items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit_amount: item.unit_amount // em centavos (R$ 10,00 = 1000)
  })),
  shipping: {
    address: {
      street: body.endereco,
      number: body.numero,
      complement: body.complemento,
      locality: body.bairro,
      city: body.cidade,
      region_code: body.estado, // SP, RJ, etc
      country: "BRA",
      postal_code: body.cep
    }
  },
  charges: [{
    reference_id: `charge-${pedido.id}`,
    description: "Pedido Love Cosmetics",
    amount: {
      value: body.total_pedido + body.frete_calculado, // total em centavos
      currency: "BRL"
    },
    payment_method: {
      type: "CREDIT_CARD",
      installments: 1, // número de parcelas
      capture: true, // captura automática
      card: {
        encrypted: encryptedCard // vindo do frontend
      }
    }
  }],
  notification_urls: [
    "https://www.lovecosmetics.com.br/api/payment_notification"
  ]
};
```

**Estrutura da requisição para PIX:**

```typescript
const bodyPix = {
  reference_id: pedido.id,
  customer: { /* mesmo do cartão */ },
  items: [ /* mesmo do cartão */ ],
  qr_codes: [{
    amount: {
      value: body.total_pedido + body.frete_calculado // em centavos
    },
    expiration_date: "2025-10-19T20:15:00-03:00" // opcional, padrão 24h
  }],
  notification_urls: [
    "https://www.lovecosmetics.com.br/api/payment_notification"
  ]
};
```

**Resposta PIX:**

```json
{
  "id": "ORDE_xxx",
  "qr_codes": [{
    "id": "QRCO_xxx",
    "text": "00020101021226...", // código PIX copiável
    "links": [
      {
        "rel": "QRCODE.PNG",
        "href": "https://...", // imagem do QR Code
        "media": "image/png"
      }
    ]
  }]
}
```

Usar `qr_codes[0].text` para código copiável e `qr_codes[0].links[0].href` para imagem do QR Code.

### 4. WEBHOOKS - Notificações de Pagamento

O PagBank envia notificações para as URLs configuradas quando o status do pagamento muda:

- Pagamento aprovado
- Pagamento recusado
- Estorno
- etc.

Você já tem endpoints configurados:
- `/api/checkout_notification`
- `/api/payment_notification`

Precisará atualizar esses endpoints para o novo formato de resposta da API Orders.

---

## FLUXO COMPLETO (Resumo)

### CARTÃO DE CRÉDITO:

1. Cliente preenche formulário no seu site
2. **Frontend**: criptografa dados do cartão com SDK do PagBank
3. **Frontend**: envia cartão criptografado + dados do pedido para seu backend
4. **Backend**: cria pedido no banco de dados
5. **Backend**: chama API Orders do PagBank com cartão criptografado
6. **PagBank**: processa pagamento e retorna resposta (aprovado/recusado)
7. **Backend**: atualiza status do pedido
8. **Frontend**: mostra confirmação ou erro (tudo no seu site!)

### PIX:

1. Cliente escolhe pagar com PIX
2. **Backend**: cria pedido e chama API Orders solicitando QR Code
3. **PagBank**: retorna QR Code e código copiável
4. **Frontend**: exibe QR Code para cliente escanear
5. Cliente paga no app do banco
6. **PagBank**: envia notificação via webhook
7. **Backend**: recebe webhook, confirma pagamento, atualiza pedido

---

## VANTAGENS

1. Cliente **nunca sai do seu site**
2. **Melhor experiência** de usuário
3. **Maior controle** sobre o fluxo de pagamento
4. Suporte a **múltiplos meios de pagamento** (cartão, PIX, boleto)
5. Possibilidade de **parcelamento** com controle de taxas
6. **Compatível com PCI DSS** (criptografia no browser)

---

## PRÓXIMOS PASSOS RECOMENDADOS

1. **Obter credenciais** no painel do PagBank (token + public key)
2. **Criar componente** de checkout no frontend (formulário de cartão + opção PIX)
3. **Implementar criptografia** de cartão com SDK JavaScript
4. **Atualizar rota** `/api/pedido` para usar nova API Orders
5. **Testar em sandbox** antes de produção
6. **Atualizar webhooks** para novo formato
7. **Implementar tratamento** de erros e retry logic
