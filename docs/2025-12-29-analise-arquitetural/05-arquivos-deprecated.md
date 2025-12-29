# Lista de Arquivos para Deprecated

**Data:** 29 de Dezembro de 2024

---

## Resumo

Este documento lista todos os arquivos que **NAO sao usados pelo Figma** e podem ser movidos para uma pasta `/deprecated` ou removidos.

**Total de arquivos candidatos a deprecated:** ~150 arquivos

---

## 1. Route Groups Completos

### 1.1 src/app/(global)/ - 33 arquivos

Todo o route group `(global)` pode ser movido pois o Figma possui seu proprio layout.

```
src/app/(global)/
├── favicon.ico
├── globals.css
├── layout.tsx
├── page.tsx
│
├── (cliente-logado)/minha-conta/
│   ├── LogoutButton.tsx
│   ├── page.tsx
│   ├── dados/page.tsx
│   ├── enderecos/page.tsx
│   ├── pedidos/page.tsx
│   └── seguranca/page.tsx
│
├── (loja)/conta/
│   ├── cadastrar/page.tsx
│   ├── entrar/page.tsx
│   └── esqueci-senha/page.tsx
│
├── (main)/
│   ├── layout.tsx
│   ├── home/
│   │   ├── form-email.tsx
│   │   └── page.tsx
│   ├── nossa-historia/page.tsx
│   ├── pdp/[slug]/page.tsx
│   ├── test-errors/page.tsx
│   ├── checkout/
│   │   ├── page.tsx
│   │   ├── pagamento/page.tsx
│   │   ├── CardPaymentForm.tsx
│   │   ├── EnderecoSelector.tsx
│   │   ├── MaskedInput.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── PedidoForm.tsx
│   │   ├── PixPayment.tsx
│   │   ├── PushInitiateCheckout.tsx
│   │   └── QuickLoginModal.tsx
│   └── confirmacao/page.tsx
│
└── galeria/
    ├── page.tsx
    ├── [categoria]/page.tsx
    └── [categoria]/[subcategoria]/page.tsx
```

### 1.2 src/app/(admin)/ - 6 arquivos

O painel admin nao e usado pelo Figma, mas pode ser necessario para operacoes. **Verificar antes de mover.**

```
src/app/(admin)/
├── layout.tsx
└── pedidos/
    ├── page.tsx
    ├── login/page.tsx
    ├── novo/page.tsx
    ├── constants/statusEntrega.ts
    └── components/StatusEntregaManager.tsx
```

---

## 2. Components Nao Usados

### 2.1 src/components/cart/ - 14 arquivos

**Excecao:** `CartLoadingSkeleton.tsx` e `OutdatedCartAlert.tsx` SAO usados pelo Figma.

```
src/components/cart/
├── AddToCart/
│   └── add-to-cart.tsx
├── CleanCart/
│   └── clean-cart.tsx
├── FixedBuyButton/
│   └── botao-fixo-comprar.tsx
└── ModalCart/                    # Todo o modal antigo
    ├── modal-cart.tsx
    ├── style.css
    ├── CartHeader.tsx
    ├── CartProductItem.tsx
    ├── CartProductList.tsx
    ├── CartSummary.tsx
    ├── CheckoutActions.tsx
    ├── CepInput.tsx
    ├── FreightSection.tsx
    ├── TotalsSection.tsx
    ├── CouponInputSection.tsx
    ├── AppliedCouponsSection.tsx
    ├── EmptyCartMessage.tsx
    └── SuggestedProductsCarousel.tsx
```

### 2.2 src/components/cliente/ - 2 arquivos

```
src/components/cliente/
├── EnderecoForm.tsx
└── EnderecosList.tsx
```

### 2.3 src/components/common/ - 12 arquivos

**Excecao:** `Context/context.jsx` E USADO pelo Figma (mas sera refatorado).

```
src/components/common/
├── Breadcrumbs/
│   └── breadcrumbs.tsx
├── EventViewContent/
│   └── event-view-content.tsx
├── FAQ/
│   ├── duvidas.tsx
│   └── Item/index.tsx
├── FloatingWhatsApp/
│   ├── index.ts
│   └── FloatingWhatsApp.tsx
├── HomeProduct/
│   ├── carousel-products.tsx
│   ├── icon-sacola.tsx
│   └── style.css
├── LogErrorFront/
│   └── log-error-front.tsx
├── MoreLinks/
│   └── mais-links.tsx
├── SocialMedia/
│   └── lista-resdes-sociais.tsx
└── snack-provider.tsx
```

