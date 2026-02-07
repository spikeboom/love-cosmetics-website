# Redesign do Resumo da Compra — Novo Layout Figma

**Data:** 2026-02-06
**Autor:** Claude Opus 4.6
**Fontes:** Slides 27-28 da apresentação "Sua ideia vale 1MM", imagem WhatsApp (mockup Figma checkout/pagamento) e transcrição de áudio do Robertinho

---

## 1. Contexto e Decisão de Design

### O que foi decidido (transcrição do áudio)

> "Os descontos concedidos pelo site ficam subentendidos entre o preço DE e o preço POR.
> O cupom aparece caso tenha cupom. E reforçamos o desconto final na tagzinha:
> 'Você vai economizar X valor'."

### Resumo visual da decisão

O novo layout do resumo da compra (visível no mockup do checkout/pagamento) segue esta estrutura:

```
┌─────────────────────────────────────────────┐
│  Produtos          R$ 399,99  R$ 299,99     │
│  Manteiga Corporal Lové Cosméticos          │
│  Manteiga Corporal Lové                     │
│  Manteiga Corporal Lové Cosméticos          │
│  Alterar                                    │
├─────────────────────────────────────────────┤
│  Entrega                         Grátis     │
│  Rua Adriano Jorge, 120. Bloco 02           │
│  Alterar                                    │
├─────────────────────────────────────────────┤
│  Cupom  30% OFF               - R$ 150,00   │
├─────────────────────────────────────────────┤
│  Valor total                   R$ 149,99    │
└─────────────────────────────────────────────┘
  ┌─────────────────────────────────────────┐
  │  ✅ Você vai economizar R$ 250,99       │
  └─────────────────────────────────────────┘
```

**Nota da anotação no slide (balão rosa):**
> "Soma de todos os descontos: Preço DE - Preço Por + Cupom"

---

## 2. Diferenças: Layout Atual vs. Novo Layout

| Aspecto | Layout Atual (código) | Novo Layout (Figma/slides) |
|---|---|---|
| **Linha "Produtos"** | "Produtos (sem descontos)" com `subtotalOriginal` | "Produtos" com preço DE riscado + preço POR ao lado |
| **Descontos de kit/promoção** | Linha "Descontos" separada (acumula tudo) | **Subentendidos** entre preço DE e preço POR (sem linha extra) |
| **Cupom** | Misturado na linha "Descontos" | Linha **própria** "Cupom [X% OFF]" com valor negativo |
| **Tag de economia** | Não existe | **Nova:** "Você vai economizar R$ X" (faixa verde-claro abaixo do total) |
| **Cálculo da economia** | N/A | `Preço DE - Preço POR + Valor do Cupom` = soma de TODOS os descontos |
| **Frete** | Linha com valor ou "Calcule o frete" | Linha com endereço + valor (ou "Grátis" em verde) + "Alterar" |
| **Valor total** | "Total" | "Valor total" |
| **Lista de itens** | Só no pagamento (expandida) | Nomes dos produtos listados dentro da seção "Produtos" |

---

## 3. Onde Aplicar as Mudanças (5 telas)

### 3.1. Cart (`CartSummary.tsx`)

**Arquivo:** `src/app/(figma)/(main)/figma/cart/CartSummary.tsx`

**Mudanças necessárias:**

1. **Linha Produtos:** Trocar "Produtos (sem descontos)" por "Produtos"
   - Mostrar preço DE riscado (subtotalOriginal) + preço POR (subtotal com descontos de kit) lado a lado
   - Listar nomes dos produtos abaixo
2. **Remover a linha "Descontos" genérica** (os descontos de kit ficam subentendidos no preço DE → POR)
3. **Adicionar linha "Cupom"** (somente se houver cupom aplicado)
   - Formato: `Cupom  [X% OFF]    - R$ valor`
   - Texto do cupom em verde/dourado, valor em verde
4. **Trocar "Total" por "Valor total"**
5. **Adicionar tag de economia abaixo do total:**
   - Faixa verde-claro: "Você vai economizar R$ X"
   - Cálculo: `subtotalOriginal - subtotalComDescontosKit + valorCupom`
   - Só exibir se economia > 0

### 3.2. Checkout/Pagamento (`PagamentoResumo.tsx`)

**Arquivo:** `src/app/(figma)/(checkout)/figma/checkout/pagamento/components/PagamentoResumo.tsx`

**Mudanças necessárias:**

