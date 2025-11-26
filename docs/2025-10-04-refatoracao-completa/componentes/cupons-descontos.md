# 🎟️ Sistema de Cupons e Descontos

## Arquitetura Atual

### Fluxo de Cupons
1. **Frontend**: Input do código → Validação → Aplicação
2. **Backend**: Busca no Strapi → Validação → Retorno do multiplicador
3. **Processamento**: Aplicar multiplicador → Atualizar preços → Mostrar economia

## Componentes Envolvidos

### Frontend
- **Context**: `/src/components/common/Context/context.jsx` - `handleCupom()`
- **Modal**: `/src/components/cart/ModalCart/CartSummary.tsx` - UI do cupom
- **Hook**: `/src/hooks/useModalCart.ts` - Lógica de aplicação

### Backend
- **Domain**: `/src/modules/cupom/domain.ts` - `fetchCupom()`
- **Produto**: `/src/modules/produto/domain.ts` - `processProdutos()`
- **API Strapi**: Endpoint de cupons

## Estrutura do Cupom

### No Strapi
```json
{
  "id": 1,
  "codigo": "AJ25",
  "multiplacar": 0.75,    // 0.75 = 25% de desconto
  "descricao": "25% OFF",
  "valido_ate": "2025-12-31",
  "ativo": true,
  "uso_unico": false,
  "valor_minimo": null
}
```

### No Sistema
```javascript
cupom = {
  codigo: "AJ25",
  multiplacar: 0.75
}
```

## Processamento de Desconto

### 1. Aplicação do Cupom
```javascript
// Em processProdutos() - servidor
const multiplicar = cupom.multiplacar || 1;
const preco_multiplicado = produto.preco * multiplicar;

return {
  ...produto,
  preco_de: preco_original,        // Preço sem desconto
  preco: preco_multiplicado,       // Preço com desconto
  tag_desconto_1: `-R$ ${economia}`,
  backup: { ...produto_original }  // Backup para reverter
}
```

### 2. Sistema de Backup
```javascript
// Estrutura com backup
produto = {
  id: "1",
  preco: 74.93,        // Com desconto (99.90 * 0.75)
  preco_de: 99.90,     // Original
  backup: {
    preco: 99.90,
    preco_de: null,
    tag_desconto_1: null
  },
  cupom_applied: 0.75
}
```

### 3. Remoção do Cupom
```javascript
// Restaura do backup
processProdutosRevert(cart) {
  return produto.backup || produto;
}
```

## Cookies e Persistência

### Cookie Backend
```javascript
// Aplicar
Cookies.set("cupomBackend", "AJ25", { path: "/" });

// Remover
document.cookie = "cupomBackend=; path=/; max-age=0";
```

### LocalStorage
```javascript
localStorage.setItem('cupons', JSON.stringify([{
  codigo: "AJ25",
  multiplacar: 0.75
}]));
```

## UI/UX do Cupom

### Estados da Interface
1. **Inicial**: Botão "Adicionar cupom de desconto"
2. **Input Aberto**: Campo de texto + botão "Aplicar"
3. **Aplicado**: Tag com código + botão remover (X)
4. **Erro**: Mensagem de erro + campo permanece

### Componente Visual
```tsx
// Estado inicial
<button onClick={openCoupon}>
  + Adicionar cupom de desconto
</button>

// Input aberto
<div>
  <input 
    placeholder="Digite o código"
    value={couponCode}
  />
  <button onClick={applyCoupon}>Aplicar</button>
</div>

// Cupom aplicado
<div className="coupon-tag">
  <span>AJ25</span>
  <button onClick={removeCoupon}>×</button>
</div>

// Economia mostrada
<div className="savings">
  Você economizou R$ 25,00
</div>
```

## Regras de Negócio

### Validações
1. ✅ Cupom deve existir no Strapi
2. ✅ Cupom deve estar ativo
3. ✅ Data de validade não expirada
4. ✅ Apenas 1 cupom por vez
5. ✅ Cupom afeta todos os produtos

### Cálculos
```javascript
// Desconto individual
produto_com_desconto = produto_original * multiplicador

// Economia total
economia = Σ(produto.preco_original - produto.preco_desconto)

// Percentual
percentual = (1 - multiplicador) * 100 // Ex: 25%
```

## Problemas Conhecidos

### ⚠️ Complexidades Atuais
1. **3 fontes de verdade**: Context, localStorage, cookies
2. **2 cookies redundantes**: `cupom` e `cupomBackend`
3. **Processamento duplicado**: Cliente e servidor
4. **Sistema backup complexo**: Difícil manutenção

### 🔧 Melhorias Sugeridas
1. Validar apenas no servidor
2. Eliminar cookie redundante
3. Simplificar estrutura de backup
4. Unificar fonte de verdade
5. Cache de cupons válidos

## Testes Essenciais

```javascript
// Teste 1: Aplicar cupom válido
applyCoupon("AJ25");
expect(product.preco).toBe(originalPrice * 0.75);

// Teste 2: Cupom inválido
applyCoupon("INVALIDO");
expect(errorMessage).toBe("Cupom inválido");

// Teste 3: Remover cupom
removeCoupon();
expect(product.preco).toBe(originalPrice);

// Teste 4: Persistência
refreshPage();
expect(cupons[0].codigo).toBe("AJ25");

// Teste 5: Cookie backend
expect(document.cookie).toContain("cupomBackend=AJ25");
```

## Analytics

### Eventos GTM
```javascript
// Aplicar cupom
dataLayer.push({
  event: "apply_coupon",
  coupon_code: "AJ25",
  discount_value: 25.00
});

// Remover cupom
dataLayer.push({
  event: "remove_coupon",
  coupon_code: "AJ25"
});
```

## API Reference

### GET Cupom (Strapi)
```http
GET /api/cupons?filters[codigo][$eq]=AJ25
Authorization: Bearer {token}

Response:
{
  "data": [{
    "id": 1,
    "codigo": "AJ25",
    "multiplacar": 0.75
  }]
}
```

### Processar Produtos (Server)
```typescript
processProdutos(products, couponCode) {
  1. Busca cupom no Strapi
  2. Valida cupom
  3. Aplica multiplicador
  4. Retorna produtos processados
}
```

## Checklist de Validação

- [ ] Cupom válido aplica desconto correto
- [ ] Cupom inválido mostra erro
- [ ] Remover cupom restaura preços
- [ ] Desconto aparece no checkout
- [ ] Cookie cupomBackend criado
- [ ] LocalStorage atualizado
- [ ] Eventos GTM disparados
- [ ] Tags de economia visíveis
- [ ] Persistência entre sessões

---

**⚠️ CRÍTICO**: O sistema de cupons afeta diretamente o faturamento. Qualquer mudança deve garantir que:
1. Descontos sejam aplicados corretamente
2. Não seja possível manipular valores
3. Validação sempre ocorra no servidor