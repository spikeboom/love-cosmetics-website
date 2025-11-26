# 📋 Requisitos Funcionais - Love Cosmetics

## 1. Carrinho de Compras

### 1.1 Gerenciamento de Produtos
- **RF001**: Adicionar produto ao carrinho
  - Deve adicionar produto com quantidade inicial = 1
  - Deve exibir notificação de sucesso
  - Deve atualizar contador do carrinho no header
  - Deve disparar evento GTM `add_to_cart`

- **RF002**: Incrementar quantidade de produto
  - Deve permitir aumentar quantidade via botão "+"
  - Deve atualizar preço total automaticamente
  - Deve manter desconto de cupom se aplicado

- **RF003**: Decrementar quantidade de produto
  - Deve permitir diminuir quantidade via botão "-"
  - Deve remover produto se quantidade chegar a 0
  - Deve atualizar preço total automaticamente

- **RF004**: Remover produto do carrinho
  - Deve ter botão de remover produto
  - Deve solicitar confirmação (opcional)
  - Deve atualizar total e contador
  - Deve disparar evento GTM `remove_from_cart`

- **RF005**: Limpar carrinho completo
  - Deve remover todos os produtos
  - Deve resetar cupons aplicados
  - Deve mostrar mensagem de carrinho vazio

### 1.2 Persistência de Dados
- **RF006**: Salvar carrinho no localStorage
  - Deve persistir entre sessões do navegador
  - Deve sincronizar com Context API
  - Deve restaurar ao recarregar página

- **RF007**: Sincronização de estado
  - Context API como fonte principal
  - LocalStorage como backup
  - Cookies para cupons no backend

### 1.3 Interface do Carrinho
- **RF008**: Modal do carrinho
  - Deve abrir ao clicar no ícone do carrinho
  - Deve mostrar lista de produtos
  - Deve mostrar resumo com totais
  - Deve ter botão de fechar

- **RF009**: Produtos sugeridos
  - Deve mostrar carousel de produtos relacionados
  - Produtos com flag `-showInCart` no Strapi
  - Deve permitir adicionar direto do modal

## 2. Sistema de Cupons e Descontos

### 2.1 Aplicação de Cupons
- **RF010**: Validar cupom
  - Deve buscar cupom no backend (Strapi)
  - Deve verificar validade e regras
  - Deve mostrar erro se inválido

- **RF011**: Aplicar desconto
  - Deve calcular desconto baseado no multiplicador
  - Deve atualizar preços de todos os produtos
  - Deve mostrar preço original riscado
  - Deve mostrar economia total

- **RF012**: Remover cupom
  - Deve ter botão para remover cupom
  - Deve restaurar preços originais
  - Deve atualizar totais
  - Deve disparar evento GTM `remove_coupon`

### 2.2 Regras de Desconto
- **RF013**: Cálculo de desconto
  - Fórmula: `preco_final = preco_original * multiplicador`
  - Multiplicador vem do campo `multiplacar` no Strapi
  - Ex: 0.75 para 25% de desconto

- **RF014**: Exibição de desconto
  - Mostrar tag com valor economizado
  - Formato: `-R$ XX,XX`
  - Mostrar economia total no resumo

### 2.3 Persistência de Cupons
- **RF015**: Salvar cupom aplicado
  - Armazenar no localStorage
  - Criar cookie `cupomBackend` para servidor
  - Sincronizar com Context API

## 3. Checkout e Pagamento

### 3.1 Formulário de Checkout
- **RF016**: Dados pessoais
  - Nome e sobrenome (obrigatórios)
  - Email válido (obrigatório)
  - CPF válido (obrigatório)
  - Telefone com DDD (obrigatório)
  - Data de nascimento (obrigatório)

- **RF017**: Endereço de entrega
  - CEP com busca automática
  - Endereço, número, complemento
  - Bairro, cidade, estado
  - País (default: Brasil)

- **RF018**: Validações do formulário
  - Validação com Zod schema
  - Mensagens de erro específicas
  - Validação de CPF
  - Validação de email
  - Formatação automática de campos

### 3.2 Integração PagSeguro
- **RF019**: Criar pedido no banco
  - Salvar dados no Prisma/PostgreSQL
  - Gerar ID único do pedido
  - Associar itens do carrinho

- **RF020**: Gerar link de pagamento
  - Enviar dados para API PagSeguro
  - Incluir dados do cliente formatados
  - Incluir itens com referência e preço
  - Adicionar frete (R$ 15,00)

- **RF021**: Redirecionamento
  - Redirecionar para PagSeguro
  - URL de retorno para `/confirmacao`
  - URLs de notificação configuradas

### 3.3 Notificações de Pagamento
- **RF022**: Webhook de checkout
  - Endpoint `/api/checkout_notification`
  - Atualizar status do pedido
  - Registrar log de eventos

- **RF023**: Webhook de pagamento
  - Endpoint `/api/payment_notification`
  - Atualizar status de pagamento
  - Disparar evento de compra GTM
  - Enviar email de confirmação