1. **Seção Produtos:** Já mostra preço DE riscado + preço POR — manter
   - Confirmar que o header mostra "Produtos" (não "Produtos (sem descontos)")
   - O valor ao lado do título deve ser: preço DE riscado + preço POR
2. **Remover a linha "Descontos" genérica** separada
3. **Linha de Cupom dedicada** (se houver cupom):
   - `Cupom  [X% OFF]    - R$ valor`
4. **"Valor total"** ao invés de "Total"
5. **Tag "Você vai economizar R$ X"** abaixo do resumo, acima do pagamento
6. **Seção Entrega:** Já tem endereço + "Alterar" — manter como está

### 3.3. Checkout/Confirmação (`SuccessState.tsx`)

**Arquivo:** `src/app/(figma)/(checkout)/figma/checkout/confirmacao/components/SuccessState.tsx`

**Mudanças necessárias:**

1. Mesma estrutura do pagamento (Produtos com DE/POR, Cupom separado, etc.)
2. Tag de economia "Você economizou R$ X" (passado, pois já comprou)
3. **Cálculo vem do pedido salvo:** usar `subtotal_produtos`, `total`, `frete`, e dados do cupom

### 3.4. Minha Conta / Detalhes do Pedido (`DetalhesPedidoClient.tsx`)

**Arquivo:** `src/app/(figma)/(main)/figma/minha-conta/pedidos/[id]/DetalhesPedidoClient.tsx`

**Mudanças necessárias:**

1. Mesma estrutura: Produtos com DE/POR, Cupom separado
2. Tag "Você economizou R$ X"
3. Dados vêm do pedido salvo no banco

### 3.5. Admin / Pedidos (`PedidoCard.tsx`)

**Arquivo:** `src/app/(admin)/pedidos/components/PedidoCard.tsx`

**Mudanças necessárias:**

1. No card expandido, seção de itens: manter preço DE/POR por item
2. Adicionar visualização do cupom separado (se aplicado)
3. Mostrar economia total do pedido
4. Admin não precisa da tag de economia visual, mas deve mostrar os valores para conferência

---

## 4. Cálculos Importantes

### 4.1. Subtotal Original (Preço DE)

```
subtotalOriginal = Σ (item.preco_de ?? item.preco) × item.quantity
```

Ou seja, soma dos preços "cheios" / "de vitrine" de cada item.

### 4.2. Subtotal com Desconto (Preço POR, antes do cupom)

```
subtotalPOR = Σ item.preco × item.quantity
             (onde item.preco já inclui desconto de kit, mas NÃO inclui cupom)
```

**Atenção:** Quando há cupom aplicado, `item.preco` já está com cupom. Nesse caso, usar `item.backup.preco` para obter o preço POR sem cupom.

```
subtotalPOR = Σ (item.backup?.preco ?? item.preco) × item.quantity
```

### 4.3. Desconto do Cupom

```
descontoCupom = subtotalPOR - Σ item.preco × item.quantity
             // OU simplesmente o valor retornado pelo contexto/API
```

### 4.4. Economia Total (para a tag)

```
economiaTotal = subtotalOriginal - totalFinal + frete
             // OU de forma mais explícita:
economiaTotal = (subtotalOriginal - subtotalPOR) + descontoCupom
             = descontoKit + descontoCupom
```

Conforme a anotação do slide: **"Preço DE - Preço Por + Cupom"**

---

## 5. Dados Necessários no Pedido (persistência)

Para que as telas de confirmação, minha-conta e admin consigam exibir o novo layout, o pedido salvo no banco precisa conter:

| Campo | Descrição | Já existe? |
|---|---|---|
| `subtotal_produtos` | Soma dos preço DE | Sim |
| `total` | Valor final pago | Sim |
| `frete` / `entrega.valor` | Valor do frete | Sim |
| `cupom_codigo` | Código do cupom | Sim (em `apresentacao.cupons`) |
| `cupom_tipo` | Tipo: "percentual", "fixo" | Verificar |
| `cupom_descricao` | Ex: "30% OFF" | Verificar |
| `cupom_valor` | Valor do desconto do cupom | Verificar |
| `items[].preco_de` | Preço DE de cada item | Sim |
| `items[].preco` | Preço POR de cada item | Sim |
| `items[].desconto_percentual` | % desconto por item | Sim |

**Ação necessária:** Garantir que `cupom_valor` e `cupom_descricao` (tipo "30% OFF") estejam sendo salvos no pedido para que as telas de confirmação/minha-conta possam exibir a linha "Cupom 30% OFF   -R$ 150,00".

---

