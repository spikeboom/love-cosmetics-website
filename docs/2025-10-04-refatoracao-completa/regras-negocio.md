# 📐 Regras de Negócio - Love Cosmetics

## 1. Regras de Carrinho

### 1.1 Gerenciamento de Itens
- **RN001**: Quantidade mínima por produto = 1
- **RN002**: Quantidade máxima por produto = 99
- **RN003**: Ao decrementar de 1 para 0, produto é removido
- **RN004**: Carrinho vazio não permite checkout
- **RN005**: Produtos com flag "hide" não aparecem em listagens

### 1.2 Persistência
- **RN006**: Carrinho persiste por 30 dias no localStorage
- **RN007**: Ao fazer login, carrinho anônimo é mesclado com carrinho do usuário
- **RN008**: Limpeza automática de carrinhos abandonados após 30 dias

### 1.3 Sincronização
- **RN009**: Context API é fonte de verdade primária
- **RN010**: LocalStorage é backup secundário
- **RN011**: Cookies são usados apenas para cupons no backend
- **RN012**: Conflitos resolvidos em favor da versão mais recente

## 2. Regras de Preços e Descontos

### 2.1 Cálculo de Preços
- **RN013**: Preço base vem do campo `preco` do Strapi
- **RN014**: Preço original (se houver promoção) vem de `preco_de`
- **RN015**: Frete fixo = R$ 15,00 para qualquer pedido
- **RN016**: Frete grátis não disponível (mesmo com cupom)

### 2.2 Cupons de Desconto
- **RN017**: Apenas 1 cupom pode ser aplicado por vez
- **RN018**: Cupom aplicado via multiplicador (ex: 0.75 = 25% desconto)
- **RN019**: Cupom afeta todos os produtos no carrinho
- **RN020**: Cupom não afeta valor do frete
- **RN021**: Remover cupom restaura preços originais

### 2.3 Formatação de Valores
- **RN022**: Preços exibidos com 2 casas decimais
- **RN023**: Separador decimal = vírgula (,)
- **RN024**: Separador de milhares = ponto (.)
- **RN025**: Símbolo da moeda = R$ antes do valor

### 2.4 Tags de Desconto
- **RN026**: Tag desconto formato: `-R$ XX,XX`
- **RN027**: Tag economia formato: `ECONOMIZA R$ XX,XX`
- **RN028**: Tags só aparecem quando há desconto aplicado

## 3. Regras de Checkout

### 3.1 Validações de Campos
- **RN029**: CPF deve ser válido (algoritmo de validação)
- **RN030**: Email deve ter formato válido (regex)
- **RN031**: Telefone deve ter 10 ou 11 dígitos
- **RN032**: CEP deve ter 8 dígitos
- **RN033**: Data nascimento: idade mínima 18 anos

### 3.2 Formatação Automática
- **RN034**: CPF formatado como XXX.XXX.XXX-XX
- **RN035**: Telefone formatado como (XX) XXXXX-XXXX
- **RN036**: CEP formatado como XXXXX-XXX
- **RN037**: Data formatado como DD/MM/AAAA

### 3.3 Busca de Endereço
- **RN038**: CEP válido busca endereço via ViaCEP
- **RN039**: Campos preenchidos automaticamente não são editáveis
- **RN040**: Número e complemento sempre editáveis
- **RN041**: CEP inválido mostra erro específico

## 4. Regras de Pagamento

### 4.1 Valores Mínimos e Máximos
- **RN042**: Valor mínimo do pedido = R$ 10,00
- **RN043**: Valor máximo do pedido = R$ 10.000,00
- **RN044**: Parcelamento disponível acima de R$ 50,00
- **RN045**: Máximo de parcelas = 12x

### 4.2 Métodos de Pagamento
- **RN046**: Cartão de crédito (todas bandeiras)
- **RN047**: PIX (pagamento instantâneo)
- **RN048**: Boleto (vencimento D+3)
- **RN049**: Cartão de débito (bandeiras específicas)

### 4.3 Processamento
- **RN050**: Timeout de pagamento = 30 minutos
- **RN051**: Após timeout, pedido cancelado automaticamente
- **RN052**: Tentativas de pagamento ilimitadas até timeout
- **RN053**: Email de confirmação enviado após pagamento aprovado

## 5. Regras de Produtos

### 5.1 Disponibilidade
- **RN054**: Produtos sem estoque não aparecem
- **RN055**: Produtos com flag "hide" são ocultados
- **RN056**: Produtos com flag "-showInCart" aparecem no carrinho vazio

### 5.2 Categorização
- **RN057**: Produtos com "Kit" no nome são agrupados
- **RN058**: Ordenação padrão por data de atualização (desc)
- **RN059**: Máximo de produtos por página = 20

### 5.3 Informações Obrigatórias
- **RN060**: Todo produto deve ter nome, preço e slug
- **RN061**: Imagem principal obrigatória
- **RN062**: Descrição mínima de 50 caracteres

## 6. Regras de Analytics

