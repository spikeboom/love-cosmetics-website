# 06 — UX de Erro e Edge Cases

## Resumo

O fluxo de checkout tem boa cobertura para erros de criacao de pedido e pagamento por cartao, mas apresenta falhas criticas em cenarios de carrinho vazio, uso de `alert()` nativo para erros de pagamento, e ausencia de protecao contra duplo clique no botao de selecao de pagamento. A expiracao do PIX nao e tratada funcionalmente (o timer chega a zero mas nada acontece).

## Achados

### [CRITICO] Carrinho vazio permite acesso completo ao checkout ate pagamento

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/identificacao/IdentificacaoPageClient.tsx` (todo o arquivo), `src/app/(figma)/(checkout)/figma/checkout/entrega/EntregaPageClient.tsx:50-61`
- **Problema**: A pagina de identificacao (`/checkout/identificacao`) nao verifica se o carrinho tem itens. O usuario pode acessar diretamente a URL com carrinho vazio, preencher todos os dados, avancar ate a etapa de entrega, e eventualmente tentar criar um pedido com zero itens.
- **Impacto**: Pedido criado com zero produtos; perda de tempo do usuario; possivel erro 500 no backend que nao e tratado com mensagem amigavel.
- **Sugestao**: Adicionar guard de carrinho vazio em `IdentificacaoPageClient` (e idealmente em cada etapa do checkout).

### [CRITICO] `alert()` nativo usado para erros de pagamento (PIX e Cartao)

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:184-186`
- **Problema**: A funcao `handlePaymentError` usa `alert()` do navegador para mostrar erros de pagamento. Isso inclui erros de PIX expirado, cartao recusado, timeout de polling, e erros de rede. O `alert()` pode conter mensagens tecnicas vindas do PagBank. Alem disso, `alert()` bloqueia a thread da UI, quebra a experiencia visual, e nao oferece nenhuma acao contextual ao usuario.
- **Impacto**: Experiencia de usuario muito ruim; mensagens tecnicas expostas; sem opcao de "tentar novamente" ou "voltar" apos o erro; visual inconsistente com o resto do site.
- **Sugestao**: Substituir `alert()` por um state de erro renderizado inline. Criar estado `paymentError` e exibir componente visual com opcoes de acao (tentar novamente, trocar metodo, voltar).

### [CRITICO] Timer do PIX chega a zero sem nenhuma acao

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoPixReal.tsx:104-118`
- **Problema**: O timer de 15 minutos faz countdown ate zero, mas quando `timeLeft` atinge 0, nenhuma acao e tomada. O usuario continua vendo o QR Code e o botao "Copiar codigo Pix" como se ainda fossem validos. O polling continua rodando (ate seu proprio timeout).
- **Impacto**: Usuario tenta pagar com PIX expirado; polling continua consumindo recursos desnecessariamente.
- **Sugestao**: Quando `timeLeft === 0`: (1) parar o polling, (2) desabilitar o botao de copiar, (3) mostrar mensagem "Codigo PIX expirado", (4) oferecer botao "Gerar novo codigo" ou "Voltar para metodos de pagamento".

### [MEDIO] Botao "Finalizar compra" na selecao de pagamento nao desabilita durante loading

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoSelecao.tsx:107-114`
- **Problema**: O botao "Finalizar compra" na tela de selecao de metodo de pagamento nao tem estado `disabled` nem indicador de loading. Quando clicado, ha uma janela de tempo entre o clique e o state update onde cliques multiplos podem disparar multiplas chamadas.
- **Impacto**: Possivel criacao de pedidos duplicados; multiplas requisicoes simultaneas ao backend.
- **Sugestao**: Passar um prop `loading` para `PagamentoSelecao` e desabilitar o botao. Alternativamente, usar um ref `isSubmitting`.

### [MEDIO] Botoes "Continuar" na identificacao e entrega nao desabilitam durante submit

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/identificacao/IdentificacaoPageClient.tsx:117-124`, `src/app/(figma)/(checkout)/figma/checkout/entrega/EntregaPageClient.tsx:424-431`
- **Problema**: Ambos os botoes nao tem propriedade `disabled` e nao mostram loading. A funcao `handleSubmit` faz `syncToServer` que e uma chamada async, mas o botao permanece clicavel.
- **Impacto**: Risco baixo de duplo clique pois a navegacao e rapida, mas `syncToServer` pode ser chamado multiplas vezes.
- **Sugestao**: Adicionar `disabled` ao botao durante o submit e mostrar spinner.

### [MEDIO] Botao "Voltar" do navegador durante pagamento PIX causa perda do pedido

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:36-37`
- **Problema**: Quando o usuario esta na tela de PIX com QR Code gerado, apertar "voltar" no navegador perde o `pedidoId` (armazenado apenas em state React). Ao re-avancar, o codigo tenta criar um novo pedido, potencialmente criando pedido duplicado. O PIX gerado para o pedido anterior continua valido ate expirar.
- **Impacto**: Pedido orfao no banco; PIX pendente que pode ser pago mas ja tem novo pedido criado; confusao do usuario.
- **Sugestao**: Persistir `pedidoId` em `localStorage` ou `sessionStorage`. Ao montar `PagamentoPageClient`, verificar se ja existe pedido pendente e recuperar em vez de criar novo.

