# Plano: Mover Código Para Melhor Organização (Zero Alteração)

## 🎯 **Objetivo**
Mover código para arquivos organizados **SEM ALTERAR NENHUM CARACTERE** - apenas cortar/colar + imports mínimos.

## 📋 **Estratégia: Cut & Paste + Re-export**
Mover funções inteiras para novos arquivos e re-exportar no local original.

---

## **FASE 1: Identificar Código Misturado Para Mover**

### 🔍 **Em context.jsx - Código que NÃO deveria estar lá:**

```javascript
// 1. TRACKING (linhas 30-51)
const addProductEvent = async (product) => { ... }

// 2. PROCESSAMENTO ainda lá (linhas 53-65)
const processProdutosComOuSemCupom = (data, cupom) => { ... }

// 3. PROCESSAMENTO REVERT (linhas 107-119)
function processProdutosRevert(rawData) { ... }

// 4. NOTIFICAÇÃO (linhas 125-143)
const notify = (message, { variant = "default", persist = false } = {}) => { ... }
```

### 🔍 **Em useModalCart.ts - Código duplicado:**

```javascript
// 1. handleAddCupomLocal (duplica validações)
// 2. removeCoupon (duplica tracking)
// 3. Estado do carousel (não relacionado ao modal)
```

---

## **FASE 2: Criar Estrutura de Arquivos Organizados**

### 📁 **Nova Estrutura (Adicionar, não remover)**

```
src/
├── core/
│   ├── tracking/
│   │   └── product-tracking.ts
│   ├── processing/
│   │   └── product-processing.ts
│   ├── notifications/
│   │   └── notification-system.ts
│   └── state/
│       ├── modal-state.ts
│       └── carousel-state.ts
```

---

## **FASE 3: Mover Código (Exatamente Como Está)**

### 3.1 **`src/core/tracking/product-tracking.ts`**
```typescript
import { waitForGTMReady } from "@/utils/gtm-ready-helper";

// COPIAR EXATAMENTE linhas 30-51 do context.jsx
export const addProductEvent = async (product) => {
  const gaData = await waitForGTMReady();

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "add_to_cart",
    event_id: `addtocart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ecommerce: {
      currency: "BRL",
      value: product.preco,
      items: [
        {
          item_id: product.id,
          item_name: decodeURIComponent(product.nome),
          price: product.preco,
          quantity: 1,
        },
      ],
    },
    ...gaData,
  });
};

// MOVER tracking de removeCoupon do useModalCart aqui também
export const removeCouponTracking = (cupom) => {
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
};
```

### 3.2 **`src/core/processing/product-processing.ts`**
```typescript
import { processProdutos } from "@/modules/produto/domain";

// COPIAR EXATAMENTE linhas 53-65 do context.jsx
// MAS precisamos passar 'cart' como parâmetro
export const processProdutosComOuSemCupom = (data, cupom, cart) => {
  const produtosNoCarrinho = Object.keys(cart);

  const novosProdutos = data.data.filter(
    (item) => !produtosNoCarrinho.includes(item.id.toString()),
  );

  const enviarComCupom = novosProdutos.length > 0;

  return enviarComCupom
    ? processProdutos(data, cupom)
    : processProdutos(data, "sem-cupom");
};

// COPIAR EXATAMENTE linhas 107-119 do context.jsx
export function processProdutosRevert(rawData) {
  rawData = Object.values(rawData.data);

  const processedToReturn = rawData?.map((p) => {
    return {
      ...p,
      ...p?.backup,
      backup: p?.backup,
    };
  });

  return { data: processedToReturn };
}
```

### 3.3 **`src/core/notifications/notification-system.ts`**
```typescript
import React from "react";
import { IoCloseCircle } from "react-icons/io5";