## 6. Componente Compartilhado (Recomendação)

Atualmente cada tela tem sua própria implementação do resumo. Para manter consistência e facilitar manutenção, **recomenda-se criar um componente compartilhado:**

```
src/components/figma/ResumoCompra.tsx
```

**Props sugeridas:**

```typescript
interface ResumoCompraProps {
  // Produtos
  produtos: {
    nome: string;
    quantidade: number;
    preco: number;       // preço POR (atual)
    preco_de?: number;   // preço DE (riscado)
  }[];
  subtotalOriginal: number;  // soma dos preco_de
  subtotalAtual: number;     // soma dos preco (POR)

  // Entrega
  frete: number;
  enderecoEntrega?: string;
  freteGratis?: boolean;

  // Cupom
  cupom?: {
    codigo: string;
    descricao: string;   // "30% OFF"
    valor: number;       // valor do desconto
  };

  // Total
  totalFinal: number;

  // Configuração
  mostrarLinkAlterar?: boolean;    // true no pagamento
  mostrarListaProdutos?: boolean;  // true em todas as telas
  mostrarTagEconomia?: boolean;    // true no cart, pagamento, confirmação, minha-conta
  textoEconomia?: 'futuro' | 'passado'; // "vai economizar" vs "economizou"
  onAlterarProdutos?: () => void;
  onAlterarEntrega?: () => void;
}
```

---

## 7. Tag de Economia — Especificação Visual

```
┌────────────────────────────────────────────┐
│  ✅  Você vai economizar  R$ 250,99        │
└────────────────────────────────────────────┘
```

- **Fundo:** verde-claro / menta (`#E8F5E9` ou similar ao existente no Figma)
- **Texto:** cinza-escuro, com o valor em **negrito**
- **Ícone:** check-circle verde (ou similar ao do mockup)
- **Posição:** logo abaixo do card de resumo, antes da seção de pagamento
- **Condicional:** só aparece se economia > 0

**Variações de texto:**
- Cart e Pagamento: "Você vai economizar **R$ X**"
- Confirmação e Minha Conta: "Você economizou **R$ X**"

---

## 8. Plano de Implementação (Ordem sugerida)

### Fase 1 — Persistência de dados do cupom
1. Verificar se `cupom_valor` e `cupom_descricao` estão sendo salvos no pedido
2. Se não, ajustar `useCreateOrder.ts` e a API de criação de pedido
3. Ajustar a tipagem do pedido

### Fase 2 — Componente ResumoCompra compartilhado
1. Criar `src/components/figma/ResumoCompra.tsx` com o novo layout
2. Implementar a lógica de cálculo (subtotalOriginal, subtotalPOR, cupom, economia)
3. Implementar a tag de economia
4. Estilizar conforme o mockup do Figma

### Fase 3 — Migrar as 5 telas
1. **Cart** (`CartSummary.tsx`) — usar o novo componente
2. **Checkout/Pagamento** (`PagamentoResumo.tsx`) — usar o novo componente
3. **Checkout/Confirmação** (`SuccessState.tsx`) — usar o novo componente
4. **Minha Conta** (`DetalhesPedidoClient.tsx`) — usar o novo componente
5. **Admin** (`PedidoCard.tsx`) — adaptar (pode ser layout diferente mas mesma lógica)

### Fase 4 — Testes e validação
1. Testar cenários: sem cupom, com cupom %, com cupom fixo, frete grátis, frete pago
2. Testar com kits (que têm desconto embutido no preço)
3. Validar que a economia exibida está correta
4. Testar responsividade (mobile e desktop)

---

## 9. Referências Visuais

### Slide 27 — Resumo atual do carrinho (modelo antigo)
- Produtos (sem descontos): R$ 99,78
- Frete: R$ 21,97
- Descontos: -R$ 29,93
- Total: R$ 91,82

### Slide 28 / Mockup WhatsApp — Novo layout do pagamento
- Produtos: ~~R$ 399,99~~ **R$ 299,99** (preço DE riscado, preço POR em destaque)
- Lista de itens abaixo
- Entrega: Grátis (verde) + endereço
- Cupom 30% OFF: - R$ 150,00
- Valor total: R$ 149,99
- Tag: "Você vai economizar **R$ 250,99**"
- Cálculo: (399,99 - 299,99) + 150,00 = 100,00 + 150,00 = **250,00** ≈ R$ 250,99 (com centavos)

### Nota do balão rosa no slide
> "Soma de todos os descontos: Preço DE - Preço Por + Cupom"
