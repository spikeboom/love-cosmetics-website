# Arquivos Relacionados ao Carrinho e Cupons

Este documento lista todos os arquivos envolvidos com a funcionalidade de carrinho e cupons no projeto Love Cosmetics.

## 📁 Estrutura Principal

### Módulos de Domínio
- `src/modules/cupom/domain.ts` - Domínio e regras de negócio dos cupons
- `src/modules/produto/domain.ts` - Domínio dos produtos (relacionado ao carrinho)
- `src/modules/pedido/domain.ts` - Domínio dos pedidos

### Componentes do Carrinho
- `src/components/cart/` - Pasta principal dos componentes do carrinho
  - `AddToCart/add-to-cart.tsx` - Componente para adicionar produto ao carrinho
  - `CleanCart/clean-cart.tsx` - Componente para limpar o carrinho
  - `FixedBuyButton/botao-fixo-comprar.tsx` - Botão fixo de compra
  - `ModalCart/` - Modal do carrinho
    - `modal-cart.tsx` - Modal principal do carrinho
    - `CartHeader.tsx` - Cabeçalho do modal do carrinho
    - `CartProductItem.tsx` - Item individual do produto no carrinho
    - `CartProductList.tsx` - Lista de produtos no carrinho
    - `CartSummary.tsx` - Resumo do carrinho (totais, cupons, etc.)
    - `EmptyCartMessage.tsx` - Mensagem quando carrinho está vazio
    - `SuggestedProductsCarousel.tsx` - Carrossel de produtos sugeridos
    - `style.css` - Estilos do modal do carrinho

### Hooks
- `src/hooks/useModalCart.ts` - Hook personalizado para gerenciar estado do carrinho

### Contexto
- `src/components/common/Context/context.jsx` - Contexto global da aplicação (inclui carrinho)

### Ícones e UI
- `src/components/layout/HeaderIcons/icon-cart.tsx` - Ícone do carrinho no header

### Páginas e Checkout
- `src/app/(global)/checkout/` - Página de checkout
  - `page.tsx` - Página principal do checkout
  - `PedidoForm.tsx` - Formulário do pedido
  - `PushInitiateCheckout.tsx` - Componente para iniciar checkout
  - `MaskedInput.tsx` - Input com máscara para formulário
- `src/app/(global)/confirmacao/page.tsx` - Página de confirmação do pedido
- `src/app/(global)/pdp/[slug]/page.tsx` - Página do produto (PDP) com funcionalidades do carrinho

### APIs
- `src/app/api/cupom/` - API endpoints para cupons
- `src/app/api/pedido/route.ts` - API para criar pedidos
- `src/app/api/checkout_notification/route.ts` - Notificações do checkout
- `src/app/api/payment_notification/route.ts` - Notificações de pagamento

### Componentes de Produto
- `src/components/product/ProductCarousel/carousel-products.tsx` - Carrossel de produtos com funcionalidade de carrinho
- `src/components/common/HomeProduct/carousel-products.tsx` - Carrossel da home com carrinho

### Formulários de Pagamento
- `src/components/forms/PaymentMethods/pague-com.tsx` - Métodos de pagamento
- `src/components/forms/AcceptedCards/cartoes-aceitos.tsx` - Cartões aceitos
- `src/components/forms/PaymentIcons/` - Ícones de pagamento
  - `icon-credcard.tsx` - Ícone cartão de crédito
  - `icon-pix.tsx` - Ícone PIX
  - `icon-reembolso.tsx` - Ícone reembolso

### Admin
- `src/app/(admin)/pedidos/page.tsx` - Página administrativa de pedidos

### Testes
- `tests/cart-and-coupon.spec.ts` - Testes automatizados para carrinho e cupons

### Banco de Dados
- `prisma/migrations/20250309215142_descontos/migration.sql` - Migration para descontos/cupons
- `prisma/schema.prisma` - Schema do banco de dados

## 🔧 Funcionalidades Principais

### Carrinho
- Adicionar produtos ao carrinho
- Remover produtos do carrinho
- Limpar carrinho completamente
- Visualizar resumo do carrinho
- Calcular totais e fretes
- Modal responsivo do carrinho

### Cupons
- Aplicar cupons de desconto
- Validar cupons
- Calcular desconto no total
- Gerenciar regras de negócio dos cupons

### Checkout
- Processo completo de checkout
- Formulário de dados do cliente
- Seleção de método de pagamento
- Confirmação do pedido
- Notificações de pagamento

## 📊 Estado e Gerenciamento
- Context API para estado global
- Hook useModalCart para operações do carrinho
- Persistência de dados no banco via Prisma

## 🧪 Testes
- Testes end-to-end com Playwright
- Cobertura das funcionalidades principais de carrinho e cupons