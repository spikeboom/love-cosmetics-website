# Migração PagBank - Checkout Transparente (API Orders)

## Situação Atual

O projeto está usando **PagSeguro** com a **API antiga de Checkouts** (`/checkouts` endpoint):

**Localização:** `src/app/api/pedido/route.ts:210-218`

```typescript
// API ANTIGA (será descontinuada)
const fetchResponse = await fetch("https://api.pagseguro.com/checkouts", {
  method: "POST",
  headers: {
    "Content-type": "application/json",
    Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN_DEV}`,
    accept: "*/*",
  },
  body: JSON.stringify(bodyCheckoutPagSeguro),
});
```

**Fluxo atual:**
1. Cria um checkout via API PagSeguro
2. Retorna um link de pagamento
3. **Redireciona o cliente para o site do PagSeguro**
4. Cliente paga no ambiente externo
5. Retorna para `/confirmacao` após pagamento

---

## Por que migrar?

1. **API antiga será descontinuada** - PagBank está migrando para a nova API Orders
2. **Melhor experiência do usuário** - Cliente permanece no site durante todo o processo
3. **Maior controle** - Você controla toda a interface e fluxo de pagamento
4. **Mais recursos** - Suporte a múltiplos meios de pagamento (PIX, cartão, boleto)
5. **Conformidade PCI** - Criptografia de cartão no navegador, reduzindo responsabilidade

---

## Solução: API Orders (Checkout Transparente)

A **nova API Orders do PagBank** permite processar pagamentos **diretamente no site**, sem redirecionamento.

### Endpoints

**Sandbox (testes):**
```
POST https://sandbox.api.pagseguro.com/orders
```

**Produção:**
```
POST https://api.pagseguro.com/orders
```

---

## Documentação Oficial

- **Introdução**: https://developer.pagbank.com.br/docs/apis-pagbank
- **API Orders**: https://developer.pagbank.com.br/docs/pedidos-e-pagamentos-order
- **Criar pedido com cartão**: https://developer.pagbank.com.br/reference/criar-pagar-pedido-com-cartao
- **Criar pedido com PIX**: https://developer.pagbank.com.br/reference/criar-pedido-pedido-com-qr-code
- **Autenticação**: https://developer.pagbank.com.br/docs/token-de-autenticacao
- **Criptografia**: https://developer.pagbank.com.br/docs/criptografia-e-chave-publica

---

## O que precisa ser implementado

### 1. Credenciais (Backend)

Você precisará de **2 tipos de credenciais**:

#### a) Token de Autenticação (Bearer Token)
- Usado para autenticar requisições à API
- Obtido no painel PagBank: https://developer.pagbank.com.br/v1/reference/como-obter-token-de-autenticacao
- Usado no header `Authorization: Bearer {TOKEN}`
- Tokens diferentes para sandbox e produção

#### b) Chave Pública (Public Key)
- Usado para criptografar dados do cartão **no navegador**
- Gerado via API ou painel PagBank
- Usado no SDK JavaScript do frontend
- Reduz escopo PCI (dados sensíveis nunca passam pelo backend)

**Importante:**
- Tokens para Pagamento Recorrente são diferentes de tokens para Orders
- Cada ambiente (sandbox/produção) tem suas próprias credenciais

---

### 2. Frontend - Interface de Pagamento

#### a) Incluir SDK JavaScript do PagBank

```html
<script src="https://assets.pagseguro.com.br/checkout-sdk-js/rc/dist/browser/pagseguro.min.js"></script>
```

#### b) Implementar criptografia de cartão

```javascript
// No navegador do cliente
const card = PagSeguro.encryptCard({
  publicKey: "PUBLIC_KEY_AQUI", // Sua chave pública
  holder: "JOSE DA SILVA",      // Nome no cartão
  number: "4111111111111111",    // Número do cartão
  expMonth: "12",                // Mês de validade
  expYear: "2030",               // Ano de validade
  securityCode: "123"            // CVV
});

// Verificar se há erros
if (card.hasErrors) {
  console.error("Erro ao criptografar cartão:", card.errors);
  return;
}