### [MEDIO] Formularios validam apenas no submit, nao em tempo real

- **Onde**: `src/hooks/checkout/useIdentificacaoForm.ts:102-123`, `src/app/(figma)/(checkout)/figma/checkout/entrega/EntregaPageClient.tsx:182-211`, `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoCartaoReal.tsx:132-154`
- **Problema**: Todos os tres formularios validam apenas no submit. A unica validacao "em tempo real" e o clear-on-change de erros ja mostrados.
- **Impacto**: Usuario so descobre erros apos clicar "Continuar". Funcional, mas menos fluido.
- **Sugestao**: Implementar validacao onBlur nos campos criticos (CPF, email, CEP, numero do cartao).

### [BAIXO] ErrorState da confirmacao e generico demais

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/confirmacao/components/ErrorState.tsx:1-30`
- **Problema**: A tela de erro da confirmacao mostra apenas "Algo deu errado" sem informacao de contato de suporte, sem o ID do pedido, e sem botao "Tentar novamente".
- **Impacto**: Usuario fica sem saber como resolver.
- **Sugestao**: Adicionar canal de contato do suporte, mostrar o `pedidoId` se disponivel, e botao "Tentar novamente".

### [BAIXO] Mensagens de erro de pagamento podem conter detalhes tecnicos

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:232`, `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoCartaoReal.tsx:291`
- **Problema**: As mensagens de erro vindas dos hooks sao repassadas diretamente para a UI. `{orderError}` pode conter mensagens como `"PRICE_MISMATCH: ..."`.
- **Impacto**: Exposicao de detalhes internos ao usuario.
- **Sugestao**: Mapear codigos de erro para mensagens amigaveis.

### [BAIXO] Tab aberta por horas nao revalida sessao nem precos

- **Onde**: Todos os componentes do checkout
- **Problema**: Se o usuario deixar a tab aberta por horas, nao ha mecanismo de revalidacao. Os precos no carrinho podem ter mudado, cupons podem ter expirado.
- **Impacto**: Usuario avanca todo o checkout com dados stale e so descobre na hora de criar o pedido (PRICE_MISMATCH). Frustrante, mas o backend trata corretamente.
- **Sugestao**: Adicionar listener `visibilitychange` que revalida o carrinho quando a tab volta a ficar visivel apos um periodo.

### [BAIXO] Schema Zod de entrega exige `complemento` como obrigatorio mas UI marca como opcional

- **Onde**: `src/lib/checkout/validation.ts:97` vs `src/app/(figma)/(checkout)/figma/checkout/entrega/EntregaPageClient.tsx:378`
- **Problema**: O schema Zod define `complemento: z.string().min(1, "Complemento e obrigatorio")`, mas a UI mostra o label "Complemento (opcional)".
- **Impacto**: Inconsistencia potencial se o schema for reutilizado server-side.
- **Sugestao**: Alterar o schema Zod para `complemento: z.string().optional()`.

### [BAIXO] Dupla navegacao redundante em botoes de erro

- **Onde**: `src/app/(figma)/(checkout)/figma/checkout/pagamento/PagamentoPageClient.tsx:244-246`
- **Problema**: Os botoes de "Voltar ao carrinho" chamam tanto `router.push()` quanto `window.location.href` para a mesma URL. Isso forca um full reload, causando flash de tela branca.
- **Impacto**: UX menor — flash desnecessario.
- **Sugestao**: Usar apenas `window.location.href` se o objetivo e forcar reload, ou apenas `router.push()` se nao.

## Conclusao

**Status: PARCIALMENTE ADEQUADO para lancamento**

Os tres achados criticos mais importantes sao:
1. Uso de `alert()` para erros de pagamento — substituir por UI inline
2. Timer do PIX que nao toma acao ao expirar
3. Falta de guard de carrinho vazio na entrada do checkout

**Prioridade de correcao sugerida:**
1. (P0) Substituir `alert()` por UI inline de erro de pagamento
2. (P0) Tratar expiracao do timer PIX (desabilitar QR Code, parar polling)
3. (P0) Adicionar guard de carrinho vazio no checkout
4. (P1) Desabilitar botao "Finalizar compra" durante criacao de pedido
5. (P1) Persistir `pedidoId` para sobreviver a navegacao de volta
6. (P2) Corrigir schema Zod de complemento
