# Análise de Responsabilidades: context.jsx vs useModalCart.ts

## 🔴 **PROBLEMAS GRAVES IDENTIFICADOS**

### 1. **DUPLICAÇÃO DE RESPONSABILIDADES**

#### 🔄 **Cupom Handling**
- **context.jsx**: `handleCupom()`, `handleAddCupom()` - Lógica principal de cupons
- **useModalCart.ts**: `handleAddCupomLocal()`, `removeCoupon()` - Duplica lógica de cupons
- **❌ PROBLEMA**: Duas camadas manipulando cupons com lógicas similares

#### 🔄 **Snackbar/Notificações**
- **context.jsx**: Usa `useSnackbar()` e função `notify()`
- **useModalCart.ts**: Também usa `useSnackbar()` diretamente
- **❌ PROBLEMA**: Duas fontes de notificações sem coordenação

#### 🔄 **Estado do Modal**
- **context.jsx**: `sidebarMounted`, `setSidebarMounted`
- **useModalCart.ts**: `openCart`, `setOpenCart`, `forRefreshPage`
- **❌ PROBLEMA**: Estado do modal dividido entre dois lugares

### 2. **MISTURA DE RESPONSABILIDADES**

#### 📦 **context.jsx FAZ DEMAIS:**
```javascript
// ATUAL - context.jsx mistura:
- ✅ Estado global do carrinho (OK)
- ❌ Lógica de negócio (cálculos)
- ❌ Tracking/Analytics (GTM)
- ❌ Persistência (localStorage)
- ❌ UI State (sidebarMounted, menuMounted)
- ❌ Notificações (snackbar)
- ❌ Processamento de cupons
- ❌ URL handling (query params)
```

#### 🪝 **useModalCart.ts FAZ DEMAIS:**
```javascript
// ATUAL - useModalCart.ts mistura:
- ❌ Re-exporta TODO o contexto
- ❌ Estado de UI do modal
- ❌ Lógica de cupons LOCAL
- ❌ Produtos sugeridos
- ❌ Validações duplicadas
- ❌ Tracking duplicado
- ❌ Formatação (freteValue, formatPrice)
```

### 3. **FUNÇÕES NO LUGAR ERRADO**

#### ❌ **Em context.jsx mas deveria estar em outro lugar:**
- `processProdutosComOuSemCupom()` - Ainda está no context!
- `processProdutosRevert()` - Função utility no context
- `addProductEvent()` - Tracking no context
- `notify()` - UI notification no context

#### ❌ **Em useModalCart.ts mas deveria estar em outro lugar:**
- `handleAddCupomLocal()` - Duplica lógica do context
- `removeCoupon()` - Duplica tracking e lógica
- Validação de cupom duplicado

## 📊 **MATRIZ DE RESPONSABILIDADES ATUAL**

| Funcionalidade | context.jsx | useModalCart.ts | Problema |
|---------------|-------------|-----------------|----------|
| Estado Carrinho | ✅ | Re-exporta | Redundância |
| Estado Cupons | ✅ | Re-exporta + Local | Duplicação |
| Cálculos | ✅ | ❌ | OK |
| Tracking | ✅ | ✅ | DUPLICADO |
| Notificações | ✅ | ✅ | DUPLICADO |
| Estado Modal | Parcial | Parcial | DIVIDIDO |
| Produtos Sugeridos | ❌ | ✅ | OK |
| Validações Cupom | ✅ | ✅ | DUPLICADO |
| localStorage | ✅ | ❌ | OK |
| URL params | ✅ | ❌ | Lugar errado |

## 🎯 **COMO DEVERIA SER ORGANIZADO**

### **1. Context (Estado Global Puro)**
```typescript
// context.tsx - APENAS estado global e dispatch
interface CartContext {
  // Estado
  cart: Cart
  cupons: Coupon[]
  total: number
  descontos: number
  
  // Actions (sem lógica)
  dispatch: (action: CartAction) => void
}
```