// String criptografada para enviar ao backend
const encryptedCard = card.encryptedCard;
```

#### c) Componente de Checkout

Criar componente React com:

- **Formulário de cartão de crédito:**
  - Número do cartão
  - Nome do titular
  - Data de validade (mês/ano)
  - CVV
  - Número de parcelas

- **Opção PIX:**
  - Botão para gerar QR Code
  - Exibir QR Code gerado
  - Campo para copiar código PIX

- **Validações:**
  - Validar número do cartão (Luhn algorithm)
  - Validar data de validade
  - Validar CVV (3-4 dígitos)

---

### 3. Backend - Processar Pagamento

#### Estrutura da requisição para CARTÃO DE CRÉDITO

**Endpoint:** `POST https://sandbox.api.pagseguro.com/orders`

**Headers:**
```javascript
{
  "Authorization": "Bearer SEU_TOKEN_AQUI",
  "Content-Type": "application/json"
}
```

**Body (JSON):**

```json
{
  "reference_id": "PEDIDO_123",
  "customer": {
    "name": "Jose da Silva",
    "email": "cliente@example.com",
    "tax_id": "12345678909",
    "phones": [
      {
        "country": "55",
        "area": "11",
        "number": "999999999",
        "type": "MOBILE"
      }
    ]
  },
  "items": [
    {
      "reference_id": "produto-1",
      "name": "Produto Exemplo",
      "quantity": 1,
      "unit_amount": 5000
    }
  ],
  "shipping": {
    "address": {
      "street": "Avenida Brigadeiro Faria Lima",
      "number": "1384",
      "complement": "apto 12",
      "locality": "Pinheiros",
      "city": "São Paulo",
      "region_code": "SP",
      "country": "BRA",
      "postal_code": "01452002"
    }
  },
  "charges": [
    {
      "reference_id": "cobranca-123",
      "description": "Pedido Love Cosmetics",
      "amount": {
        "value": 5000,
        "currency": "BRL"
      },
      "payment_method": {
        "type": "CREDIT_CARD",
        "installments": 1,
        "capture": true,
        "card": {
          "encrypted": "ENCRYPTED_CARD_FROM_FRONTEND"
        }
      }
    }
  ],
  "notification_urls": [
    "https://www.lovecosmetics.com.br/api/payment_notification"
  ]
}
```

**Pontos importantes:**
- `unit_amount` e `amount.value` são em **centavos** (R$ 50,00 = 5000)
- `tax_id` é o CPF/CNPJ sem formatação (apenas números)
- `encrypted` é o cartão criptografado recebido do frontend
- `capture: true` captura o pagamento automaticamente
- `installments` define número de parcelas

**Resposta de sucesso (200-201):**

```json
{
  "id": "ORDE_XXXX-XXXX-XXXX",
  "reference_id": "PEDIDO_123",
  "status": "PAID",
  "charges": [
    {
      "id": "CHAR_XXXX-XXXX",
      "status": "PAID",
      "amount": {
        "value": 5000,
        "currency": "BRL"
      }
    }
  ],
  "links": [
    {
      "rel": "SELF",
      "href": "https://api.pagseguro.com/orders/ORDE_XXXX",
      "media": "application/json",
      "type": "GET"
    }
  ]
}
```

---

#### Estrutura da requisição para PIX

**Body (JSON):**

```json
{
  "reference_id": "PEDIDO_123",
  "customer": {
    "name": "Jose da Silva",
    "email": "cliente@example.com",
    "tax_id": "12345678909",
    "phones": [
      {
        "country": "55",
        "area": "11",
        "number": "999999999",
        "type": "MOBILE"
      }
    ]
  },
  "items": [
    {
      "reference_id": "produto-1",
      "name": "Produto Exemplo",
      "quantity": 1,
      "unit_amount": 5000
    }
  ],
  "qr_codes": [
    {
      "amount": {
        "value": 5000
      },
      "expiration_date": "2025-10-19T20:15:00-03:00"
    }
  ],
  "notification_urls": [
    "https://www.lovecosmetics.com.br/api/payment_notification"
  ]
}
```

**Pontos importantes:**
- Não precisa incluir dados de pagamento (sem `charges`)
- `expiration_date` é opcional (padrão: 24 horas)
- Cada QR Code pode ser usado apenas **uma vez**

**Resposta de sucesso:**

```json
{
  "id": "ORDE_XXXX-XXXX-XXXX",
  "reference_id": "PEDIDO_123",
  "status": "WAITING",
  "qr_codes": [
    {
      "id": "QRCO_XXXX-XXXX",
      "text": "00020101021226...",
      "links": [
        {
          "rel": "QRCODE.PNG",
          "href": "https://api.pagseguro.com/qrcode/QRCO_XXXX.png",
          "media": "image/png"
        }
      ]
    }
  ]
}
```

