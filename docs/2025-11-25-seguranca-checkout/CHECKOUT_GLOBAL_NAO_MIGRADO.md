# Features do Checkout Global NAO Migradas para o Figma

Este documento lista as funcionalidades que existem no checkout global (`src/app/(global)/(main)/checkout/`) mas **NAO** foram migradas para o checkout figma (`src/app/(figma-checkout)/figma/checkout/`).

---

## 1. Autenticacao e Conta

### QuickLoginModal
- **Arquivo**: `QuickLoginModal.tsx`
- **Funcionalidade**: Modal de login rapido durante o checkout
- **Permite**: Usuario fazer login sem sair do checkout
- **Beneficio**: Auto-preenchimento de dados apos login

### EnderecoSelector
- **Arquivo**: `EnderecoSelector.tsx`
- **Funcionalidade**: Dropdown para selecionar enderecos salvos
- **Permite**: Usuarios logados escolherem entre enderecos cadastrados
- **Inclui**: Badge "Principal" para endereco padrao

### Criar Conta Durante Checkout
- **Checkbox**: "Salvar minhas informacoes"
- **Funcionalidade**: Cria conta automaticamente com dados do pedido
- **Envia**: Senha temporaria por email

---

## 2. Validacoes Avancadas

### CEP Restrito a Manaus
- O checkout global restringe entregas apenas para Manaus
- Verifica `data.localidade.toLowerCase() !== "manaus"`
- Mostra erro se CEP for de outra cidade

### Verificacao de Email Existente
- Verifica se email ja esta cadastrado
- Retorna erro `EMAIL_ALREADY_EXISTS` se ja existir conta
- Sugere fazer login

---

## 3. Frete Dinamico

### useFreight Hook
- **Arquivo**: `src/hooks/useFreight.ts`
- **Funcionalidade**: Calculo de frete via Frenet API
- **Permite**: Multiplas opcoes de transportadora
- **Armazena**: CEP e dados de frete no localStorage

### Selecao de Transportadora
- Mostra todas opcoes disponiveis
- Permite escolher entre diferentes transportadoras
- Exibe prazo e preco de cada opcao

---

## 4. Analytics e Tracking

### GTM (Google Tag Manager)
- **Arquivo**: `PushInitiateCheckout.tsx`
- **Eventos**: InitiateCheckout, AddPaymentInfo
- **Dados**: Items do carrinho, valor total, sessao GA

### Push de Dados do Usuario
- Hash de email e telefone (SHA-256)
- Enviado para GTM em eventos de purchase

---

## 5. Campos Adicionais

### Destinatario
- Campo separado para nome do destinatario
- Util para presentes ou entregas para terceiros

### Aceito Receber WhatsApp
- Checkbox de opt-in para comunicacoes via WhatsApp
- Salvo no pedido e no perfil do cliente

---

## 6. Order Summary Detalhado

### OrderSummary.tsx
- **Funcionalidade**: Resumo sticky ao lado do formulario
- **Exibe**:
  - Items do carrinho com imagens
  - Quantidades e precos unitarios
  - Subtotal
  - Frete com prazo de entrega
  - Cupons aplicados
  - Descontos
  - Total final

---

## 7. Integracao com Masked Inputs

### MaskedInput.tsx
- **Biblioteca**: IMask
- **Integra**: react-hook-form via Controller
- **Mascaras**: Telefone, CPF, CEP, Data

---

## 8. Parcelas Estendidas

### Cartao de Credito
- **Global**: 1 a 12 parcelas
- **Figma**: 1 a 3 parcelas
- Calculo automatico de valor por parcela

---

## Decisao de NAO Migrar

Estas features foram intencionalmente NAO migradas para manter o checkout figma simples e focado na experiencia de compra rapida. A migracao pode ser feita futuramente conforme necessidade.

### Prioridades para Migracao Futura
1. Login rapido (alto impacto em conversao)
2. Enderecos salvos (conveniencia para clientes recorrentes)
3. GTM tracking (essencial para analytics)
4. Frete dinamico (precisao nos valores)

---

## Arquivos de Referencia

Para implementar estas features no figma checkout, consulte:

- `src/app/(global)/(main)/checkout/PedidoForm.tsx`
- `src/app/(global)/(main)/checkout/QuickLoginModal.tsx`
- `src/app/(global)/(main)/checkout/EnderecoSelector.tsx`
- `src/app/(global)/(main)/checkout/OrderSummary.tsx`
- `src/app/(global)/(main)/checkout/MaskedInput.tsx`
- `src/hooks/useFreight.ts`
- `src/contexts/AuthContext.tsx`
