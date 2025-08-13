# Plano Ultra-Conservador: Organizar Responsabilidades SEM Mudar Lógica

## 🎯 **Objetivo**
Reorganizar código misturado **mantendo 100% da lógica idêntica** - apenas criar camadas de abstração que chamam o código original.

## 📋 **Estratégia: Wrapper Pattern**
Criar **wrappers/proxies** que organizam o código sem alterar comportamento.

---

## **FASE 1: Criar Service Wrappers (Sem Mover Código)**

### 1.1 `src/services/tracking.service.ts`
```typescript
// NÃO MOVE o código, apenas cria referência
import { MeuContextoProvider } from '@/components/common/Context/context';

export class TrackingService {
  // Wrapper que chama a função original do context
  static async trackAddToCart(product: any, contextInstance: any) {
    // Chama addProductEvent que CONTINUA no context.jsx
    return contextInstance.addProductEvent(product);
  }
  
  static async trackRemoveCoupon(cupom: any) {
    // Copia EXATA do tracking de removeCoupon
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "remove_coupon",
        event_id: `remove_coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cupom_codigo: cupom.codigo,
        cupom_nome: cupom.nome || cupom.codigo,
        cupom_titulo: cupom.titulo || cupom.codigo,
        elemento_clicado: "remove_coupon_button",
        url_pagina: window.location.href,
        ...extractGaSessionData("G-SXLFK0Y830"),
      });
    }
  }
}
```

### 1.2 `src/services/notification.service.ts`
```typescript
// Wrapper para notificações
export class NotificationService {
  private enqueueSnackbar: any;
  private closeSnackbar: any;
  
  constructor(enqueue: any, close: any) {
    this.enqueueSnackbar = enqueue;
    this.closeSnackbar = close;
  }
  
  notify(message: string, options: any = {}) {
    // Copia EXATA da função notify do context
    return this.enqueueSnackbar(message, {
      ...options,
      action: (key) => (
        <button
          onClick={() => this.closeSnackbar(key)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          <IoCloseCircle size={20} />
        </button>
      ),
    });
  }
}
```

### 1.3 `src/services/storage.service.ts`
```typescript
// Wrapper para localStorage
export class StorageService {
  static saveCart(cart: any) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  static loadCart() {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : null;
  }
  
  static saveCoupons(cupons: any) {
    localStorage.setItem("cupons", JSON.stringify(cupons));
  }
  
  static loadCoupons() {
    const cupons = localStorage.getItem("cupons");
    return cupons ? JSON.parse(cupons) : null;
  }
  
  static clearAll() {
    localStorage.removeItem("cart");
    localStorage.removeItem("cupons");
  }
}
```

---

## **FASE 2: Criar State Managers (Sem Alterar Context)**

### 2.1 `src/state/modal-state-manager.ts`
```typescript
// Gerencia estado do modal SEM modificar context
export class ModalStateManager {
  // Referências para o estado original
  private sidebarMounted: boolean;
  private setSidebarMounted: Function;
  private menuMounted: boolean;
  private setMenuMounted: Function;
  
  constructor(context: any) {
    // Apenas aponta para o estado do context
    this.sidebarMounted = context.sidebarMounted;
    this.setSidebarMounted = context.setSidebarMounted;
    this.menuMounted = context.menuMounted;
    this.setMenuMounted = context.setMenuMounted;
  }
  
  // Métodos que chamam os originais
  openSidebar() {
    this.setSidebarMounted(true);
  }
  
  closeSidebar() {
    this.setSidebarMounted(false);
  }
  
  openMenu() {
    this.setMenuMounted(true);
  }
  
  closeMenu() {
    this.setMenuMounted(false);
  }
}
```

### 2.2 `src/state/cart-state-manager.ts`
```typescript
// Wrapper para operações do carrinho
export class CartStateManager {
  private context: any;
  
  constructor(context: any) {
    this.context = context;
  }
  
  // Apenas chama as funções originais
  addProduct(product: any) {
    return this.context.addProductToCart(product);
  }
  
  removeProduct(product: any) {
    return this.context.removeProductFromCart({ product });
  }
  
  updateQuantity(product: any, delta: number) {
    if (delta > 0) {
      return this.context.addQuantityProductToCart({ product });
    } else {
      return this.context.subtractQuantityProductToCart({ product });
    }
  }
  
  clear() {
    return this.context.clearCart();
  }
  
