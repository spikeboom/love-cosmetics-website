# 📋 Documentação de Refatoração - Sistema de Carrinho e Cupons

## 🎯 Objetivo
Refatorar o sistema de carrinho e cupons para torná-lo mais simples, mantível e seguro, mantendo a funcionalidade de mostrar preços com desconto aplicado nos produtos.

## 📁 Estrutura da Documentação

1. **[estado-atual.md](./estado-atual.md)** - Como funciona hoje
2. **[problemas-identificados.md](./problemas-identificados.md)** - Lista de problemas e complexidades
3. **[proposta-refatoracao.md](./proposta-refatoracao.md)** - Nova arquitetura proposta
4. **[fluxos/](./fluxos/)** - Diagramas e fluxos detalhados
5. **[codigo-novo/](./codigo-novo/)** - Implementação proposta
6. **[migracao.md](./migracao.md)** - Plano de substituição
7. **[seguranca.md](./seguranca.md)** - Considerações de segurança

## 🔑 Princípios da Refatoração

1. **Segurança First**: Validação server-side sempre
2. **Simplicidade**: Reduzir complexidade desnecessária
3. **Manter UX**: Preços com desconto visíveis
4. **Performance**: Menos processamento redundante
5. **Manutenibilidade**: Código claro e testável

## 📊 Resumo Executivo

### Situação Atual
- 3 fontes de verdade (cookies, localStorage, Context)
- 2 cookies redundantes (`cupom` e `cupomBackend`)
- Processamento duplicado (cliente e servidor)
- Sistema de backup/restore complexo
- ~400+ linhas de código confuso

### Proposta - Reset Completo
- **Limpeza total** de dados antigos (cookies, localStorage)
- 1 fonte de verdade (Context + localStorage novo)
- 0 cookies (usa parâmetros explícitos)
- Validação única server-side
- Estrutura simples de preços (original/current)
- ~200 linhas de código limpo
- **Deploy direto** sem migração gradual

## 🚀 Quick Start

Para entender a refatoração com reset completo, leia os documentos nesta ordem:
1. [Estado Atual](./estado-atual.md)
2. [Problemas](./problemas-identificados.md)  
3. [Proposta](./proposta-refatoracao.md)
4. [Substituição Completa](./migracao.md) - **Estratégia de reset total**