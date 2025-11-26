# 📋 Plano de Substituição - Reset Completo

## 🎯 Estratégia

**Substituição completa** do sistema - apagar todos os dados antigos e implementar apenas o novo sistema. Abordagem direta sem coexistência ou compatibilidade.

## 📅 Fases da Substituição

### Fase 1: Preparação (1-2 dias)
- [ ] Criar branch `refactor/cart-coupon-system`
- [ ] Criar testes para novo sistema
- [ ] Implementar limpeza automática de dados antigos
- [ ] Comunicar usuários sobre reset de carrinho

### Fase 2: Implementação (3-4 dias)
- [ ] Criar novo Context unificado
- [ ] Implementar estrutura de dados simplificada
- [ ] Criar novos hooks (useCart, useCoupon)
- [ ] Implementar nova API de validação
- [ ] Implementar função de limpeza automática

### Fase 3: Componentes (2-3 dias)
- [ ] Refatorar CartItem com nova estrutura
- [ ] Atualizar CouponInput
- [ ] Refatorar ModalCart
- [ ] Atualizar PedidoForm
- [ ] Testes de integração

### Fase 4: Backend (2-3 dias)
- [ ] Implementar nova API de checkout
- [ ] Validações server-side completas
- [ ] Remover dependência de cookies
- [ ] Testes de segurança

### Fase 5: Testes Finais (1-2 dias)
- [ ] Testes E2E completos
- [ ] Testes de performance
- [ ] Validar limpeza de dados antigos
- [ ] Documentação final

### Fase 6: Deploy (1 dia)
- [ ] Deploy completo para 100% dos usuários
- [ ] Monitorar erros e performance
- [ ] Validar limpeza automática funcionando

### Fase 7: Limpeza (1 dia)
- [ ] Remover código antigo completamente
- [ ] Atualizar documentação
- [ ] Arquivar código legado

## 🧹 Limpeza Automática do Sistema Antigo

```javascript
// utils/cleanup-old-system.ts
export function cleanupOldSystem() {
  try {
    // Remove localStorage antigo
    localStorage.removeItem('cart');
    localStorage.removeItem('cupons');
    
    // Remove cookies antigos
    document.cookie = 'cupomBackend=; path=/; max-age=0';
    document.cookie = 'cupom=; path=/; max-age=0';
    
    // Marca como limpo para não executar novamente
    localStorage.setItem('system_reset_v2', 'true');
    
    console.log('Sistema antigo limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar sistema antigo:', error);
  }
}

// hooks/useCartInit.ts
export function useCartInit() {
  useEffect(() => {
    const isResetDone = localStorage.getItem('system_reset_v2');
    
    if (!isResetDone) {
      cleanupOldSystem();
    }
  }, []);
}
```

## 📢 Comunicação com Usuários

```javascript
// utils/user-notification.ts
export function showResetNotification() {
  const hasShown = localStorage.getItem('reset_notification_shown');
  
  if (!hasShown) {
    // Toast ou modal informando sobre o reset
    toast.info(
      'Atualizamos nosso sistema de carrinho! ' +
      'Seu carrinho foi limpo para garantir a melhor experiência.',
      { duration: 5000 }
    );
    
    localStorage.setItem('reset_notification_shown', 'true');
  }
}
```

## 🧪 Plano de Testes

### Testes Automatizados
```typescript
// tests/cleanup.spec.ts
describe('Limpeza do Sistema Antigo', () => {
  beforeEach(() => {
    // Setup dados antigos
    localStorage.setItem('cart', JSON.stringify({ '1': { id: '1' } }));
    localStorage.setItem('cupons', JSON.stringify([{ codigo: 'TEST' }]));
    document.cookie = 'cupomBackend=TESTE';
    document.cookie = 'cupom=TESTE';
  });
  
  it('deve limpar todos os dados antigos', () => {
    cleanupOldSystem();
    
    // Verifica limpeza
    expect(localStorage.getItem('cart')).toBeNull();
    expect(localStorage.getItem('cupons')).toBeNull();
    expect(document.cookie).not.toContain('cupomBackend');
    expect(document.cookie).not.toContain('cupom');
    expect(localStorage.getItem('system_reset_v2')).toBe('true');
  });
  
  it('deve executar limpeza apenas uma vez', () => {
    localStorage.setItem('system_reset_v2', 'true');
    const spy = jest.spyOn(console, 'log');
    
    cleanupOldSystem();
    
    // Não deve executar novamente
    expect(spy).not.toHaveBeenCalledWith('✅ Sistema antigo limpo com sucesso');
  });
});

// tests/new-cart.spec.ts
describe('Novo Sistema de Carrinho', () => {
  it('deve iniciar com carrinho vazio', () => {
    // Testa estado inicial
  });
  
  it('deve aplicar cupom corretamente', () => {
    // Testa aplicação de cupom
  });
  
  it('deve persistir dados no localStorage', () => {
    // Testa persistência
  });
});
```

