# 🔍 Sistema de Captura de Baseline - Carrinho e Cupons

## 🎯 Objetivo

Este sistema captura **EXATAMENTE** como o sistema de carrinho e cupons funciona hoje, para garantir que a refatoração mantenha o mesmo comportamento.

## 📋 O que é Capturado

### 🛒 **Comportamento do Carrinho**
- Adicionar produtos (um por vez, múltiplos, duplicados)
- Remover produtos (individual, por quantidade)
- Alterar quantidades
- Persistência no localStorage
- Cálculo de totais

### 🎫 **Comportamento de Cupons** 
- Aplicar cupons válidos/inválidos
- Remover cupons
- Cupons via URL (`?cupom=CODE`)
- Múltiplos cupons (limitação atual)
- Interação com cookies (`cupomBackend`, `cupom`)
- Persistência no localStorage

### 💰 **Cálculos de Preços**
- Preços originais vs com desconto
- Subtotais, descontos, frete
- Totais finais
- Consistência entre UI e backend

### 🔌 **Fluxo de APIs**
- Validação de cupons no Strapi
- Processamento de produtos
- Dados enviados para backend
- Payload para PagSeguro
- Estrutura salva no banco

### 📊 **Analytics e Tracking**
- Eventos do Google Analytics
- DataLayer tracking
- Eventos de cupom (apply/remove)
- Eventos de carrinho (add_to_cart)

## 🚀 Como Usar

### 1. **Instalação**
```bash
cd tests/baseline
npm run install-deps
```

### 2. **Capturar Baseline Atual**
```bash
# Captura COMPLETA (recomendado)
npm run capture

# Ou capturar separadamente
npm run capture:ui    # Apenas comportamento da UI
npm run capture:api   # Apenas comportamento da API
```

### 3. **Após a Refatoração**
```bash
# Capturar novo baseline
npm run capture

# Comparar com o original
npm run compare baseline-original.json baseline-new.json
```

## 📁 Estrutura de Arquivos

```
tests/baseline/
├── snapshots/                    # Dados capturados
│   ├── baseline-latest.json      # Último comportamento UI
│   ├── api-capture-latest.json   # Último comportamento API
│   ├── baseline-summary.md       # Resumo legível
│   └── baseline-comparison-*.md  # Relatórios de comparação
├── baseline-capture.js           # Captura comportamento UI
├── api-capture.js               # Captura comportamento API
├── baseline-comparator.js       # Compara antes vs depois
├── run-baseline.js              # Runner principal
└── README.md                    # Este arquivo
```

## 📊 Cenários Testados

### Cenários Básicos
1. **Carrinho Vazio** → Estado inicial
2. **Adicionar Produto** → Primeiro produto
3. **Adicionar Mais Produtos** → Multiple items
4. **Remover Produtos** → Individual e por quantidade

### Cenários com Cupom
5. **Aplicar Cupom** → Em carrinho com produtos
6. **Adicionar Produto Após Cupom** → Desconto automático
7. **Remover Produto com Cupom** → Manter cupom ativo
8. **Remover Cupom** → Restaurar preços

### Cenários Especiais
9. **Cupom em Carrinho Vazio** → Aplicar antes dos produtos
10. **Cupom via URL** → `?cupom=DESCONTO20`
11. **Cupom Inválido** → Tratamento de erros
12. **Refresh da Página** → Persistência
13. **Checkout Flow** → Dados enviados

### Edge Cases
14. **Produtos Gratuitos** → Preço zero
15. **Desconto > Total** → Validações
16. **Múltiplas Operações** → Rapidez
17. **Erros de API** → Recovery

## 🔍 Como Funciona

### Captura UI (Playwright)
- Navega no site real rodando
- Simula cliques e interações reais
- Captura estado DOM, localStorage, cookies
- Registra eventos de analytics
- Salva screenshots de estados críticos

### Captura API (Network Interception)
- Intercepta chamadas para Strapi
- Captura requests/responses
- Valida dados de checkout
- Simula fluxo completo até PagSeguro
- Analisa consistência dos dados

### Comparação (Diff Analysis)
- Compara estado por estado
- Identifica diferenças críticas
- Valida consistência de preços
- Gera relatórios detalhados
- Sugere correções necessárias

## ⚠️ Requisitos

### Sistema
- Node.js 18+
- Site rodando em `localhost:3000`
- Produtos disponíveis para teste
- Cupons válidos configurados

### Cupons de Teste
O sistema espera estes cupons para funcionar:
- `DESCONTO20` - Desconto de 20%
- `INVALIDCOUPON` - Para testar erro
- `URLTEST20` - Para teste via URL

## 📋 Relatórios Gerados

### baseline-summary.md
```markdown
# Baseline Capture Summary
- 15 scenarios captured ✅
- Cart functionality: working ✅
- Coupon functionality: working ✅
- Data consistency: good ✅
```

### baseline-comparison.md
```markdown
# Baseline Comparison Report
## Critical Issues: 0 ✅
## Warnings: 2 ⚠️
- localStorage structure changed
- Cookie 'cupomBackend' removed

## Passed Checks: 47 ✅
- Cart totals maintained
- Coupon behavior consistent
- Price calculations correct
```

## 🎯 Interpretação dos Resultados

### Status: PASS ✅
- **Significado**: Refatoração mantém comportamento
- **Ação**: Pode fazer deploy com segurança

### Status: FAIL ❌  
- **Significado**: Comportamento mudou
- **Ação**: Revisar diferenças antes de deploy

### Warnings ⚠️
- **localStorage changes**: Esperado na refatoração
- **Cookie removal**: Esperado se removemos cookies
- **UI structure**: Esperado se mudamos componentes

### Critical Issues 🚨
- **Price changes**: NUNCA deve acontecer
- **Cart item loss**: NUNCA deve acontecer
- **Coupon not working**: Deve ser investigado
- **API data different**: Verificar se intencional

## 🛠️ Troubleshooting

### Site não carrega
```bash
# Verifique se o site está rodando
curl http://localhost:3000
```

### Produtos não encontrados
```bash
# Verifique se tem produtos na home
# Configure produtos de teste no Strapi
```

### Cupons não funcionam
```bash
# Verifique cupons no Strapi
# Configure cupons de teste com códigos esperados
```

### Playwright falha
```bash
# Reinstale o Playwright
npx playwright install chromium
```

## 🔧 Customização

### Alterar URL base
```javascript
// baseline-capture.js, linha 8
const BASE_URL = 'http://localhost:3001'; // Sua URL
```

### Adicionar cenários
```javascript
// baseline-capture.js, método runCompleteBaseline
await this.meuNovoTeste();
await this.captureState('meu_novo_cenario');
```

### Alterar seletores
```javascript
// baseline-capture.js, método getCartItems
const itemSelectors = [
  '[data-testid="cart-item"]',    // Seus seletores
  '.meu-item-carrinho',           // personalizados
];
```

## 🎉 Exemplo de Uso Completo

```bash
# 1. Antes da refatoração
cd tests/baseline
npm run capture
# ✅ baseline-2024-01-01.json salvo

# 2. Fazer refatoração
# ... implementar novo sistema ...

# 3. Após refatoração  
npm run capture
# ✅ baseline-2024-01-02.json salvo

# 4. Comparar
npm run compare baseline-2024-01-01.json baseline-2024-01-02.json
# ✅ Relatório de comparação gerado

# 5. Verificar relatório
cat snapshots/baseline-comparison-*.md
# ✅ 0 critical issues - pode fazer deploy!
```

---

**🎯 Este sistema garante que a refatoração não quebre nada que já funciona!**