# Sistema de Versionamento do Carrinho

## Visão Geral

Sistema que permite forçar a limpeza de carrinhos antigos baseado em uma data de corte configurada via variável de ambiente.

## Como Funciona

1. **Metadata do Carrinho**: Cada carrinho armazena `cart_metadata` no localStorage com:
   - `createdAt`: Data de criação do carrinho
   - `version`: Versão do sistema de carrinho

2. **Data de Corte**: Configurada via `.env` com a variável `NEXT_PUBLIC_CART_RESET_DATE`

3. **Verificação Automática**: Na inicialização do app, compara a data de criação do carrinho com a data de corte

## Configuração

### Adicionar no arquivo `.env`

```env
# Data de corte para resetar carrinhos antigos
# Formato: YYYY-MM-DD ou ISO string completa
# Exemplo: Resetar todos os carrinhos criados antes de 3 de outubro de 2025
NEXT_PUBLIC_CART_RESET_DATE=2025-10-03
```

### Exemplos de Uso

#### Desenvolvimento Local (`.env.local`)
```env
# Força reset de carrinhos antigos durante desenvolvimento
NEXT_PUBLIC_CART_RESET_DATE=2025-10-03T00:00:00.000Z
```

#### Staging (`.env.develop`)
```env
# Reset apenas em casos de mudanças breaking
NEXT_PUBLIC_CART_RESET_DATE=2025-10-01
```

#### Produção (`.env.master`)
```env
# Descomente apenas quando necessário fazer reset em produção
# NEXT_PUBLIC_CART_RESET_DATE=2025-10-03
```

## Quando Usar

### ✅ Use quando:
- Mudou a estrutura de dados do carrinho (breaking change)
- Mudou sistema de cupons de forma incompatível
- Precisa limpar carrinhos antigos por problema de dados
- Deploy de nova versão que requer carrinho limpo

### ❌ Não use quando:
- Mudanças compatíveis (adicionar campos opcionais)
- Correções de bugs que não afetam dados
- Deploys normais sem breaking changes

## Comportamento

### Com Data de Corte Configurada
```
Carrinho criado em: 2025-10-01
Data de corte:      2025-10-03
Resultado:          ✅ Carrinho RESETADO (criado antes da data de corte)
```

### Sem Data de Corte
```
Variável não configurada ou vazia
Resultado: ✅ Carrinho MANTIDO (comportamento padrão)
```

## Funções Disponíveis

```typescript
import {
  shouldResetCart,
  resetCartWithMetadata,
  initializeCartMetadata,
  updateCartCreatedDate,
  getCartMetadata
} from '@/utils/cart-version';

// Verificar se precisa resetar
if (shouldResetCart()) {
  resetCartWithMetadata();
}

// Ver metadados do carrinho atual (debug)
const metadata = getCartMetadata();
console.log('Carrinho criado em:', metadata?.createdAt);
```

## Fluxo de Reset

1. Usuário abre o site
2. Sistema verifica `NEXT_PUBLIC_CART_RESET_DATE`
3. Se configurado, compara com `cart_metadata.createdAt`
4. Se carrinho for antigo:
   - Remove `cart`, `cupons`, `cart_metadata` do localStorage
   - Cria novos metadados com data atual
   - Inicializa carrinho vazio
   - Loga no console: "🔄 Carrinho resetado devido à data de corte"

## Testando

### Testar reset localmente:

1. Adicionar produtos ao carrinho
2. Verificar localStorage:
```javascript
localStorage.getItem('cart_metadata')
// {"createdAt":"2025-10-03T20:00:00.000Z","version":"1.0.0"}
```

3. Configurar data de corte FUTURA no `.env.local`:
```env
NEXT_PUBLIC_CART_RESET_DATE=2025-10-04
```

4. Recarregar página → Carrinho mantido

5. Configurar data de corte PASSADA:
```env
NEXT_PUBLIC_CART_RESET_DATE=2025-10-02
```

6. Recarregar página → Carrinho limpo ✅

## Notas Importantes

- A data de corte é verificada **apenas no client-side** (localStorage)
- Use formato ISO ou YYYY-MM-DD para a data
- O reset acontece **automaticamente** na próxima visita do usuário
- Carrinhos criados APÓS o reset terão nova data
- Se remover a variável, o sistema para de resetar

## Histórico de Resets

Para registrar quando foram feitos resets em produção, documente aqui:

| Data | Motivo | Versão |
|------|--------|--------|
| 2025-10-03 | Implementação inicial do sistema | 1.0.0 |
| - | - | - |