### 6.1 Eventos Obrigatórios
- **RN063**: Todo add_to_cart deve ter event_id único
- **RN064**: Purchase deve incluir transaction_id
- **RN065**: Todos eventos devem ter timestamp

### 6.2 Session Tracking
- **RN066**: Capturar ga_session_id de cookies GA4
- **RN067**: Se não disponível, usar timestamp como fallback
- **RN068**: Session_number incrementa a cada nova sessão

### 6.3 Data Layer
- **RN069**: Eventos enviados via window.dataLayer.push()
- **RN070**: Formato ecommerce Enhanced E-commerce
- **RN071**: Currency sempre "BRL"

## 7. Regras de Segurança

### 7.1 Validação de Dados
- **RN072**: Nunca confiar em preços vindos do cliente
- **RN073**: Sempre recalcular totais no servidor
- **RN074**: Validar cupons no backend antes de aplicar
- **RN075**: Sanitizar todos inputs do usuário

### 7.2 Autenticação
- **RN076**: Admin requer login com JWT
- **RN077**: Token expira em 24 horas
- **RN078**: Refresh token não implementado
- **RN079**: Logout limpa token e sessão

### 7.3 Rate Limiting
- **RN080**: Máximo 10 pedidos/minuto por IP
- **RN081**: Máximo 5 tentativas login/hora
- **RN082**: Bloqueio temporário após exceder limite

## 8. Regras de Notificação

### 8.1 Email
- **RN083**: Email de confirmação após pagamento
- **RN084**: Email de abandono após 24h (se autorizado)
- **RN085**: Email de status quando pedido enviado

### 8.2 WhatsApp
- **RN086**: Só enviar se checkbox marcado
- **RN087**: Mensagem de confirmação de pedido
- **RN088**: Notificação de envio com código rastreio

### 8.3 Snackbar (Interface)
- **RN089**: Sucesso = verde, 3 segundos
- **RN090**: Erro = vermelho, 5 segundos
- **RN091**: Info = azul, 3 segundos
- **RN092**: Máximo 3 notificações simultâneas

## 9. Regras de Performance

### 9.1 Tempos de Resposta
- **RN093**: Página inicial < 3 segundos
- **RN094**: APIs internas < 500ms
- **RN095**: Busca CEP < 2 segundos
- **RN096**: Criação pedido < 5 segundos

### 9.2 Cache
- **RN097**: Produtos cacheados por 5 minutos
- **RN098**: Imagens com cache de 30 dias
- **RN099**: Cupons sem cache (sempre validar)

### 9.3 Limites
- **RN100**: Máximo 50 produtos no carrinho
- **RN101**: Máximo 10 cupons tentados/sessão
- **RN102**: Máximo 1MB para upload de imagens

## 10. Regras de Dados e LGPD

### 10.1 Consentimento
- **RN103**: Checkbox obrigatório para marketing
- **RN104**: Opção de não salvar dados pessoais
- **RN105**: Aceite de termos antes do pagamento

### 10.2 Retenção de Dados
- **RN106**: Dados de pedido mantidos por 5 anos
- **RN107**: Dados de marketing removíveis a pedido
- **RN108**: Logs mantidos por 90 dias

### 10.3 Direitos do Usuário
- **RN109**: Direito de acessar seus dados
- **RN110**: Direito de corrigir informações
- **RN111**: Direito ao esquecimento
- **RN112**: Exportação de dados em JSON

## 11. Regras de Estado e Fluxo

### 11.1 Estados do Pedido
```
CREATED → PENDING → PROCESSING → PAID → SHIPPED → DELIVERED
         ↘ CANCELLED (pode ocorrer até PROCESSING)
         ↘ FAILED (falha no pagamento)
         ↘ REFUNDED (após PAID)
```

### 11.2 Transições Permitidas
- **RN113**: CREATED só pode ir para PENDING ou CANCELLED
- **RN114**: PAID não pode voltar para PENDING
- **RN115**: DELIVERED é estado final
- **RN116**: REFUNDED pode ocorrer após PAID

### 11.3 Triggers de Estado
- **RN117**: PENDING → PAID: webhook de pagamento
- **RN118**: PAID → SHIPPED: ação manual admin
- **RN119**: SHIPPED → DELIVERED: confirmação entrega
- **RN120**: Qualquer → CANCELLED: timeout ou ação usuário

## 12. Regras de Integração

### 12.1 Strapi CMS
- **RN121**: Sempre usar token de autenticação
- **RN122**: Populate necessário para relações
- **RN123**: Filtros via query string
- **RN124**: Limite de 100 items por request

### 12.2 PagSeguro
- **RN125**: Usar token DEV em desenvolvimento
- **RN126**: Usar token PROD em produção
- **RN127**: Sempre incluir URLs de callback
- **RN128**: Reference_id = UUID do pedido

### 12.3 Webhooks
- **RN129**: Sempre validar assinatura
- **RN130**: Responder com 200 OK
- **RN131**: Processar de forma assíncrona
- **RN132**: Implementar retry em caso de falha

---

**Importante**: Estas regras são a base do funcionamento do sistema. Qualquer alteração deve ser documentada e validada contra possíveis impactos em outras regras relacionadas.