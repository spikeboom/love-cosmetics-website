# 📋 Plano de Migração

## 🎯 Estratégia

Migração incremental com feature flags para minimizar riscos e permitir rollback rápido.

## 📅 Fases da Migração

### Fase 1: Preparação (1-2 dias)
- [ ] Criar branch `refactor/cart-coupon-system`
- [ ] Configurar feature flag `USE_NEW_CART_SYSTEM`
- [ ] Criar testes para sistema atual
- [ ] Documentar comportamento atual
- [ ] Backup de dados de produção

### Fase 2: Implementação Base (3-4 dias)
- [ ] Criar novo Context unificado
- [ ] Implementar estrutura de dados simplificada
- [ ] Criar novos hooks (useCart, useCoupon)
- [ ] Implementar nova API de validação
- [ ] Testes unitários do novo sistema

### Fase 3: Migração de Componentes (2-3 dias)
- [ ] Refatorar CartItem com nova estrutura
- [ ] Atualizar CouponInput
- [ ] Migrar ModalCart
- [ ] Atualizar PedidoForm
- [ ] Testes de integração

### Fase 4: Backend Seguro (2-3 dias)
- [ ] Implementar nova API de checkout
- [ ] Validações server-side completas
- [ ] Remover dependência de cookies
- [ ] Testes de segurança
- [ ] Testes de carga

### Fase 5: Testes e Ajustes (2-3 dias)
- [ ] Testes E2E completos
- [ ] Testes com usuários internos
- [ ] Ajustes de performance
- [ ] Correção de bugs
- [ ] Documentação final

### Fase 6: Deploy Gradual (3-5 dias)
- [ ] Deploy para 5% dos usuários
- [ ] Monitorar métricas
- [ ] Deploy para 25% dos usuários
- [ ] Deploy para 50% dos usuários
- [ ] Deploy para 100% dos usuários

### Fase 7: Limpeza (1-2 dias)
- [ ] Remover código antigo
- [ ] Remover feature flags
- [ ] Atualizar documentação
- [ ] Arquivar código legado

## 🔄 Estratégia de Feature Flag

```typescript
// config/features.ts
export const features = {
  USE_NEW_CART_SYSTEM: process.env.NEXT_PUBLIC_NEW_CART === 'true'
};

// hooks/useCart.ts
export function useCart() {
  if (features.USE_NEW_CART_SYSTEM) {
    return useNewCart();
  }
  return useLegacyCart();
}
```

## 📊 Migração de Dados

### localStorage
```javascript
// utils/migrate-storage.ts
export function migrateLocalStorage() {
  const oldCart = localStorage.getItem('cart');
  const oldCoupons = localStorage.getItem('cupons');
  
  if (oldCart || oldCoupons) {
    const migrated = {
      cart: migrateCartStructure(JSON.parse(oldCart || '{}')),
      coupon: migrateCouponStructure(JSON.parse(oldCoupons || '[]'))
    };
    
    localStorage.setItem('cart_v2', JSON.stringify(migrated.cart));
    localStorage.setItem('coupon_v2', JSON.stringify(migrated.coupon));
    
    // Marca como migrado
    localStorage.setItem('cart_migrated', 'true');
  }
}

function migrateCartStructure(oldCart) {
  const newCart = {};
  
  Object.entries(oldCart).forEach(([id, product]) => {
    newCart[id] = {
      id: product.id,
      name: product.nome,
      originalPrice: product.backup?.preco || product.preco_de || product.preco,
      currentPrice: product.preco,
      quantity: product.quantity
    };
  });
  
  return newCart;
}

function migrateCouponStructure(oldCoupons) {
  if (!Array.isArray(oldCoupons) || oldCoupons.length === 0) {
    return null;
  }
  
  const coupon = oldCoupons[0]; // Sistema antigo só suporta 1
  return {
    code: coupon.codigo,
    type: coupon.diminuir > 0 ? 'fixed' : 'percentage',
    value: coupon.diminuir || ((1 - coupon.multiplacar) * 100)
  };
}
```