Usar `qr_codes[0].text` para código copiável e `qr_codes[0].links[0].href` para imagem do QR Code.

---

### 4. Webhooks - Notificações de Pagamento

O PagBank envia notificações para as URLs configuradas quando:
- Pagamento é aprovado
- Pagamento é recusado
- Pagamento é cancelado
- Estorno é realizado

**Endpoints já configurados:**
- `/api/checkout_notification`
- `/api/payment_notification`

**Estrutura da notificação recebida:**

```json
{
  "id": "ORDE_XXXX-XXXX",
  "reference_id": "PEDIDO_123",
  "status": "PAID",
  "charges": [
    {
      "id": "CHAR_XXXX",
      "status": "PAID",
      "amount": {
        "value": 5000
      }
    }
  ]
}
```

**Status possíveis:**
- `WAITING` - Aguardando pagamento
- `PAID` - Pago
- `DECLINED` - Recusado
- `CANCELED` - Cancelado

**O que fazer:**
1. Receber notificação
2. Validar autenticidade (verificar se veio do PagBank)
3. Buscar pedido no banco pelo `reference_id`
4. Atualizar status do pedido
5. Enviar email de confirmação se aprovado

---

## Implementação Exemplo (TypeScript)

### Frontend - Componente de Checkout

```typescript
"use client";

import { useState } from "react";

export default function CheckoutForm({ pedidoId, total }: { pedidoId: string, total: number }) {
  const [metodo, setMetodo] = useState<"cartao" | "pix">("cartao");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<{ imagem: string; texto: string } | null>(null);

  const handlePagarCartao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Criptografar cartão
    const card = (window as any).PagSeguro.encryptCard({
      publicKey: process.env.NEXT_PUBLIC_PAGBANK_PUBLIC_KEY,
      holder: formData.get("holder"),
      number: formData.get("number"),
      expMonth: formData.get("expMonth"),
      expYear: formData.get("expYear"),
      securityCode: formData.get("cvv"),
    });

    if (card.hasErrors) {
      alert("Erro ao validar cartão");
      setLoading(false);
      return;
    }

    // Enviar para backend
    const response = await fetch("/api/processar-pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pedidoId,
        metodo: "cartao",
        encryptedCard: card.encryptedCard,
        installments: formData.get("installments"),
      }),
    });

    const data = await response.json();

    if (data.status === "PAID") {
      window.location.href = "/confirmacao?pedido=" + pedidoId;
    } else {
      alert("Pagamento recusado");
    }

    setLoading(false);
  };

  const handlePagarPix = async () => {
    setLoading(true);

    const response = await fetch("/api/processar-pagamento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pedidoId,
        metodo: "pix",
      }),
    });

    const data = await response.json();

    setQrCode({
      imagem: data.qr_codes[0].links[0].href,
      texto: data.qr_codes[0].text,
    });

    setLoading(false);
  };

  return (
    <div>
      {/* Seletor de método */}
      <div>
        <button onClick={() => setMetodo("cartao")}>Cartão</button>
        <button onClick={() => setMetodo("pix")}>PIX</button>
      </div>

      {/* Formulário de cartão */}
      {metodo === "cartao" && (
        <form onSubmit={handlePagarCartao}>
          <input name="number" placeholder="Número do cartão" required />
          <input name="holder" placeholder="Nome no cartão" required />
          <input name="expMonth" placeholder="Mês" required />
          <input name="expYear" placeholder="Ano" required />
          <input name="cvv" placeholder="CVV" required />
          <select name="installments">
            <option value="1">1x sem juros</option>
            <option value="2">2x sem juros</option>
            <option value="3">3x sem juros</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? "Processando..." : "Pagar"}
          </button>
        </form>
      )}

      {/* PIX */}
      {metodo === "pix" && !qrCode && (
        <button onClick={handlePagarPix} disabled={loading}>
          {loading ? "Gerando QR Code..." : "Gerar QR Code PIX"}
        </button>
      )}

      {/* QR Code gerado */}
      {qrCode && (
        <div>
          <img src={qrCode.imagem} alt="QR Code PIX" />
          <p>Ou copie o código:</p>
          <input readOnly value={qrCode.texto} />
        </div>
      )}
    </div>
  );
}
```

---

