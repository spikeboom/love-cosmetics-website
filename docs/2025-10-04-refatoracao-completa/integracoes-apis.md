# 🔌 Integrações e APIs - Love Cosmetics

## 1. APIs Internas

### 1.1 API de Pedidos

#### POST `/api/pedido`
**Descrição**: Cria um novo pedido e gera link de pagamento PagSeguro

**Request Body**:
```typescript
{
  // Dados Pessoais
  nome: string,
  sobrenome: string,
  email: string,
  cpf: string,           // Formato: "123.456.789-00"
  telefone: string,      // Formato: "(11) 98765-4321"
  data_nascimento: Date,
  
  // Endereço
  pais: string,
  cep: string,
  endereco: string,
  numero: string,
  complemento?: string,
  bairro: string,
  cidade: string,
  estado: string,
  
  // Carrinho
  items: [
    {
      reference_id: string,
      name: string,
      quantity: number,
      unit_amount: number  // Em centavos
    }
  ],
  
  // Valores
  total_pedido: number,
  descontos?: number,
  cupons?: string[],
  
  // Opções
  salvar_minhas_informacoes: boolean,
  aceito_receber_whatsapp: boolean,
  destinatario?: string,
  
  // Analytics
  ga_session_number?: string,
  ga_session_id?: string
}
```

**Response Success (201)**:
```json
{
  "message": "Pedido criado com sucesso",
  "id": "uuid-do-pedido",
  "link": "https://pagseguro.uol.com.br/v2/checkout/payment.html?code=XXX"
}
```

**Response Error (500)**:
```json
{
  "error": "Erro ao criar pedido",
  "details": {}
}
```

**Fluxo Interno**:
1. Valida dados de entrada
2. Cria registro no banco (Prisma/PostgreSQL)
3. Formata dados para PagSeguro
4. Envia para API PagSeguro
5. Retorna link de pagamento

#### GET `/api/pedidos`
**Descrição**: Lista todos os pedidos (admin)

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "nome": "João",
    "sobrenome": "Silva",
    "email": "joao@example.com",
    "total_pedido": 150.00,
    "status": "PAID",
    "createdAt": "2025-08-10T10:00:00Z"
  }
]
```

### 1.2 API de Notificações

#### POST `/api/checkout_notification`
**Descrição**: Webhook para notificações de checkout do PagSeguro

**Headers**:
```
Content-Type: application/json
X-PagSeguro-Signature: {signature}
```

**Request Body** (PagSeguro):
```json
{
  "id": "CHECKOUT-ID",
  "reference_id": "pedido-uuid",
  "status": "PAID",
  "created_at": "2025-08-10T10:00:00Z",
  "customer": {...},
  "items": [...],
  "charges": [...]
}
```

**Response (200)**:
```json
{
  "message": "Notificação processada"
}
```

**Processamento**:
1. Valida assinatura PagSeguro
2. Busca pedido por reference_id
3. Atualiza status do pedido
4. Registra log de evento
5. Retorna confirmação

#### POST `/api/payment_notification`
**Descrição**: Webhook para notificações de pagamento do PagSeguro

**Request Body**:
```json
{
  "id": "PAYMENT-ID",
  "reference_id": "pedido-uuid",
  "status": "PAID",
  "paid_at": "2025-08-10T10:00:00Z",
  "amount": {
    "value": 15000,
    "currency": "BRL"
  }
}
```

**Processamento**:
1. Atualiza status de pagamento
2. Dispara evento GTM `purchase`
3. Envia email de confirmação
4. Limpa carrinho do cliente

### 1.3 API de Erros

#### POST `/api/log-client-error`
**Descrição**: Registra erros do frontend

**Request Body**:
```json
{
  "message": "Error message",
  "stack": "Stack trace",
  "url": "https://site.com/page",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-08-10T10:00:00Z"
}
```

**Response (200)**:
```json
{
  "logged": true
}
```

### 1.4 API de Login

#### POST `/api/login`
**Descrição**: Autenticação administrativa

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "senha123"
}
```

