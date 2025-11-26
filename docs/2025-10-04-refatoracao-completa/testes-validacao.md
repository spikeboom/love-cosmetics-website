# 🧪 Testes e Validação - Love Cosmetics

## 1. Cenários de Teste Críticos

### 1.1 Testes de Carrinho

#### TC001: Adicionar Produto ao Carrinho
```gherkin
DADO que estou na página de produto
QUANDO clico em "Adicionar ao Carrinho"
ENTÃO o produto deve ser adicionado com quantidade 1
E o modal do carrinho deve abrir
E o contador no header deve ser atualizado
E evento GTM "add_to_cart" deve ser disparado
```

#### TC002: Incrementar Quantidade
```gherkin
DADO que tenho 1 produto no carrinho
QUANDO clico no botão "+"
ENTÃO a quantidade deve aumentar para 2
E o preço total deve ser atualizado
E o subtotal deve ser recalculado
```

#### TC003: Decrementar até Zero
```gherkin
DADO que tenho 1 produto no carrinho
QUANDO clico no botão "-"
ENTÃO o produto deve ser removido
E mensagem "Carrinho vazio" deve aparecer
E contador no header deve mostrar 0
```

#### TC004: Remover Produto
```gherkin
DADO que tenho produtos no carrinho
QUANDO clico no botão remover (X)
ENTÃO o produto deve ser removido
E o total deve ser recalculado
E evento GTM "remove_from_cart" deve ser disparado
```

#### TC005: Persistência do Carrinho
```gherkin
DADO que adicionei produtos ao carrinho
QUANDO fecho o navegador e reabro
ENTÃO os produtos devem estar no carrinho
E as quantidades devem estar corretas
E o cupom aplicado deve persistir
```

### 1.2 Testes de Cupons

#### TC006: Aplicar Cupom Válido
```gherkin
DADO que tenho produtos no carrinho
QUANDO insiro o cupom "AJ25"
E clico em "Aplicar"
ENTÃO o desconto de 25% deve ser aplicado
E o preço original deve aparecer riscado
E a tag de economia deve mostrar o valor
```

#### TC007: Cupom Inválido
```gherkin
DADO que tenho produtos no carrinho
QUANDO insiro cupom "INVALIDO"
E clico em "Aplicar"
ENTÃO mensagem "Cupom inválido" deve aparecer
E nenhum desconto deve ser aplicado
E campo deve permanecer aberto
```

#### TC008: Remover Cupom
```gherkin
DADO que tenho cupom aplicado
QUANDO clico em remover cupom (X)
ENTÃO preços originais devem ser restaurados
E tag de desconto deve desaparecer
E evento GTM "remove_coupon" deve ser disparado
```

#### TC009: Trocar Cupom
```gherkin
DADO que tenho cupom "AJ25" aplicado
QUANDO removo e aplico cupom "LOVE50"
ENTÃO novo desconto deve ser aplicado
E cálculos devem ser atualizados
E apenas um cupom deve estar ativo
```

### 1.3 Testes de Checkout

#### TC010: Formulário Válido
```gherkin
DADO que preenchi todos campos obrigatórios
QUANDO clico em "Ir para Pagamento"
ENTÃO pedido deve ser criado no banco
E link PagSeguro deve ser gerado
E deve redirecionar para pagamento
```

#### TC011: Validação de CPF
```gherkin
DADO que estou no checkout
QUANDO insiro CPF inválido "111.111.111-11"
E tento submeter
ENTÃO erro "CPF inválido" deve aparecer
E foco deve ir para campo CPF
E formulário não deve ser enviado
```

#### TC012: Busca CEP
```gherkin
DADO que estou no checkout
QUANDO digito CEP "01310-100"
ENTÃO endereço deve ser preenchido automaticamente
E cidade deve mostrar "São Paulo"
E estado deve mostrar "SP"
E apenas número e complemento devem ser editáveis
```

#### TC013: Campos Obrigatórios
```gherkin
DADO que estou no checkout
QUANDO tento submeter sem preencher campos
ENTÃO cada campo obrigatório deve mostrar erro
E primeiro campo com erro deve receber foco
E formulário não deve ser enviado
```

### 1.4 Testes de Pagamento

#### TC014: Redirecionamento PagSeguro
```gherkin
DADO que completei o checkout
QUANDO sou redirecionado para PagSeguro
ENTÃO URL deve conter "pagseguro.uol.com.br"
E dados do pedido devem estar corretos
E valor total deve incluir frete
```

