# 🚨 Problemas Identificados no Sistema Atual

## 1. 🍪 Complexidade de Cookies

### Problema
- **2 cookies redundantes**: `cupom` e `cupomBackend` com mesmo valor
- **Métodos inconsistentes**: 
  - `Cookies.set()` para setar
  - `document.cookie` para remover
  - Mistura de bibliotecas

### Impacto
- Dificulta manutenção
- Possíveis bugs de sincronização
- Código confuso

### Código Problemático
```javascript
// Middleware seta DOIS cookies iguais
res.cookies.set("cupom", cupom);
res.cookies.set("cupomBackend", cupom);

// Remove com método diferente
document.cookie = "cupomBackend=; max-age=0";

// Usa biblioteca para setar
Cookies.set("cupomBackend", cupom?.codigo);
```

## 2. 📦 Múltiplas Fontes de Verdade

### Problema
- **3 locais de armazenamento**: Cookies + localStorage + Context
- Sincronização manual entre eles
- Possível dessincronização

### Código Problemático
```javascript
// Três lugares diferentes!
localStorage.setItem("cupons", JSON.stringify(cupons));
Cookies.set("cupomBackend", cupom?.codigo);
setCupons([...cupons, cupom]);
```

## 3. 🔄 Sistema de Backup/Restore Complexo

### Problema
- Salva backup dos preços originais dentro do produto
- Lógica de restauração complexa
- Aumenta tamanho dos dados

### Código Problemático
```javascript
// Backup desnecessário
const backup = {
  preco: p.preco,
  preco_de: p.preco_de
};

// Restauração complexa
const processProdutosRevert = (rawData) => {
  return rawData.map(p => ({
    ...p,
    ...p?.backup,
    backup: p?.backup
  }));
};
```

## 4. 🔀 Processamento Duplicado

### Problema
- Produtos processados no cliente E no servidor
- Lógica duplicada em múltiplos lugares
- Dificulta manutenção

### Locais com Processamento
1. `context.jsx` - handleCupom
2. `context.jsx` - addProductToCart
3. `produto/domain.ts` - processProdutos
4. `useModalCart.ts` - handleAddCupomLocal

## 5. 🧮 Lógica de Desconto Confusa

### Problema
- Condicional complexa baseada em cookie
- Dois tipos de desconto diferentes
- Difícil de entender

### Código Problemático
```javascript
// Lógica confusa
const hasCupomBackend = /(?:^|; )cupomBackend=([^;]+)/.test(document.cookie);
const descontoAplicado = hasCupomBackend
  ? totalDiscountPrecoDe
  : totalDiscount;
```

## 6. 🚫 Limite Artificial de 1 Cupom

### Problema
- Sistema limita a apenas 1 cupom por vez
- Estrutura suporta array mas não usa
- Limitação desnecessária

### Código Problemático
```javascript
if (cupons.length >= 1) {
  notify("Só é possível aplicar um cupom por vez!");
  return;
}
```

## 7. 🔍 Validação Inconsistente

### Problema
- Validação em múltiplos pontos
- Algumas validações no cliente, outras no servidor
- Possível bypass de validações

### Locais de Validação
- `context.jsx` - handleAddCupom (cliente)
- `cupom/domain.ts` - fetchCupom (servidor)
- `produto/domain.ts` - processProdutos (servidor)

## 8. 📡 Múltiplas Chamadas API

### Problema
- Busca cupom no Strapi a cada processamento
- Processamento de produtos faz múltiplas requisições
- Performance ruim

### Código Problemático
```javascript
// Busca cupom toda vez
const dataCookie = meuCookie 
  ? await fetchCupom({ code: meuCookie })
  : null;
```

## 9. 🎭 Middleware Desnecessário

### Problema
- Middleware intercepta URLs apenas para setar cookies
- Adiciona complexidade
- Poderia ser feito no cliente

### Código do Middleware
```javascript
// middleware.ts - complexidade desnecessária
if (cupom) {
  res.cookies.set("cupom", cupom);
  res.cookies.set("cupomBackend", cupom);
  url.searchParams.delete("cupom");
  return res;
}
```

## 10. 💾 Estrutura de Dados Inflada

### Problema
- Produtos carregam dados desnecessários
- Backup duplica informações
- localStorage fica pesado

### Estrutura Atual
```javascript
{
  id: "1",
  preco: 80,
  preco_de: 100,
  backup: {        // Duplicação!
    preco: 100,
    preco_de: 120
  },
  cupom_applied: 0.8
}
```

## 📊 Resumo de Impacto

| Problema | Severidade | Complexidade para Corrigir |
|----------|------------|---------------------------|
| Cookies redundantes | Alta | Baixa |
| Múltiplas fontes de verdade | Alta | Média |
| Backup/Restore | Média | Baixa |
| Processamento duplicado | Alta | Alta |
| Lógica confusa | Alta | Média |
| Limite 1 cupom | Baixa | Baixa |
| Validação inconsistente | Alta | Média |
| Múltiplas APIs | Média | Média |
| Middleware | Média | Baixa |
| Estrutura inflada | Média | Baixa |

## 🎯 Conclusão

O sistema atual funciona mas está **excessivamente complexo** para o que deveria ser uma funcionalidade simples. A refatoração deve focar em:

1. **Eliminar redundâncias** (cookies, processamento)
2. **Simplificar fluxo de dados** (uma fonte de verdade)
3. **Melhorar segurança** (validação server-side)
4. **Reduzir complexidade** (remover backup, middleware)
5. **Otimizar performance** (menos chamadas API)