## 4. Analytics e Tracking

### 4.1 Google Tag Manager
- **RF024**: Configuração GTM
  - Container ID: `GTM-T7ZMDHZF`
  - Carregar no layout principal
  - Aguardar inicialização antes de eventos

### 4.2 Eventos de E-commerce
- **RF025**: Add to Cart
  - Dados: product_id, name, price, quantity
  - Event ID único
  - Session data (ga_session_id, ga_session_number)

- **RF026**: Remove from Cart
  - Dados do produto removido
  - Event ID único
  - Quantidade removida

- **RF027**: Initiate Checkout
  - Lista de todos os produtos
  - Valor total
  - Cupons aplicados

- **RF028**: Add Payment Info
  - Método de pagamento
  - Valor total
  - Event ID único

- **RF029**: Purchase
  - Transaction ID
  - Valor total
  - Lista de produtos
  - Valor do frete
  - Descontos aplicados

### 4.3 Session Tracking
- **RF030**: Captura de sessão GA4
  - Ler cookies `_ga` e `_ga_*`
  - Extrair session_id e session_number
  - Fallback com timestamp se não disponível
  - Incluir em todos os eventos

## 5. Interface e UX

### 5.1 Componentes Visuais
- **RF031**: Header com carrinho
  - Ícone com contador de itens
  - Atualização em tempo real
  - Click para abrir modal

- **RF032**: Botão fixo de compra (mobile)
  - Visível em páginas de produto
  - Mostrar preço e botão "Comprar"
  - Scroll suave ao clicar

- **RF033**: Carousel de produtos
  - Homepage: Kits e produtos individuais
  - PDP: Produtos relacionados
  - Carrinho: Produtos sugeridos

### 5.2 Notificações
- **RF034**: Snackbar notifications
  - Sucesso ao adicionar produto
  - Erro em validações
  - Confirmações de ações
  - Auto-dismiss após 3s

- **RF035**: Loading states
  - Spinner durante operações
  - Desabilitar botões durante processamento
  - Feedback visual de carregamento

## 6. Produtos e Catálogo

### 6.1 Listagem de Produtos
- **RF036**: Buscar produtos do Strapi
  - Filtrar por flags (hide, showInCart)
  - Ordenar por updatedAt
  - Popular imagens e descrições

- **RF037**: Processamento de produtos
  - Aplicar cupom se ativo
  - Calcular preços com desconto
  - Manter backup de preços originais

### 6.2 Página de Produto (PDP)
- **RF038**: Informações do produto
  - Nome, descrição, preço
  - Carousel de imagens
  - Lista de ingredientes
  - Como usar
  - Avaliações

- **RF039**: Adicionar ao carrinho da PDP
  - Botão principal de compra
  - Quantidade inicial = 1
  - Abrir modal do carrinho após adicionar

## 7. Administração

### 7.1 Gestão de Pedidos
- **RF040**: Listar pedidos (admin)
  - Rota protegida `/pedidos`
  - Filtros por status
  - Detalhes do pedido
  - Histórico de status

### 7.2 Login Administrativo
- **RF041**: Autenticação
  - Login com email/senha
  - Sessão com JWT
  - Middleware de proteção
  - Logout

## 8. Segurança e Validação

### 8.1 Validações Server-Side
- **RF042**: Validação de preços
  - Nunca confiar em preços do cliente
  - Recalcular no servidor
  - Validar cupons no backend

- **RF043**: Sanitização de dados
  - Limpar inputs do usuário
  - Prevenir XSS
  - Validar formatos (CPF, email, etc)

### 8.2 Logs e Auditoria
- **RF044**: Log de erros
  - Endpoint `/api/log-client-error`
  - Capturar erros do frontend
  - Registrar stack trace
  - Notificar time de desenvolvimento

- **RF045**: Log de transações
  - Registrar criação de pedidos
  - Log de mudanças de status
  - Webhooks recebidos
  - Tentativas de pagamento

## 9. Performance

### 9.1 Otimizações
- **RF046**: Cache de dados
  - Cache de produtos do Strapi
  - Debounce em operações frequentes
  - Lazy loading de imagens

- **RF047**: Bundle optimization
  - Code splitting por rota
  - Minificação de assets
  - Compressão gzip

### 9.2 Limites
- **RF048**: Rate limiting
  - Limitar requisições por IP
  - Throttle em APIs críticas
  - Proteção contra spam

## 10. Conformidade

### 10.1 LGPD/Privacidade
- **RF049**: Consentimento
  - Checkbox para WhatsApp marketing
  - Opção de salvar dados
  - Política de privacidade

- **RF050**: Dados pessoais
  - Criptografia de dados sensíveis
  - Direito ao esquecimento
  - Exportação de dados

---

**Observação**: Todos estes requisitos DEVEM ser mantidos funcionais após qualquer refatoração. Qualquer alteração deve ser validada contra esta lista.