**Response Success (200)**:
```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

## 2. APIs Externas

### 2.1 Strapi CMS

**Base URL**: Configurável via `NEXT_PUBLIC_STRAPI_URL`
**Autenticação**: Bearer token via `STRAPI_API_TOKEN`

#### GET Produtos
**Endpoint**: `/api/produtos`

**Query Parameters**:
```
?sort=updatedAt:desc
&filters[slug][$eq]=produto-slug
&filters[backgroundFlags][$notContainsi]=hide
&populate=*
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Produto Nome",
      "slug": "produto-slug",
      "preco": 99.90,
      "preco_de": 129.90,
      "descricao": "Descrição",
      "carouselImagensPrincipal": {...},
      "breadcrumbItems": [...],
      "listaDescricao": [...],
      "o_que_ele_tem": [...],
      "como_usar_essa_formula": [...],
      "duvidas": [...],
      "avaliacoes": [...],
      "backgroundFlags": "-showInCart"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 10
    }
  }
}
```

#### GET Cupons
**Endpoint**: `/api/cupons`

**Query Parameters**:
```
?filters[codigo][$eq]=AJ25
&populate=*
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "codigo": "AJ25",
      "multiplacar": 0.75,  // 25% de desconto
      "descricao": "25% de desconto",
      "valido_ate": "2025-12-31",
      "ativo": true
    }
  ]
}
```

### 2.2 PagSeguro API

**Base URL**: `https://api.pagseguro.com`
**Autenticação**: Bearer token via `PAGSEGURO_TOKEN_DEV`