### Backend - Processar Pagamento

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pedidoId, metodo, encryptedCard, installments } = body;

    // Buscar pedido no banco
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Preparar dados comuns
    const orderData = {
      reference_id: pedido.id,
      customer: {
        name: `${pedido.nome} ${pedido.sobrenome}`,
        email: pedido.email,
        tax_id: pedido.cpf.replace(/\D/g, ""),
        phones: [
          {
            country: "55",
            area: pedido.telefone.replace(/\D/g, "").substring(0, 2),
            number: pedido.telefone.replace(/\D/g, "").substring(2),
            type: "MOBILE",
          },
        ],
      },
      items: pedido.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        unit_amount: item.unit_amount,
      })),
      shipping: {
        address: {
          street: pedido.endereco,
          number: pedido.numero,
          complement: pedido.complemento,
          locality: pedido.bairro,
          city: pedido.cidade,
          region_code: pedido.estado,
          country: "BRA",
          postal_code: pedido.cep,
        },
      },
      notification_urls: [
        `${process.env.NEXT_PUBLIC_URL}/api/payment_notification`,
      ],
    };

    let apiBody;

    if (metodo === "cartao") {
      // Adicionar dados de cartão
      apiBody = {
        ...orderData,
        charges: [
          {
            reference_id: `charge-${pedido.id}`,
            description: "Pedido Love Cosmetics",
            amount: {
              value: Math.round((pedido.total_pedido + pedido.frete_calculado) * 100),
              currency: "BRL",
            },
            payment_method: {
              type: "CREDIT_CARD",
              installments: parseInt(installments) || 1,
              capture: true,
              card: {
                encrypted: encryptedCard,
              },
            },
          },
        ],
      };
    } else if (metodo === "pix") {
      // Adicionar dados de PIX
      apiBody = {
        ...orderData,
        qr_codes: [
          {
            amount: {
              value: Math.round((pedido.total_pedido + pedido.frete_calculado) * 100),
            },
          },
        ],
      };
    }

    // Chamar API PagBank
    const response = await fetch(
      process.env.PAGBANK_ENVIRONMENT === "production"
        ? "https://api.pagseguro.com/orders"
        : "https://sandbox.api.pagseguro.com/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN_DEV}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiBody),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro PagBank:", data);
      return NextResponse.json(
        { error: "Erro ao processar pagamento", details: data },
        { status: 500 }
      );
    }

    // Salvar ID do pedido PagBank no banco
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        pagbank_order_id: data.id,
        status: data.status,
      },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

---

