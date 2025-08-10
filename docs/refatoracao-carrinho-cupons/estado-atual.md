# 🔍 Estado Atual do Sistema de Carrinho e Cupons

## 📦 Arquivos Principais

### Frontend
- `src/components/common/Context/context.jsx` - Gerenciamento de estado global
- `src/hooks/useModalCart.ts` - Hook do carrinho
- `src/components/cart/ModalCart/CartSummary.tsx` - Interface de cupons
- `src/app/(global)/checkout/PedidoForm.tsx` - Formulário de checkout

### Backend
- `src/modules/cupom/domain.ts` - Busca cupons no Strapi
- `src/modules/produto/domain.ts` - Processa produtos com cupom
- `src/app/api/pedido/route.ts` - API de criação de pedidos
- `src/middleware.ts` - Intercepta URLs com cupom

### Banco de Dados
- `prisma/schema.prisma` - Schema com cupons[] e descontos

## 🔄 Fluxo Atual Completo

### 1. Entrada de Cupons (3 formas)
```javascript
// Via URL
site.com/?cupom=DESCONTO20

// Via Cookie (middleware.ts)
res.cookies.set("cupom", cupom);
res.cookies.set("cupomBackend", cupom);

// Via Input Manual
<InputBase onChange={(e) => setCupom(e.target.value)} />
```

### 2. Armazenamento (3 locais)
```javascript
// Cookies
document.cookie = "cupomBackend=DESCONTO20"

// LocalStorage
localStorage.setItem("cupons", JSON.stringify([cupomObject]))

// Context React
const [cupons, setCupons] = useState([])
```

### 3. Processamento de Produtos
```javascript
// src/modules/produto/domain.ts
export async function processProdutos(rawData, cupom) {
  // Busca cookie se não passou cupom
  const meuCookie = cupom || cookies().get("cupomBackend")?.value;
  
  // Busca dados do cupom no Strapi
  const dataCookie = meuCookie ? await fetchCupom({ code: meuCookie }) : null;
  
  // Para cada produto
  const processed = rawData.map(p => {
    // Salva backup do preço original
    const backup = {
      preco: p.preco,
      preco_de: p.preco_de
    };
    
    // Aplica desconto
    const preco_multiplicado = p.preco * dataCookie.multiplacar;
    
    return {
      ...p,
      backup,
      cupom_applied: dataCookie.multiplacar,
      preco: preco_multiplicado
    };
  });
}
```

### 4. Gerenciamento no Context
```javascript
// context.jsx - Função handleCupom
const handleCupom = (cupom) => {
  if (cupons.includes(cupom)) {
    // Remove cupom
    setCupons(cupons.filter(c => c !== cupom));
    document.cookie = "cupomBackend=; max-age=0";
    
    // Restaura preços originais do backup
    let cartResult = processProdutosRevert({ data: cart });
    setCart(cartResult);
  } else {
    // Adiciona cupom
    Cookies.set("cupomBackend", cupom?.codigo);
    
    // Processa produtos com desconto
    processProdutos({ data: Object.values(cart) }, cupom?.codigo).then(
      (cartResult) => {
        setCart(cartResult);
        setCupons([...cupons, cupom]);
      }
    );
  }
};
```

### 5. Cálculo de Totais
```javascript
// context.jsx - useEffect para calcular totais
useEffect(() => {
  // Verifica se tem cookie cupomBackend
  const hasCupomBackend = /cupomBackend=([^;]+)/.test(document.cookie);
  
  // Calcula descontos baseado no tipo
  const descontoAplicado = hasCupomBackend
    ? totalDiscountPrecoDe  // Usa preco_de
    : totalDiscount;        // Usa multiplicador
    
  // Total final
  const finalTotal = (hasCupomBackend ? baseTotal : totalWithCupons) + freteValue;
  setTotal(finalTotal);
  
  // Salva no localStorage
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("cupons", JSON.stringify(cupons));
}, [cart, cupons]);
```

### 6. Checkout e Pagamento
```javascript
// PedidoForm.tsx
const handleSubmit = async () => {
  const pedidoData = {
    items: Object.values(cart).map(item => ({
      id: item.id,
      name: item.nome,
      unit_amount: Math.round(item.preco * 100), // Preço já com desconto
      quantity: item.quantity
    })),
    cupons: cupons.map(c => c.codigo),
    descontos: descontos,
    total_pedido: total
  };
  
  await fetch('/api/pedido', { body: JSON.stringify(pedidoData) });
};

// api/pedido/route.ts
const pedido = await prisma.pedido.create({
  data: {
    cupons: body.cupons,      // Array de códigos
    descontos: body.descontos, // Valor total desconto
    items: body.items,         // Items com preço descontado
    total_pedido: body.total_pedido
  }
});

// Envia para PagSeguro
const pagSeguroData = {
  items: body.items,  // Já com unit_amount descontado
  additional_amount: freteValue * 100
};
```

## 🍪 Uso de Cookies

### Cookie `cupom` (temporário)
- **Setado por**: Middleware quando detecta `?cupom=` na URL
- **Lido em**: `context.jsx` linha 329
- **Removido em**: `context.jsx` linha 336 após aplicar

### Cookie `cupomBackend` (sessão)
- **Setado por**: 
  - Middleware (linha 14)
  - Context ao aplicar cupom (linha 175)
- **Lido em**:
  - `produto/domain.ts` linha 31 (server-side)
  - `context.jsx` linha 306 (client-side)
- **Removido em**: `context.jsx` linha 162

## 📊 Tracking Analytics

```javascript
// Aplicar cupom
window.dataLayer.push({
  event: "apply_coupon",
  cupom_codigo: data[0].codigo,
  cupom_nome: data[0].nome,
  ...extractGaSessionData()
});

// Remover cupom
window.dataLayer.push({
  event: "remove_coupon",
  cupom_codigo: cupom.codigo,
  ...extractGaSessionData()
});
```

## 🔢 Estrutura de Dados

### Produto no Carrinho
```javascript
{
  id: "1",
  nome: "Produto Exemplo",
  preco: 80,           // Preço atual (pode ter desconto)
  preco_de: 100,       // Preço original
  quantity: 2,
  backup: {            // Backup para restaurar
    preco: 100,
    preco_de: 120
  },
  cupom_applied: 0.8   // Multiplicador aplicado
}
```

### Cupom do Strapi
```javascript
{
  codigo: "DESCONTO20",
  nome: "Desconto de 20%",
  multiplacar: 0.8,    // Multiplicador (20% off = 0.8)
  diminuir: 0          // Valor fixo a diminuir
}
```