### **2. Services (Lógica de Negócio)**
```typescript
// cartService.ts
- addProduct()
- removeProduct()
- updateQuantity()
- calculateTotals()

// couponService.ts
- validateCoupon()
- applyCoupon()
- removeCoupon()
- calculateDiscounts()

// trackingService.ts
- trackAddToCart()
- trackRemoveFromCart()
- trackApplyCoupon()
```

### **3. Hooks Especializados**
```typescript
// useCart.ts - Operações do carrinho
- Usa context + cartService
- Retorna apenas o necessário

// useCoupons.ts - Operações de cupons
- Usa context + couponService
- Gerencia validações

// useModalCart.ts - APENAS estado do modal
- Estado UI do modal
- Animações
- Não re-exporta context
```

## 🚨 **PROBLEMAS CRÍTICOS**

### **1. handleAddCupomLocal vs handleAddCupom**
```javascript
// useModalCart/coupon-local.ts
handleAddCupomLocal() {
  // Valida se cupom já existe (DUPLICADO)
  // Chama handleAddCupom do context
  // Mostra notificação (DUPLICADO)
}

// context.jsx via coupon-operations.ts
handleAddCupom() {
  // Valida se cupom já existe (MESMA VALIDAÇÃO)
  // Aplica cupom
  // Mostra notificação (MESMA NOTIFICAÇÃO)
}
```
**❌ DUAS FUNÇÕES FAZEM QUASE A MESMA COISA!**

### **2. Tracking Duplicado**
- `removeCoupon()` em useModalCart faz tracking
- Mas `handleCupom()` no context não faz
- **Inconsistência de tracking!**

### **3. Estado Fragmentado**
```javascript
// Modal state dividido:
context.jsx: sidebarMounted, menuMounted
useModalCart.ts: openCart, forRefreshPage

// Deveria ser:
modalState: {
  isOpen, 
  isAnimating,
  needsRefresh,
  type: 'cart' | 'menu'
}
```

## 📈 **IMPACTO DOS PROBLEMAS**

1. **Manutenção Difícil**: Mudanças precisam ser feitas em múltiplos lugares
2. **Bugs Potenciais**: Lógica duplicada pode ficar dessincronizada
3. **Performance**: Re-renders desnecessários por estado mal organizado
4. **Testabilidade**: Difícil testar lógica misturada com UI
5. **Escalabilidade**: Adicionar features fica cada vez mais complexo

## ✅ **RECOMENDAÇÕES**

### **Refatoração Necessária (Prioridade Alta)**

1. **Eliminar Duplicações**
   - Unificar handleAddCupomLocal e handleAddCupom
   - Centralizar tracking em um service
   - Uma única fonte de notificações

2. **Separar Responsabilidades**
   - Context: apenas estado
   - Services: lógica de negócio
   - Hooks: composição e UI

3. **Consolidar Estado**
   - Todo estado do modal em um lugar
   - Todo estado do carrinho em um lugar
   - Sem fragmentação

### **Estrutura Ideal**
```
src/
├── context/
│   └── CartContext.tsx (estado puro)
├── services/
│   ├── cart.service.ts (lógica carrinho)
│   ├── coupon.service.ts (lógica cupons)
│   └── tracking.service.ts (analytics)
├── hooks/
│   ├── useCart.ts (operações carrinho)
│   ├── useCoupons.ts (operações cupons)
│   └── useModalCart.ts (UI modal apenas)
└── components/
    └── ... (apenas apresentação)
```

## 🔴 **CONCLUSÃO**

**NÃO ESTÃO BEM ORGANIZADOS!** Há:
- **40% de duplicação** de responsabilidades
- **60% de mistura** de concerns
- **Múltiplas fontes da verdade** para mesmos dados
- **Acoplamento desnecessário** entre camadas

A refatoração conservadora melhorou a organização mas **não resolveu os problemas fundamentais** de arquitetura. Uma refatoração mais profunda é necessária para ter uma arquitetura limpa e manutenível.