#### TC015: Webhook de Pagamento
```gherkin
DADO que paguei no PagSeguro
QUANDO PagSeguro envia webhook
ENTÃO status do pedido deve atualizar para "PAID"
E evento GTM "purchase" deve ser disparado
E email de confirmação deve ser enviado
```

#### TC016: Retorno após Pagamento
```gherkin
DADO que completei pagamento
QUANDO retorno para o site
ENTÃO deve mostrar página de confirmação
E número do pedido deve aparecer
E carrinho deve estar vazio
```

## 2. Testes de Integração

### 2.1 Fluxo Completo de Compra

#### TI001: Jornada Completa
```javascript
test('Fluxo completo: produto → carrinho → cupom → checkout → pagamento', async ({ page }) => {
  // 1. Adicionar produto
  await page.goto('/home');
  await page.click('[aria-label="Comprar"]');
  
  // 2. Aplicar cupom
  await page.click('[data-testid="coupon-toggle"]');
  await page.fill('[data-testid="coupon-input"]', 'AJ25');
  await page.click('[data-testid="apply-coupon"]');
  
  // 3. Ir para checkout
  await page.click('[data-testid="checkout-button"]');
  
  // 4. Preencher formulário
  await page.fill('[name="nome"]', 'João');
  await page.fill('[name="sobrenome"]', 'Silva');
  // ... outros campos
  
  // 5. Submeter
  await page.click('[type="submit"]');
  
  // 6. Verificar redirecionamento
  await expect(page).toHaveURL(/pagseguro/);
});
```

### 2.2 Testes de API

#### TI002: Criar Pedido
```javascript
test('API: Criar pedido com dados válidos', async ({ request }) => {
  const response = await request.post('/api/pedido', {
    data: {
      nome: 'João',
      sobrenome: 'Silva',
      email: 'joao@example.com',
      cpf: '123.456.789-00',
      // ... outros campos
      items: [
        {
          reference_id: '1',
          name: 'Produto',
          quantity: 1,
          unit_amount: 9990
        }
      ]
    }
  });
  
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data).toHaveProperty('id');
  expect(data).toHaveProperty('link');
});
```

### 2.3 Testes de Webhook

#### TI003: Processar Notificação
```javascript
test('Webhook: Processar notificação de pagamento', async ({ request }) => {
  const response = await request.post('/api/payment_notification', {
    headers: {
      'X-PagSeguro-Signature': 'valid-signature'
    },
    data: {
      reference_id: 'pedido-uuid',
      status: 'PAID',
      amount: { value: 15000 }
    }
  });
  
  expect(response.status()).toBe(200);
  
  // Verificar que pedido foi atualizado
  const pedido = await prisma.pedido.findUnique({
    where: { id: 'pedido-uuid' }
  });
  expect(pedido.status_pagamento).toBe('PAID');
});
```

## 3. Testes de Performance

### 3.1 Métricas de Performance