### Testes Manuais
- [ ] Verificar limpeza automática ao carregar página
- [ ] Adicionar produtos ao carrinho (novo sistema)
- [ ] Aplicar cupom via URL
- [ ] Aplicar cupom via input
- [ ] Remover cupom
- [ ] Finalizar compra
- [ ] Navegar entre páginas
- [ ] Fechar e reabrir navegador
- [ ] Verificar notificação de reset para usuários

## 📈 Métricas de Sucesso

### Performance
- Tempo de carregamento do carrinho < 100ms
- Tempo de aplicação de cupom < 500ms
- Redução de 50% no uso de memória
- Limpeza automática executada em < 50ms

### Qualidade
- 0 erros críticos em produção
- Cobertura de testes > 80%
- 100% dos dados antigos limpos corretamente
- Redução de 70% em bugs reportados

### Negócio
- Taxa de conversão estável após período de adaptação (1-2 semanas)
- Redução de bugs relacionados a conflitos de dados
- Melhor experiência de usuário no longo prazo

### UX
- Notificação clara sobre reset do sistema
- Facilidade para usuários recriarem carrinhos
- Cupons funcionando perfeitamente no novo sistema

## 🚨 Plano de Contingência

### Cenários Críticos
- Taxa de erro > 2%
- Queda na conversão > 10% por mais de 3 dias
- Bugs que impedem compras
- Falha na limpeza automática causando conflitos

### Processo de Rollback
1. Reverter deploy imediatamente
2. Notificar equipe via Slack
3. Investigar logs de erro
4. Corrigir problemas identificados
5. Re-testar em ambiente de staging
6. Re-deploy após correção

```bash
# Rollback via deploy
git revert --no-commit HEAD~1
git commit -m "Rollback: Reset do sistema de carrinho"
git push origin main
```

## 📝 Checklist Pré-Deploy

### Desenvolvimento
- [ ] Código revisado por 2+ desenvolvedores
- [ ] Testes de limpeza automática passando
- [ ] Testes do novo sistema passando (unit, integration, e2e)
- [ ] Sem warnings no console
- [ ] Performance validada
- [ ] Função de limpeza testada extensivamente

### Segurança
- [ ] Validações server-side implementadas
- [ ] Sem exposição de dados sensíveis
- [ ] Limpeza segura de cookies e localStorage
- [ ] Rate limiting configurado
- [ ] Logs de auditoria funcionando

### UX/Comunicação
- [ ] Notificação de reset implementada
- [ ] Mensagem clara e amigável
- [ ] FAQ atualizado sobre mudanças
- [ ] Equipe de suporte informada sobre reset

### Infraestrutura
- [ ] Monitoramento configurado
- [ ] Alertas para falhas de limpeza
- [ ] Logs para acompanhar limpeza automática
- [ ] Plano de rollback testado

### Negócio
- [ ] Stakeholders informados sobre reset
- [ ] Expectativa de período de adaptação comunicada
- [ ] Métricas baseline capturadas
- [ ] Plano de comunicação executado

## 🎉 Critérios de Sucesso Final

A substituição será considerada completa quando:
1. 100% dos usuários usando novo sistema com dados limpos
2. Limpeza automática funcionando em 100% dos casos
3. Zero bugs críticos por 7 dias
4. Taxa de conversão estabilizada após período de adaptação
5. Código antigo removido completamente
6. Zero conflitos de dados entre sistemas
7. Documentação completa e atualizada