#### POST `/checkouts`
**Descrição**: Cria checkout para pagamento

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {token}
Accept: */*
```

**Request Body**:
```json
{
  "customer": {
    "phone": {
      "country": "+55",
      "area": "11",
      "number": "987654321"
    },
    "name": "João Silva",
    "email": "joao@example.com",
    "tax_id": "12345678900"
  },
  "additional_amount": 1500,  // Frete em centavos
  "reference_id": "pedido-uuid",
  "customer_modifiable": true,
  "items": [
    {
      "reference_id": "produto-1",
      "name": "Produto Nome",
      "quantity": 2,
      "unit_amount": 9990  // Em centavos
    }
  ],
  "redirect_url": "https://site.com/confirmacao",
  "notification_urls": [
    "https://site.com/api/checkout_notification"
  ],
  "payment_notification_urls": [
    "https://site.com/api/payment_notification"
  ]
}
```

**Response Success**:
```json
{
  "id": "CHECKOUT-ID",
  "reference_id": "pedido-uuid",
  "created_at": "2025-08-10T10:00:00Z",
  "links": [
    {
      "rel": "PAY",
      "href": "https://pagseguro.uol.com.br/v2/checkout/payment.html?code=XXX",
      "media": "text/html",
      "type": "GET"
    }
  ]
}
```

### 2.3 ViaCEP API

**Base URL**: `https://viacep.com.br/ws`

#### GET `/{cep}/json/`
**Descrição**: Busca endereço por CEP

**Example**: `https://viacep.com.br/ws/01310100/json/`

**Response**:
```json
{
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "complemento": "",
  "bairro": "Bela Vista",
  "localidade": "São Paulo",
  "uf": "SP",
  "ibge": "3550308"
}
```

## 3. Google Tag Manager

### 3.1 Configuração
```javascript
// Container ID
GTM-T7ZMDHZF

// Inicialização (layout.tsx)
<GoogleTagManager gtmId="GTM-T7ZMDHZF" />
```

### 3.2 DataLayer Events

#### add_to_cart
```javascript
window.dataLayer.push({
  event: "add_to_cart",
  event_id: "addtocart_timestamp_random",
  ecommerce: {
    currency: "BRL",
    value: 99.90,
    items: [{
      item_id: "produto-1",
      item_name: "Produto Nome",
      price: 99.90,
      quantity: 1
    }]
  },
  ga_session_id: "1234567890",
  ga_session_number: "1"
});
```

#### remove_from_cart
```javascript
window.dataLayer.push({
  event: "remove_from_cart",
  event_id: "remove_timestamp_random",
  ecommerce: {
    currency: "BRL",
    value: 99.90,
    items: [{
      item_id: "produto-1",
      item_name: "Produto Nome",
      price: 99.90,
      quantity: 1
    }]
  }
});
```

#### initiate_checkout
```javascript
window.dataLayer.push({
  event: "begin_checkout",
  event_id: "initiatecheckout_timestamp_random",
  ecommerce: {
    currency: "BRL",
    value: 199.80,
    items: [...]
  }
});
```

#### purchase
```javascript
window.dataLayer.push({
  event: "purchase",
  event_id: "purchase_timestamp_random",
  ecommerce: {
    transaction_id: "pedido-uuid",
    value: 214.80,
    tax: 0,
    shipping: 15.00,
    currency: "BRL",
    items: [...]
  }
});
```

## 4. Banco de Dados (Prisma/PostgreSQL)

### 4.1 Schema Principal

```prisma
model Pedido {
  id                        String   @id @default(uuid())
  nome                      String
  sobrenome                 String
  email                     String
  cpf                       String
  telefone                  String
  data_nascimento          DateTime
  pais                     String
  cep                      String
  endereco                 String
  numero                   String
  complemento              String?
  bairro                   String
  cidade                   String
  estado                   String
  items                    Json
  cupons                   Json?
  descontos                Float?
  total_pedido             Float
  salvar_minhas_informacoes Boolean
  aceito_receber_whatsapp  Boolean
  destinatario             String?
  status_pagamento         String?
  ga_session_number        String?
  ga_session_id           String?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@index([status_pagamento, reference_id])
}
```

### 4.2 Operações Principais

```typescript
// Criar pedido
const pedido = await prisma.pedido.create({
  data: {...}
});

// Buscar pedido
const pedido = await prisma.pedido.findUnique({
  where: { id: "uuid" }
});

// Atualizar status
const updated = await prisma.pedido.update({
  where: { id: "uuid" },
  data: { status_pagamento: "PAID" }
});

// Listar pedidos
const pedidos = await prisma.pedido.findMany({
  orderBy: { createdAt: "desc" }
});
```

## 5. Variáveis de Ambiente

### 5.1 Obrigatórias
```env
# Strapi
NEXT_PUBLIC_STRAPI_URL=https://cms.example.com
STRAPI_API_TOKEN=token-strapi

# PagSeguro
PAGSEGURO_TOKEN_DEV=token-desenvolvimento
PAGSEGURO_TOKEN_PROD=token-producao

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# App
NEXT_PUBLIC_APP_URL=https://lovecosmetics.com.br
```

### 5.2 Opcionais
```env
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=senha-segura
```

## 6. Webhooks e Callbacks

### 6.1 URLs de Produção
```
Checkout Notification:
https://www.lovecosmetics.com.br/api/checkout_notification

Payment Notification:
https://www.lovecosmetics.com.br/api/payment_notification

Redirect após pagamento:
https://www.lovecosmetics.com.br/confirmacao
```

### 6.2 URLs de Desenvolvimento
```
Checkout Notification:
http://localhost:3000/api/checkout_notification

Payment Notification:
http://localhost:3000/api/payment_notification

Redirect após pagamento:
http://localhost:3000/confirmacao
```

## 7. Rate Limiting e Segurança

### 7.1 Rate Limits
- API Pedido: 10 req/min por IP
- API Login: 5 tentativas/hora
- Webhooks: Sem limite (validar assinatura)

### 7.2 Validações
- Sempre validar preços no servidor
- Verificar assinaturas de webhooks
- Sanitizar inputs do usuário
- Usar HTTPS em produção
- Tokens com expiração

## 8. Monitoramento

### 8.1 Logs Importantes
- Criação de pedidos
- Erros de pagamento
- Webhooks recebidos
- Erros de integração
- Tentativas de login

### 8.2 Métricas
- Taxa de sucesso de pagamentos
- Tempo de resposta das APIs
- Erros por endpoint
- Volume de pedidos/hora

## 9. Troubleshooting

### 9.1 Problemas Comuns

**Erro: Link PagSeguro não gerado**
- Verificar token de autenticação
- Validar formato dos dados
- Checar logs de erro

**Erro: Cupom não aplicado**
- Verificar se cupom existe no Strapi
- Checar campo `multiplacar`
- Validar cookie `cupomBackend`

**Erro: Webhook não recebido**
- Verificar URLs cadastradas
- Checar firewall/proxy
- Validar assinatura

### 9.2 Debug Mode
```javascript
// Ativar logs detalhados
process.env.DEBUG = "true"

// Log de requisições
console.log("Request:", JSON.stringify(body, null, 2))

// Log de respostas
console.log("Response:", JSON.stringify(response, null, 2))
```

---

**Importante**: Todas as integrações devem ser testadas em ambiente de desenvolvimento antes do deploy. Use as ferramentas de teste em `/tests/` para validação automatizada.