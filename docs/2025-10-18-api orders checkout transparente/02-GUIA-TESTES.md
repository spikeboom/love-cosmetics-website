# 🧪 Guia de Testes - PagBank Sandbox

## 📋 Informações Importantes

### Ambiente Sandbox
- **URL da API**: `https://sandbox.api.pagseguro.com`
- **Painel Sandbox**: https://sandbox.pagseguro.uol.com.br
- **Documentação**: https://developer.pagbank.com.br/docs/cartoes-de-teste

### Credenciais do Projeto (já configuradas)
```env
PAGBANK_TOKEN_SANDBOX=F16C5EDC1A054248814D449EA5495369
NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX=PUB21D327F285314AD589CB2F85E9E0F493
PAGBANK_API_URL=https://sandbox.api.pagseguro.com
```

---

## 💳 Cartões de Teste

### ✅ Transações Aprovadas

#### Visa
```
Número: 4539 6206 5992 2097
CVV: qualquer 3 dígitos (ex: 123)
Validade: qualquer data futura (ex: 12/2030)
Nome: qualquer nome
```

#### Mastercard
```
Número: 5483 9862 0779 7350
CVV: qualquer 3 dígitos (ex: 123)
Validade: qualquer data futura (ex: 12/2030)
Nome: qualquer nome
```

### ❌ Transações Recusadas

#### American Express (AMEX)
```
Número: 3729 3800 1199 778
CVV: qualquer 4 dígitos (ex: 1234)
Validade: qualquer data futura (ex: 12/2030)
Nome: qualquer nome
Resultado: Sempre recusado
```

### 🔄 Outras Situações

#### Cartão Genérico (Aprovado)
```
Número: 4111 1111 1111 1111
CVV: 123
Validade: 12/2030
Nome: TESTE APROVADO
Resultado: Aprovado imediatamente
```

#### Cartão com Análise Manual
```
Número: 4000 0000 0000 0010
CVV: 123
Validade: 12/2030
Nome: TESTE ANALISE
Resultado: Status IN_ANALYSIS (Em análise)
```

---

## 🔲 Testes com PIX

### Como Funciona o PIX no Sandbox

No ambiente **Sandbox**, o PIX funciona de forma simulada:

1. **Gerar QR Code**: Quando você cria um pedido PIX, o sistema gera um QR Code válido
2. **Simulação Automática**: O pagamento é simulado automaticamente baseado no **valor da transação**

### ⚠️ IMPORTANTE: Chave PIX no Sandbox

Antes de testar PIX, você precisa:

1. **Acessar o painel Sandbox**: https://sandbox.pagseguro.uol.com.br
2. **Login**: Use as credenciais do vendedor de teste:
   - Email: `lovecosmetic23@gmail.com`
   - Senha: (verificar no arquivo de senhas)
3. **Cadastrar Chave PIX** (se necessário):
   - Ir em Configurações → PIX
   - Criar uma chave PIX aleatória
   - **Aguardar 15 minutos** antes de fazer o primeiro teste

### 💰 Valores para Simulação PIX

O PagBank usa **valores específicos** para simular diferentes cenários:

#### ✅ Pagamento Aprovado Imediato
```
Valores que começam com: 1.XX a 99.XX
Exemplo: R$ 10,00, R$ 50,00, R$ 99,99

Comportamento:
- Status inicial: WAITING (Aguardando)
- Após alguns segundos: PAID (Pago)
```

#### ✅ Pagamento Aprovado com Delay (5 minutos)
```
Valores que começam com: 100.XX a 999.XX
Exemplo: R$ 100,00, R$ 250,00, R$ 500,00

Comportamento:
- Status inicial: WAITING (Aguardando)
- Após 5 minutos: PAID (Pago)
```

#### ⏱️ Pagamento Pendente
```
Valores acima de: 1000.XX
Exemplo: R$ 1.000,00, R$ 1.500,00

Comportamento:
- Fica em WAITING (Aguardando) indefinidamente
- Útil para testar timeout
```

### 🔧 Forçar Pagamento PIX Manualmente (Sandbox)

Se você quiser **forçar** um pagamento PIX no sandbox:

1. Acesse o painel: https://sandbox.pagseguro.uol.com.br
2. Vá em **Transações** → **Transações (aplicação)**
3. Encontre sua transação PIX
4. Clique em **Simular Pagamento**

---

## 🧪 Cenários de Teste Recomendados

### Teste 1: Cartão de Crédito Aprovado (1x)
```
1. Criar pedido normalmente no site
2. Escolher "Cartão de Crédito"
3. Usar cartão: 4111 1111 1111 1111
4. CVV: 123
5. Validade: 12/2030
6. Nome: TESTE APROVADO
7. Parcelas: 1x
8. Resultado esperado: Aprovado imediatamente
```

### Teste 2: Cartão de Crédito Parcelado (3x)
```
1. Criar pedido normalmente
2. Escolher "Cartão de Crédito"
3. Usar cartão: 4539 6206 5992 2097
4. CVV: 123
5. Validade: 12/2030
6. Nome: TESTE PARCELADO
7. Parcelas: 3x
8. Resultado esperado: Aprovado em 3 parcelas
```

### Teste 3: Cartão Recusado
```
1. Criar pedido normalmente
2. Escolher "Cartão de Crédito"
3. Usar cartão: 3729 3800 1199 778
4. CVV: 1234
5. Validade: 12/2030
6. Nome: TESTE RECUSADO
7. Resultado esperado: Recusado com mensagem de erro
```