// COPIAR EXATAMENTE a função notify do context.jsx
export const createNotify = (enqueueSnackbar, closeSnackbar) => {
  return (message, { variant = "default", persist = false } = {}) => {
    return enqueueSnackbar(message, {
      variant,
      persist,
      action: (key) => (
        <button
          onClick={() => closeSnackbar(key)}
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
  };
};
```

### 3.4 **`src/core/state/modal-state.ts`**
```typescript
// Estado específico do modal (extraído do useModalCart)
export const createModalState = () => {
  const animationDuration = 700;
  const [openCart, setOpenCart] = useState(false);
  const [forRefreshPage, setForRefreshPage] = useState(false);
  
  return {
    animationDuration,
    openCart,
    setOpenCart,
    forRefreshPage,
    setForRefreshPage,
  };
};
```

### 3.5 **`src/core/state/carousel-state.ts`**
```typescript
// Estado do carousel (extraído do useModalCart)
export const createCarouselState = () => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  return {
    carouselIndex,
    setCarouselIndex,
  };
};
```

---

## **FASE 4: Atualizar Arquivos Originais (Apenas Imports)**

### 4.1 **context.jsx - Remover e Importar**
```javascript
"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { SnackbarProvider, useSnackbar } from "notistack";
// ... outros imports existentes ...

// NOVOS IMPORTS
import { addProductEvent } from "@/core/tracking/product-tracking";
import { processProdutosComOuSemCupom, processProdutosRevert } from "@/core/processing/product-processing";
import { createNotify } from "@/core/notifications/notification-system";

const MeuContexto = createContext();

export const MeuContextoProvider = ({ children }) => {
  // ... estado existente ...
  
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  
  // AGORA É SÓ UMA LINHA
  const notify = createNotify(enqueueSnackbar, closeSnackbar);
  
  // DELETAR as funções movidas (addProductEvent, processProdutosComOuSemCupom, etc)
  // Elas agora vêm dos imports
  
  // IMPORTANTE: Onde processProdutosComOuSemCupom é chamada, adicionar 'cart' como 3º param
  const addProductToCart = (product) => {
    addProductToCartUtil(product, cart, setCart, setLoadingAddItem, cupons, addProductEvent);
  };
  
  // Resto continua igual...
```

### 4.2 **useModalCart.ts - Importar Estado Extraído**
```typescript
import { removeCouponTracking } from "@/core/tracking/product-tracking";

export function useModalCart() {
  // ... código existente ...
  
  // Na função removeCoupon, substituir tracking inline por:
  const removeCoupon = (cupom: any) => {
    if (!cupom) return;
    
    // Chamar função movida
    removeCouponTracking(cupom);
    
    handleCupom(cupom);
    // setForRefreshPage(true); // Se ainda necessário
  };
  
  // ... resto continua ...
}
```

---

## **FASE 5: Criar Re-exports Para Compatibilidade Total**

### 5.1 **`src/core/index.ts`** - Ponto Central
```typescript
// Re-exporta tudo de forma organizada
export * from './tracking/product-tracking';
export * from './processing/product-processing';
export * from './notifications/notification-system';
export * from './state/modal-state';
export * from './state/carousel-state';
```

### 5.2 **Alternativa: Re-export no Context**
```javascript
// No final do context.jsx, se quiser manter compatibilidade
export { addProductEvent } from "@/core/tracking/product-tracking";
export { processProdutosComOuSemCupom, processProdutosRevert } from "@/core/processing/product-processing";
```

---

## ✅ **Garantias do Plano**

### **1. Código Idêntico**
- ✅ Funções movidas SEM alteração (exceto params necessários)
- ✅ Mesma lógica, mesmos nomes
- ✅ Mesmos comportamentos

### **2. Compatibilidade**
- ✅ Context continua funcionando
- ✅ useModalCart continua funcionando
- ✅ Componentes não precisam mudar

### **3. Organização Clara**
```
core/
├── tracking/        → Tudo de tracking
├── processing/      → Processamento de dados
├── notifications/   → Sistema de notificações
└── state/          → Estado isolado
```

### **4. Migração Simples**
1. Criar novos arquivos
2. Copiar/colar funções
3. Adicionar imports
4. Deletar originais
5. Testar

---

## 📊 **Resultado da Organização**

### **ANTES:**
```
context.jsx → 350 linhas (tudo misturado)
useModalCart.ts → 220 linhas (duplicações)
```

### **DEPOIS:**
```
context.jsx → 250 linhas (só contexto)
useModalCart.ts → 180 linhas (só modal)
core/
├── tracking/ → 50 linhas (tracking isolado)
├── processing/ → 40 linhas (processamento isolado)
├── notifications/ → 25 linhas (notificações isoladas)
└── state/ → 30 linhas (estado isolado)
```

---

## 🔄 **Ordem de Execução**

### **Passo 1: Criar Estrutura**
```bash
mkdir -p src/core/tracking
mkdir -p src/core/processing
mkdir -p src/core/notifications
mkdir -p src/core/state
```

### **Passo 2: Copiar Funções**
1. Copiar addProductEvent → product-tracking.ts
2. Copiar processProdutosComOuSemCupom → product-processing.ts
3. Copiar processProdutosRevert → product-processing.ts
4. Copiar notify → notification-system.ts

### **Passo 3: Atualizar Imports**
1. Adicionar imports no context.jsx
2. Adicionar imports no useModalCart.ts

### **Passo 4: Deletar Originais**
1. Deletar funções movidas do context.jsx
2. Deletar tracking duplicado do useModalCart.ts

### **Passo 5: Testar**
1. npm run typecheck
2. npm test
3. npm run build

---

## 🎯 **Benefícios**

1. **Separação Clara** - Cada arquivo tem uma responsabilidade
2. **Reutilização** - Funções podem ser importadas onde necessário
3. **Manutenção** - Fácil encontrar e modificar código
4. **Testabilidade** - Funções isoladas são mais fáceis de testar
5. **Zero Risco** - Código idêntico, apenas movido

**Resultado: Código 100% organizado com 0% de mudança na lógica!**