### 2.4 src/components/forms/ - 8 arquivos

```
src/components/forms/
├── AcceptedCards/
│   └── cartoes-aceitos.tsx
├── AvailablePoints/
│   └── pontos-disponiveis.tsx
├── EmailSignup/
│   └── cadastre-seu-email.tsx
├── PaymentIcons/
│   ├── icon-credcard.tsx
│   ├── icon-pix.tsx
│   └── icon-reembolso.tsx
└── PaymentMethods/
    └── pague-com.tsx
```

### 2.5 src/components/gallery/ - 10 arquivos

```
src/components/gallery/
├── README.md
├── categoryMapper.ts
├── CategoryBreadcrumb.tsx
├── CategoryNavigation.tsx
├── GalleryNavigation.tsx
├── GalleryStats.tsx
├── GallerySubHeader.tsx
├── ProductGallery.tsx
└── ProductModal.tsx
```

### 2.6 src/components/layout/ - 10 arquivos

```
src/components/layout/
├── Footer/
│   └── rodape.tsx
├── FooterAlt/
│   └── icon-sallve.tsx
├── Header/
│   ├── cabecalho.tsx
│   └── styles.css
├── HeaderIcons/
│   ├── icon-cart.tsx
│   ├── icon-hamburger.tsx
│   ├── icon-login.tsx
│   └── icon-search.tsx
└── Menu/
    └── menu.tsx
```

### 2.7 src/components/product/ - 14 arquivos

```
src/components/product/
├── ActiveIngredients/
│   └── lista-ativos.jsx
├── CustomerReviews/
│   └── avaliacoes-clientes.tsx
├── HowToUse/
│   └── como-usar-essa-formula.tsx
├── ProductCarousel/
│   ├── carousel-products.tsx
│   ├── icon-sacola.tsx
│   └── style.css
├── ProductDescription/
│   └── product-descricao.tsx
├── ProductImageCarousel/
│   └── carousel-imagens-top.tsx
├── ProductInfoTop/
│   └── product-info-top.tsx
├── Reviews/
│   ├── reviews.jsx
│   └── Review/
│       ├── review.jsx
│       └── apagar.html
└── Stickers/
    └── adesivos.tsx
```

### 2.8 src/components/ui/ - 6 arquivos

```
src/components/ui/
├── Badges/
│   ├── icon-fragance.tsx
│   ├── icon-rabbit.tsx
│   ├── icon-recicle.tsx
│   └── icon-vegan.tsx
├── Icons/
│   └── icon-plus.tsx
└── Tabs/
    └── index.tsx
```

---

## 3. Hooks Nao Usados

**Excecao:** `hooks/checkout/` E USADO pelo Figma.

```
src/hooks/
├── useCarousel.ts
├── useModalCart.ts
├── useModalCartSimplified.ts
├── useFreight.ts
├── useCartValidation.ts
└── useModalCart/
    ├── core.ts
    ├── modal-state.ts
    ├── suggested-products.ts
    └── coupon-local.ts
```

---

## 4. Libs Nao Usadas pelo Frontend Figma

**ATENCAO:** Estas libs sao usadas pelo **backend (API routes)**. NAO mover sem verificar.

```
src/lib/
├── prisma.ts                     # BACKEND - NAO MOVER
├── bling/                        # BACKEND - NAO MOVER
│   ├── simple-auth.ts
│   ├── auto-generate-nf.ts
│   └── invoice.ts
├── cliente/                      # BACKEND - NAO MOVER
│   ├── auth.ts
│   ├── auth-edge.ts
│   ├── session.ts
│   ├── sms-storage.ts
│   └── validation.ts
├── strapi/                       # BACKEND - NAO MOVER
│   ├── index.ts
│   ├── produtos.ts
│   └── cupons.ts
├── pedido/
│   └── validate-order.ts         # BACKEND - NAO MOVER
└── pagbank/
    └── create-checkout-link.ts   # BACKEND - NAO MOVER
```

---

## 5. Estrutura Proposta de Deprecated