  getState() {
    return {
      cart: this.context.cart,
      total: this.context.total,
      qtdItems: this.context.qtdItemsCart,
    };
  }
}
```

### 2.3 `src/state/coupon-state-manager.ts`
```typescript
// Wrapper para operações de cupom
export class CouponStateManager {
  private context: any;
  private modalHook: any;
  
  constructor(context: any, modalHook?: any) {
    this.context = context;
    this.modalHook = modalHook;
  }
  
  // Chama handleAddCupom original
  async addCoupon(codigo: string) {
    return this.context.handleAddCupom(codigo);
  }
  
  // Chama handleAddCupomLocal se for do modal
  async addCouponLocal(codigo: string) {
    if (this.modalHook) {
      return this.modalHook.handleAddCupomLocal();
    }
    return this.addCoupon(codigo);
  }
  
  // Chama a função apropriada
  removeCoupon(cupom: any) {
    if (this.modalHook?.removeCoupon) {
      return this.modalHook.removeCoupon(cupom);
    }
    return this.context.handleCupom(cupom);
  }
  
  getState() {
    return {
      cupons: this.context.cupons,
      descontos: this.context.descontos,
    };
  }
}
```

---

## **FASE 3: Criar Hooks Organizadores (Sem Quebrar Compatibilidade)**

### 3.1 `src/hooks/organized/useCartOperations.ts`
```typescript
import { useMeuContexto } from '@/components/common/Context/context';
import { CartStateManager } from '@/state/cart-state-manager';

export function useCartOperations() {
  const context = useMeuContexto();
  const manager = new CartStateManager(context);
  
  // Retorna EXATAMENTE as mesmas funções
  return {
    // Estado (referência direta)
    cart: context.cart,
    total: context.total,
    qtdItemsCart: context.qtdItemsCart,
    loadingAddItem: context.loadingAddItem,
    
    // Operações (wrappers que chamam originais)
    addProductToCart: (product) => manager.addProduct(product),
    removeProductFromCart: (product) => manager.removeProduct(product),
    addQuantityProductToCart: ({ product }) => context.addQuantityProductToCart({ product }),
    subtractQuantityProductToCart: ({ product }) => context.subtractQuantityProductToCart({ product }),
    clearCart: () => manager.clear(),
  };
}
```

### 3.2 `src/hooks/organized/useCouponOperations.ts`
```typescript
import { useMeuContexto } from '@/components/common/Context/context';
import { CouponStateManager } from '@/state/coupon-state-manager';

export function useCouponOperations() {
  const context = useMeuContexto();
  const manager = new CouponStateManager(context);
  
  return {
    // Estado
    cupons: context.cupons,
    descontos: context.descontos,
    
    // Operações (chamam originais)
    handleAddCupom: (codigo) => manager.addCoupon(codigo),
    handleCupom: (cupom) => context.handleCupom(cupom),
  };
}
```

### 3.3 `src/hooks/organized/useModalOperations.ts`
```typescript
import { useMeuContexto } from '@/components/common/Context/context';
import { ModalStateManager } from '@/state/modal-state-manager';

export function useModalOperations() {
  const context = useMeuContexto();
  const manager = new ModalStateManager(context);
  
  return {
    // Estado
    sidebarMounted: context.sidebarMounted,
    menuMounted: context.menuMounted,
    
    // Operações organizadas
    openSidebar: () => manager.openSidebar(),
    closeSidebar: () => manager.closeSidebar(),
    openMenu: () => manager.openMenu(),
    closeMenu: () => manager.closeMenu(),
    
    // Compatibilidade total
    setSidebarMounted: context.setSidebarMounted,
    setMenuMounted: context.setMenuMounted,
  };
}
```

---

## **FASE 4: Atualizar Imports Gradualmente (Opcional)**

### 4.1 Criar Aliases Compatíveis
```typescript
// src/hooks/index.ts - Ponto central de importação
export { useMeuContexto } from '@/components/common/Context/context';
export { useModalCart } from '@/hooks/useModalCart';

// Novos hooks organizados (opcionais)
export { useCartOperations } from './organized/useCartOperations';
export { useCouponOperations } from './organized/useCouponOperations';
export { useModalOperations } from './organized/useModalOperations';
```

### 4.2 Migration Helper
```typescript
// src/hooks/useMigrationHelper.ts
import { useMeuContexto } from '@/components/common/Context/context';
import { useCartOperations } from './organized/useCartOperations';
import { useCouponOperations } from './organized/useCouponOperations';
import { useModalOperations } from './organized/useModalOperations';

export function useOrganizedContext() {
  const original = useMeuContexto();
  const cart = useCartOperations();
  const coupon = useCouponOperations();
  const modal = useModalOperations();
  
  // Retorna TUDO, mantendo 100% compatibilidade
  return {
    ...original, // Tudo original
    // Organizados por categoria (opcional)
    organized: {
      cart,
      coupon,
      modal,
    }
  };
}
```

---

## **FASE 5: Documentar Responsabilidades (Sem Mudar Código)**

### 5.1 `src/docs/ARCHITECTURE.md`
```markdown
# Arquitetura do Sistema

## Camadas de Responsabilidade

### 1. Context (Original - Não Modificado)
- Local: `src/components/common/Context/context.jsx`
- Mantém: Todo código original intacto
- Status: Preservado 100%

### 2. Services (Wrappers)
- `tracking.service.ts` - Wrapper para tracking
- `notification.service.ts` - Wrapper para notificações
- `storage.service.ts` - Wrapper para localStorage

### 3. State Managers (Organizadores)
- `cart-state-manager.ts` - Organiza operações do carrinho
- `coupon-state-manager.ts` - Organiza operações de cupom
- `modal-state-manager.ts` - Organiza estado do modal

### 4. Hooks Organizados (Opcionais)
- `useCartOperations` - Interface limpa para carrinho
- `useCouponOperations` - Interface limpa para cupons
- `useModalOperations` - Interface limpa para modal

## Migração
- Fase 1: Usar hooks originais (sem mudança)
- Fase 2: Importar hooks organizados (opcional)
- Fase 3: Migrar gradualmente (quando conveniente)
```

---

## ✅ **Garantias do Plano Ultra-Conservador**

### **1. Zero Mudança de Lógica**
- ✅ Nenhuma linha de código original é modificada
- ✅ Todas as funções originais continuam existindo
- ✅ Mesmos nomes, mesmas assinaturas
- ✅ Mesmos comportamentos

### **2. Zero Breaking Changes**
- ✅ Código existente continua funcionando
- ✅ Imports existentes continuam válidos
- ✅ Props e interfaces idênticas
- ✅ Testes continuam passando

### **3. Organização Sem Risco**
- ✅ Wrappers apenas chamam originais
- ✅ State Managers são proxies
- ✅ Services são referências
- ✅ Hooks são aliases

### **4. Migração Opcional**
- ✅ Pode usar código original sempre
- ✅ Pode usar organizado quando quiser
- ✅ Pode misturar ambos
- ✅ Pode reverter a qualquer momento

---

## 📊 **Benefícios Mesmo Sendo Ultra-Conservador**

1. **Documentação de Responsabilidades**
   - Fica claro o que cada parte faz
   - Facilita entendimento do código

2. **Interface Organizada (Opcional)**
   - Desenvolvedores podem escolher usar interface limpa
   - Ou continuar com a original

3. **Preparação para Refatoração Futura**
   - Código organizado conceitualmente
   - Facilita refatoração real no futuro

4. **Zero Risco**
   - Nada quebra
   - Nada muda
   - Apenas adiciona organização opcional

---

## 🔄 **Ordem de Implementação Segura**

### **Semana 1: Criar Wrappers**
1. Criar services (sem usar)
2. Criar state managers (sem usar)
3. Testar que nada quebrou

### **Semana 2: Criar Hooks Organizados**
1. Criar hooks organizados
2. Testar em componente isolado
3. Verificar compatibilidade

### **Semana 3: Documentar**
1. Documentar arquitetura
2. Criar exemplos de uso
3. Treinar equipe (opcional)

### **Futuro: Migração Gradual (Opcional)**
1. Novos componentes usam interface organizada
2. Componentes antigos migram quando conveniente
3. Ou nunca migram (também OK)

---

## 🎯 **Resultado Final**

```typescript
// ANTES: Tudo misturado
const context = useMeuContexto();
context.addProductToCart(product); // Não sei onde está a lógica

// DEPOIS: Organizado (mas opcional)
const cart = useCartOperations();
cart.addProductToCart(product); // Sei que é operação de carrinho

// MAS AINDA FUNCIONA:
const context = useMeuContexto();
context.addProductToCart(product); // Continua funcionando!
```

**100% Organizado, 0% Risco!**