### Backend - Webhook de Notificação

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { id, reference_id, status, charges } = body;

    // Buscar pedido pelo reference_id
    const pedido = await prisma.pedido.findUnique({
      where: { id: reference_id },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Atualizar status do pedido
    await prisma.pedido.update({
      where: { id: reference_id },
      data: {
        status: status,
        pagbank_order_id: id,
      },
    });

    // Se pago, enviar email de confirmação
    if (status === "PAID") {
      // TODO: Enviar email de confirmação
      console.log("Pagamento confirmado para pedido:", reference_id);
    }

    return NextResponse.json({ message: "Notificação recebida" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao processar notificação:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

---

## Fluxo Completo

### CARTÃO DE CRÉDITO:

1. Cliente preenche formulário de checkout no site
2. **Frontend**: Criptografa dados do cartão usando SDK PagBank
3. **Frontend**: Envia `encryptedCard` + dados do pedido para `/api/processar-pagamento`
4. **Backend**: Busca pedido no banco de dados
5. **Backend**: Chama `POST /orders` do PagBank com cartão criptografado
6. **PagBank**: Processa pagamento e retorna resposta (PAID/DECLINED)
7. **Backend**: Salva `pagbank_order_id` e `status` no banco
8. **Backend**: Retorna resultado para frontend
9. **Frontend**: Redireciona para `/confirmacao` se aprovado ou mostra erro

**Tudo acontece no seu site, sem redirecionamento!**

---

### PIX:

1. Cliente escolhe pagar com PIX
2. **Frontend**: Chama `/api/processar-pagamento` com `metodo: "pix"`
3. **Backend**: Chama `POST /orders` do PagBank solicitando QR Code
4. **PagBank**: Gera QR Code e retorna
5. **Backend**: Retorna QR Code para frontend
6. **Frontend**: Exibe QR Code e código copiável
7. Cliente escaneia QR Code e paga no app do banco
8. **PagBank**: Detecta pagamento e envia webhook para `/api/payment_notification`
9. **Backend**: Recebe notificação, atualiza status do pedido para "PAID"
10. **Backend**: Envia email de confirmação
11. Cliente pode verificar status na página de confirmação

---

## Vantagens do Checkout Transparente

1. **Experiência do usuário:** Cliente **nunca sai do seu site**
2. **Taxa de conversão:** Reduz abandono de carrinho
3. **Controle total:** Você controla todo o fluxo e interface
4. **Marca forte:** Mantém identidade visual da sua loja
5. **Múltiplos meios:** Cartão, PIX, boleto em uma única integração
6. **Parcelamento:** Controle de parcelas e taxas
7. **Segurança PCI:** Criptografia no navegador, dados sensíveis não passam pelo servidor
8. **API moderna:** Suporte contínuo e novos recursos

---

## Próximos Passos

### 1. Obter Credenciais

- [ ] Acessar painel PagBank
- [ ] Gerar **Token de Autenticação** (sandbox e produção)
- [ ] Gerar **Chave Pública** (sandbox e produção)
- [ ] Adicionar ao `.env`:
  ```
  PAGBANK_TOKEN_SANDBOX=xxx
  PAGBANK_TOKEN_PRODUCTION=xxx
  PAGBANK_PUBLIC_KEY_SANDBOX=xxx
  PAGBANK_PUBLIC_KEY_PRODUCTION=xxx
  PAGBANK_ENVIRONMENT=sandbox
  ```

### 2. Frontend

- [ ] Adicionar SDK JavaScript do PagBank ao layout/head
- [ ] Criar componente de formulário de cartão
- [ ] Implementar validação de cartão
- [ ] Criar componente de PIX com QR Code
- [ ] Implementar seletor de parcelas
- [ ] Adicionar loading states e tratamento de erros

### 3. Backend

- [ ] Criar rota `/api/processar-pagamento` (POST)
- [ ] Implementar lógica para cartão de crédito
- [ ] Implementar lógica para PIX
- [ ] Atualizar modelo `Pedido` no Prisma (adicionar `pagbank_order_id`)
- [ ] Atualizar webhook `/api/payment_notification`
- [ ] Implementar retry logic para falhas de rede

### 4. Banco de Dados

- [ ] Adicionar campo `pagbank_order_id` na tabela `Pedido`
- [ ] Adicionar campo `status` (WAITING, PAID, DECLINED, CANCELED)
- [ ] Migrar banco de dados

### 5. Testes

- [ ] Testar pagamento com cartão em sandbox
- [ ] Testar pagamento com PIX em sandbox
- [ ] Testar webhooks localmente (usar ngrok)
- [ ] Testar parcelamento
- [ ] Testar erros (cartão recusado, etc)

### 6. Produção

- [ ] Trocar credenciais para produção
- [ ] Configurar `PAGBANK_ENVIRONMENT=production`
- [ ] Testar em produção com valores reais pequenos
- [ ] Monitorar logs e webhooks
- [ ] Configurar alertas de erro

---

## Recursos Adicionais

- **Documentação Completa:** https://developer.pagbank.com.br
- **API Reference:** https://developer.pagbank.com.br/reference
- **Status de Serviço:** https://status.pagbank.com.br
- **Suporte:** Via painel PagBank

---

## Observações Importantes

1. **Valores sempre em centavos:** R$ 10,00 = 1000
2. **CPF/Telefone sem formatação:** Apenas números
3. **Cada QR Code PIX é único:** Não pode ser reutilizado
4. **Expiraçãod o PIX:** Padrão 24h, mas configurável
5. **Webhooks requerem HTTPS:** Use ngrok para testes locais
6. **Rate limiting:** Respeitar limites da API
7. **Ambiente sandbox:** Usar dados de teste específicos
8. **3DS:** Autenticação adicional para cartões (opcional)
9. **Tokenização:** Salvar cartão para compras futuras (requer implementação adicional)

---

## Troubleshooting

### Erro: "Card encryption failed"
- Verificar se SDK foi carregado corretamente
- Validar public key
- Verificar dados do cartão

### Erro: "Invalid credentials"
- Confirmar token de autenticação
- Verificar ambiente (sandbox vs produção)

### Webhook não recebe notificações
- Verificar URL está acessível publicamente
- Confirmar HTTPS configurado
- Testar com ferramenta como webhook.site

### Pagamento recusado
- Validar dados do cliente
- Verificar limite de crédito (em sandbox usar cartões de teste)
- Consultar logs do PagBank

---

**Última atualização:** 18/10/2025
**Versão da API:** PagBank Orders v1