### Cookies para Context
```javascript
// utils/migrate-cookies.ts
export function migrateCookies() {
  // Lê cookies antigos
  const cupomBackend = getCookie('cupomBackend');
  const cupom = getCookie('cupom');
  
  if (cupomBackend || cupom) {
    const code = cupomBackend || cupom;
    
    // Valida e aplica no novo sistema
    applyCoupon(code);
    
    // Remove cookies antigos
    deleteCookie('cupomBackend');
    deleteCookie('cupom');
  }
}
```

## 🧪 Plano de Testes

### Testes Automatizados
```typescript
// tests/migration.spec.ts
describe('Migração do Sistema de Carrinho', () => {
  it('deve migrar carrinho do formato antigo', () => {
    // Setup: carrinho antigo
    const oldCart = {
      '1': {
        id: '1',
        nome: 'Produto',
        preco: 80,
        preco_de: 100,
        backup: { preco: 100 },
        quantity: 2
      }
    };
    
    // Executa migração
    const newCart = migrateCart(oldCart);
    
    // Verifica
    expect(newCart['1']).toEqual({
      id: '1',
      name: 'Produto',
      originalPrice: 100,
      currentPrice: 80,
      quantity: 2
    });
  });
  
  it('deve manter funcionalidade de cupom', () => {
    // Testa aplicação de cupom
    // Testa remoção de cupom
    // Testa persistência
  });
});
```

### Testes Manuais
- [ ] Adicionar produtos ao carrinho
- [ ] Aplicar cupom via URL
- [ ] Aplicar cupom via input
- [ ] Remover cupom
- [ ] Finalizar compra
- [ ] Navegar entre páginas
- [ ] Fechar e reabrir navegador

## 📈 Métricas de Sucesso

### Performance
- Tempo de carregamento do carrinho < 100ms
- Tempo de aplicação de cupom < 500ms
- Redução de 50% no uso de memória

### Qualidade
- 0 erros críticos em produção
- Cobertura de testes > 80%
- Redução de 70% em bugs reportados

### Negócio
- Taxa de conversão mantida ou melhorada
- Taxa de abandono de carrinho reduzida
- Satisfação do usuário mantida

## 🚨 Plano de Rollback

### Triggers para Rollback
- Taxa de erro > 1%
- Queda na conversão > 5%
- Bugs críticos em produção
- Performance degradada > 20%

### Processo de Rollback
1. Desabilitar feature flag imediatamente
2. Notificar equipe via Slack
3. Reverter deploy se necessário
4. Investigar causa raiz
5. Corrigir e re-testar

```bash
# Rollback rápido via feature flag
curl -X POST https://api.features.com/toggle \
  -d "feature=USE_NEW_CART_SYSTEM&enabled=false"

# Rollback via deploy
git revert --no-commit HEAD~3..HEAD
git commit -m "Rollback: Sistema de carrinho"
git push origin main
```

## 📝 Checklist Pré-Deploy

### Desenvolvimento
- [ ] Código revisado por 2+ desenvolvedores
- [ ] Testes passando (unit, integration, e2e)
- [ ] Sem warnings no console
- [ ] Performance validada
- [ ] Documentação atualizada

### Segurança
- [ ] Validações server-side implementadas
- [ ] Sem exposição de dados sensíveis
- [ ] Rate limiting configurado
- [ ] Logs de auditoria funcionando

### Infraestrutura
- [ ] Feature flags configuradas
- [ ] Monitoramento configurado
- [ ] Alertas configurados
- [ ] Backup de dados realizado
- [ ] Plano de rollback testado

### Negócio
- [ ] Stakeholders informados
- [ ] Equipe de suporte treinada
- [ ] Comunicação preparada
- [ ] Métricas baseline capturadas

## 🎉 Critérios de Sucesso Final

A migração será considerada completa quando:
1. 100% dos usuários no novo sistema
2. Zero bugs críticos por 7 dias
3. Métricas de negócio estáveis ou melhoradas
4. Código antigo removido
5. Documentação completa e atualizada