#### TP001: Tempo de Carregamento
```javascript
test('Performance: Página inicial < 3s', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

#### TP002: Resposta de API
```javascript
test('Performance: API pedido < 500ms', async ({ request }) => {
  const startTime = Date.now();
  await request.post('/api/pedido', { data: {...} });
  const responseTime = Date.now() - startTime;
  
  expect(responseTime).toBeLessThan(500);
});
```

## 4. Testes de Segurança

### 4.1 Validação de Dados

#### TS001: Manipulação de Preços
```javascript
test('Segurança: Não aceitar preços do cliente', async ({ request }) => {
  const response = await request.post('/api/pedido', {
    data: {
      items: [{
        reference_id: '1',
        name: 'Produto',
        quantity: 1,
        unit_amount: 1  // Preço manipulado
      }]
    }
  });
  
  // Deve recalcular preço correto no servidor
  const data = await response.json();
  expect(data.items[0].unit_amount).toBe(9990); // Preço real
});
```

#### TS002: SQL Injection
```javascript
test('Segurança: Prevenir SQL injection', async ({ request }) => {
  const response = await request.post('/api/pedido', {
    data: {
      nome: "'; DROP TABLE pedidos; --",
      // ... outros campos
    }
  });
  
  // Deve sanitizar e processar normalmente
  expect(response.status()).toBe(201);
  
  // Tabela deve ainda existir
  const pedidos = await prisma.pedido.findMany();
  expect(pedidos).toBeDefined();
});
```

## 5. Testes de UI/UX

### 5.1 Responsividade

#### TU001: Mobile View
```javascript
test('UI: Carrinho responsivo mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  
  // Botão fixo deve aparecer
  await expect(page.locator('.fixed-buy-button')).toBeVisible();
  
  // Modal deve ser fullscreen
  await page.click('[data-testid="cart-icon"]');
  const modal = page.locator('[data-testid="cart-modal"]');
  await expect(modal).toHaveCSS('width', '100vw');
});
```

### 5.2 Acessibilidade

#### TU002: Navegação por Teclado
```javascript
test('A11y: Navegação por teclado', async ({ page }) => {
  await page.goto('/');
  
  // Tab através dos elementos
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  
  // Enter para adicionar ao carrinho
  await page.keyboard.press('Enter');
  
  // Verificar que modal abriu
  await expect(page.locator('[data-testid="cart-modal"]')).toBeVisible();
});
```

## 6. Testes de Analytics

### 6.1 Eventos GTM

#### TA001: Tracking de Eventos
```javascript
test('Analytics: Eventos GTM corretos', async ({ page }) => {
  // Interceptar dataLayer
  await page.addInitScript(() => {
    window.dataLayerEvents = [];
    window.dataLayer = {
      push: (data) => window.dataLayerEvents.push(data)
    };
  });
  
  await page.goto('/');
  await page.click('[aria-label="Comprar"]');
  
  // Verificar evento
  const events = await page.evaluate(() => window.dataLayerEvents);
  expect(events).toContainEqual(
    expect.objectContaining({
      event: 'add_to_cart',
      ecommerce: expect.objectContaining({
        currency: 'BRL'
      })
    })
  );
});
```

## 7. Checklist de Validação

### 7.1 Pré-Deploy

- [ ] Todos os testes unitários passando
- [ ] Testes de integração passando
- [ ] Testes E2E passando
- [ ] Performance dentro dos limites
- [ ] Sem vulnerabilidades de segurança
- [ ] Analytics funcionando
- [ ] Responsivo em todos dispositivos
- [ ] Acessibilidade validada

### 7.2 Pós-Deploy

- [ ] Smoke tests em produção
- [ ] Monitoramento ativo
- [ ] Logs sem erros críticos
- [ ] Métricas de negócio normais
- [ ] Webhooks respondendo
- [ ] Emails sendo enviados
- [ ] Performance estável

## 8. Comandos de Teste

### 8.1 Executar Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Testes com coverage
npm run test:coverage

# Testes específicos
npm test -- cart-and-coupon.spec.ts

# Modo watch
npm test -- --watch

# Modo debug
npm test -- --debug
```

### 8.2 Playwright

```bash
# Instalar browsers
npx playwright install

# Rodar testes
npx playwright test

# Modo UI
npx playwright test --ui

# Gerar report
npx playwright show-report

# Específico browser
npx playwright test --browser=chromium
```

## 9. Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
│   ├── components/
│   ├── utils/
│   └── modules/
├── integration/       # Testes de integração
│   ├── api/
│   └── database/
├── e2e/              # Testes end-to-end
│   ├── cart-and-coupon.spec.ts
│   └── checkout.spec.ts
├── fixtures/         # Dados de teste
└── helpers/          # Funções auxiliares
```

## 10. Dados de Teste

### 10.1 Usuário Teste
```javascript
const testUser = {
  nome: "João",
  sobrenome: "Teste",
  email: "teste@example.com",
  cpf: "123.456.789-00",
  telefone: "(11) 98765-4321",
  data_nascimento: "01/01/1990",
  cep: "01310-100",
  numero: "123",
  complemento: "Apto 45"
};
```

### 10.2 Produtos Teste
```javascript
const testProducts = [
  {
    id: "1",
    nome: "Produto Teste",
    preco: 99.90,
    slug: "produto-teste"
  }
];
```

### 10.3 Cupons Teste
```javascript
const testCoupons = [
  { codigo: "TEST25", multiplicador: 0.75 },  // 25% desconto
  { codigo: "TEST50", multiplicador: 0.50 }   // 50% desconto
];
```

---

**Importante**: Executar todos os testes antes de qualquer deploy. Testes falhando indicam possível regressão e devem ser investigados antes de prosseguir.