### Teste 4: PIX Aprovado Rápido
```
1. Criar pedido com valor de R$ 50,00
2. Escolher "PIX"
3. Esperar QR Code ser gerado
4. Copiar código PIX
5. Aguardar 10-30 segundos
6. Resultado esperado: Status muda para PAID automaticamente
```

### Teste 5: PIX Aprovado Delay
```
1. Criar pedido com valor de R$ 100,00
2. Escolher "PIX"
3. Esperar QR Code ser gerado
4. Aguardar 5 minutos
5. Resultado esperado: Status muda para PAID após 5 min
```

---

## 🔍 Como Verificar Status dos Pagamentos

### Opção 1: Via Banco de Dados
```sql
SELECT
  id,
  status_pagamento,
  pagbank_order_id,
  pagbank_charge_id,
  payment_method,
  total_pedido,
  createdAt
FROM "Pedido"
ORDER BY createdAt DESC
LIMIT 10;
```

### Opção 2: Via API
```bash
# Verificar status de um pedido específico
GET /api/pagbank/webhook?orderId=ORDE_xxx
```

### Opção 3: Via Painel Sandbox
1. Acessar: https://sandbox.pagseguro.uol.com.br
2. Menu: **Transações** → **Transações (aplicação)**
3. Visualizar todas as transações de teste

---

## ⚙️ Simulador de Pagamentos

O PagBank possui um **Simulador** no ambiente Sandbox que identifica cenários baseado em:

### 1. Valor da Transação (PIX)
- Valores baixos (< R$ 100): Aprovação rápida
- Valores médios (R$ 100-999): Aprovação com delay
- Valores altos (≥ R$ 1.000): Fica pendente

### 2. Número do Cartão
- Cada número de cartão simula um cenário específico
- Aprovado, Recusado, Em Análise, etc.

### 3. Status Esperados

#### Cartão de Crédito:
- `AUTHORIZED`: Pagamento autorizado
- `PAID`: Pagamento confirmado e capturado
- `DECLINED`: Pagamento recusado
- `IN_ANALYSIS`: Em análise (antifraude)
- `CANCELED`: Cancelado

#### PIX:
- `WAITING`: Aguardando pagamento
- `PAID`: Pago e confirmado

---

## 🚨 Problemas Comuns e Soluções

### Erro: "SDK do PagBank não carregado"
**Solução:**
1. Verificar se o script está no `<head>` do layout
2. Abrir console do navegador (F12)
3. Verificar se há erro ao carregar o script
4. Limpar cache (Ctrl + Shift + R)

### Erro: "Chave pública não configurada"
**Solução:**
1. Verificar se `.env` tem: `NEXT_PUBLIC_PAGBANK_PUBLIC_KEY_SANDBOX`
2. Reiniciar servidor: `Ctrl+C` e `npm run dev`

### PIX não gera QR Code
**Solução:**
1. Acessar painel Sandbox
2. Verificar se tem chave PIX cadastrada
3. Aguardar 15 minutos após criar chave
4. Tentar novamente

### Erro: APIX-20164 (PIX)
**Causa:** Chave PIX não cadastrada ou aguardando ativação
**Solução:**
1. Cadastrar chave PIX no painel Sandbox
2. Aguardar 15 minutos
3. Tentar criar pedido novamente

### Pagamento PIX não atualiza
**Verificações:**
1. Webhook está configurado?
2. Valor usado ativa a simulação? (< R$ 1.000)
3. Servidor está rodando?
4. Verificar logs: console do servidor

---

## 📝 Checklist de Testes Completo

### Antes de Testar
- [ ] Servidor rodando (`npm run dev`)
- [ ] Banco de dados acessível
- [ ] Credenciais do Sandbox configuradas
- [ ] SDK PagBank carregando no navegador

### Testes de Cartão
- [ ] Cartão aprovado 1x
- [ ] Cartão aprovado 3x
- [ ] Cartão aprovado 12x
- [ ] Cartão recusado
- [ ] Cartão em análise
- [ ] Validação de campos (número, CVV, validade)
- [ ] Formatação automática dos campos

### Testes de PIX
- [ ] Gerar QR Code
- [ ] Copiar código PIX
- [ ] Pagamento rápido (< R$ 100)
- [ ] Pagamento com delay (R$ 100-999)
- [ ] QR Code exibindo imagem
- [ ] Timer de expiração
- [ ] Polling automático de status

### Testes de Fluxo
- [ ] Cliente não logado
- [ ] Cliente logado
- [ ] Criar conta durante checkout
- [ ] Redirecionamento após pagamento
- [ ] Mensagens de erro apropriadas
- [ ] Webhooks atualizando banco

### Testes de Segurança
- [ ] Dados do cartão não aparecem em logs
- [ ] Apenas cartão criptografado enviado ao backend
- [ ] Tokens não são reutilizáveis
- [ ] HTTPS em produção

---

## 🎯 Próximos Passos Após Testes

1. ✅ Validar todos os cenários de teste
2. ✅ Corrigir bugs encontrados
3. ✅ Testar performance sob carga
4. ✅ Obter credenciais de **produção**
5. ✅ Configurar webhook em produção
6. ✅ Fazer testes em produção com valores baixos
7. ✅ Ativar para clientes reais

---

## 📚 Links Úteis

- **Painel Sandbox**: https://sandbox.pagseguro.uol.com.br
- **Documentação PagBank**: https://developer.pagbank.com.br
- **Cartões de Teste**: https://developer.pagbank.com.br/docs/cartoes-de-teste
- **Simulador**: https://developer.pagbank.com.br/docs/simulador
- **Suporte**: https://developer.pagbank.com.br/discuss

---

**Última atualização:** 19/10/2025
**Versão:** 1.0