```
src/deprecated/
├── README.md                     # Explicacao do que esta aqui
│
├── app-global/                   # Antigo (global)
│   ├── cliente-logado/
│   ├── loja/
│   ├── main/
│   └── galeria/
│
├── components/
│   ├── cart/
│   │   ├── AddToCart/
│   │   ├── CleanCart/
│   │   ├── FixedBuyButton/
│   │   └── ModalCart/
│   ├── cliente/
│   ├── common/
│   │   ├── Breadcrumbs/
│   │   ├── EventViewContent/
│   │   ├── FAQ/
│   │   ├── FloatingWhatsApp/
│   │   ├── HomeProduct/
│   │   ├── LogErrorFront/
│   │   ├── MoreLinks/
│   │   ├── SocialMedia/
│   │   └── snack-provider.tsx
│   ├── forms/
│   ├── gallery/
│   ├── layout/
│   ├── product/
│   └── ui/
│
└── hooks/
    ├── useCarousel.ts
    ├── useModalCart.ts
    ├── useModalCartSimplified.ts
    ├── useFreight.ts
    ├── useCartValidation.ts
    └── useModalCart/
```

---

## 6. README.md para pasta Deprecated

```markdown
# Deprecated - Codigo Legado

Este diretorio contem codigo que **NAO e mais usado** pelo Figma (novo design).

## Por que estes arquivos estao aqui?

O projeto passou por uma refatoracao onde:
1. O novo design (Figma) foi implementado em route groups separados
2. Componentes antigos foram substituidos por novos
3. Hooks foram consolidados

## Posso deletar estes arquivos?

**SIM**, mas verifique primeiro:
1. Se nao ha imports restantes (use `grep -r "from.*deprecated"`)
2. Se o admin ainda precisa de algum componente
3. Se ha testes que dependem destes arquivos

## Estrutura

- `app-global/` - Antigo layout da loja
- `components/` - Componentes substituidos pelo Figma
- `hooks/` - Hooks substituidos ou nao usados

## Data de Deprecacao

29 de Dezembro de 2024
```

---

## 7. Script de Migracao

```bash
#!/bin/bash
# migrate-to-deprecated.sh

# Criar estrutura
mkdir -p src/deprecated/{app-global,components,hooks}

# Mover (global) - CUIDADO: verificar se admin nao usa
# mv src/app/\(global\)/* src/deprecated/app-global/

# Mover components nao usados
mv src/components/cart/AddToCart src/deprecated/components/cart/
mv src/components/cart/CleanCart src/deprecated/components/cart/
mv src/components/cart/FixedBuyButton src/deprecated/components/cart/
mv src/components/cart/ModalCart src/deprecated/components/cart/

mv src/components/cliente src/deprecated/components/
mv src/components/common/Breadcrumbs src/deprecated/components/common/
mv src/components/common/EventViewContent src/deprecated/components/common/
mv src/components/common/FAQ src/deprecated/components/common/
mv src/components/common/FloatingWhatsApp src/deprecated/components/common/
mv src/components/common/HomeProduct src/deprecated/components/common/
mv src/components/common/LogErrorFront src/deprecated/components/common/
mv src/components/common/MoreLinks src/deprecated/components/common/
mv src/components/common/SocialMedia src/deprecated/components/common/
mv src/components/common/snack-provider.tsx src/deprecated/components/common/

mv src/components/forms src/deprecated/components/
mv src/components/gallery src/deprecated/components/
mv src/components/layout src/deprecated/components/
mv src/components/product src/deprecated/components/
mv src/components/ui src/deprecated/components/

# Mover hooks nao usados
mv src/hooks/useCarousel.ts src/deprecated/hooks/
mv src/hooks/useModalCart.ts src/deprecated/hooks/
mv src/hooks/useModalCartSimplified.ts src/deprecated/hooks/
mv src/hooks/useFreight.ts src/deprecated/hooks/
mv src/hooks/useCartValidation.ts src/deprecated/hooks/
mv src/hooks/useModalCart src/deprecated/hooks/

echo "Migracao concluida! Verifique imports quebrados."
```

---

## 8. Checklist Pre-Migracao

- [ ] Backup do codigo atual
- [ ] Verificar que Figma funciona sem estes arquivos
- [ ] Verificar que admin ainda funciona (se necessario)
- [ ] Rodar build para verificar imports quebrados
- [ ] Atualizar .gitignore se necessario
- [ ] Documentar no README principal

---

*Documento criado em 29/12/2024*
