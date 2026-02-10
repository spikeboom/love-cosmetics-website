import { getKitDiscount } from './kits';
import { calculateOrderTotals, centsToReais } from './order-totals';

export interface DiscountBadge {
  label: string;  // ex: "15% OFF", "10%"
  type: 'kit' | 'cupom';
}

/**
 * Retorna badges individuais de desconto para um item do carrinho.
 * Em vez de "24% OFF" acumulado, retorna ["15% OFF", "10%"] separados.
 */
export function getItemDiscountBadges(item: any, cupons?: any[]): DiscountBadge[] {
  const badges: DiscountBadge[] = [];

  // 1. Desconto de kit (usa getKitDiscount pelo nome/slug do produto)
  const kitDiscount = getKitDiscount({ nome: item.nome || item.name, slug: item.slug });
  if (kitDiscount) {
    badges.push({ label: kitDiscount.label, type: 'kit' });
  }

  // 2. Desconto de cupom (se o item tem cupom aplicado)
  const temCupomAplicado = !!item.cupom_applied;
  if (temCupomAplicado && cupons && cupons.length > 0) {
    for (const c of cupons) {
      const temPorcentagem = c.multiplacar && c.multiplacar < 1 && c.multiplacar > 0;
      const temValorFixo = c.diminuir && c.diminuir !== 0;
      if (temPorcentagem) {
        const pct = Math.round((1 - c.multiplacar) * 100);
        badges.push({ label: `${pct}% OFF`, type: 'cupom' });
      }
      if (temValorFixo) {
        badges.push({ label: `-R$${Math.abs(c.diminuir).toFixed(2).replace('.', ',')}`, type: 'cupom' });
      }
    }
  }

  // Se nenhum badge identificado mas há desconto real, mostrar o % acumulado
  if (badges.length === 0) {
    const precoAtual = item.preco;
    const precoAntigo = item.preco_de && item.preco_de > precoAtual ? item.preco_de : undefined;

    if (precoAntigo && precoAntigo > precoAtual) {
      const pct = Math.ceil(((precoAntigo - precoAtual) / precoAntigo) * 100);
      badges.push({ label: `${pct}% OFF`, type: 'kit' });
    }
  }

  return badges;
}

/**
 * Retorna badges de desconto para um item de pedido salvo.
 * Usa desconto_percentual salvo e cupom_descricao do pedido.
 */
export function getOrderItemDiscountBadges(
  item: { preco: number; preco_de?: number; desconto_percentual?: number; name?: string; nome?: string },
  cupomDescricao?: string | null,
): DiscountBadge[] {
  const badges: DiscountBadge[] = [];
  const precoAtual = item.preco;

  // Desconto de kit (pelo nome)
  const kitDiscount = getKitDiscount({ nome: item.name || item.nome });
  if (kitDiscount) {
    badges.push({ label: kitDiscount.label, type: 'kit' });
  }

  // Cupom (se temos a descricao do cupom salva)
  if (cupomDescricao) {
    badges.push({ label: `${cupomDescricao} OFF`, type: 'cupom' });
  }

  // Fallback: se nao identificou nenhum badge mas tem desconto
  if (badges.length === 0 && item.preco_de && item.preco_de > precoAtual) {
    const pct = item.desconto_percentual || Math.ceil(((item.preco_de - precoAtual) / item.preco_de) * 100);
    badges.push({ label: `${pct}% OFF`, type: 'kit' });
  }

  return badges;
}

export interface ResumoCompraResult {
  produtosDe: number;     // Preco "De" (riscado) total
  produtosPor: number;    // Preco antes do cupom (= preco base dos items)
  produtosFinal: number;  // Preco final (com cupom aplicado no total)
  descontoSite: number;   // Desconto de kit/promo (produtosDe - produtosPor)
  descontoCupom: number;  // Desconto do cupom (calculado por order-totals)
  totalEconomizado: number; // descontoSite + descontoCupom
}

/**
 * Calcula breakdown de precos a partir de items do carrinho (client-side).
 * Agora item.preco é sempre o preço base (sem cupom). O desconto do cupom
 * é calculado via calculateOrderTotals.
 */
export function calculateCartResumoCompra(cartItems: any[], cupons: any[] = []): ResumoCompraResult {
  let produtosDe = 0;
  let produtosPor = 0;

  for (const item of cartItems) {
    const qty = item.quantity || 1;
    const precoAtual = item.preco; // preço base (sem cupom)

    // produtosDe: preco original (riscado) — somente se > precoAtual
    const unitDe = item.preco_de && item.preco_de > precoAtual
      ? item.preco_de
      : precoAtual;

    produtosDe += unitDe * qty;
    produtosPor += precoAtual * qty; // preço base = produtosPor
  }

  // Calcular desconto do cupom via order-totals
  const totals = calculateOrderTotals({
    items: cartItems.map(item => ({ preco: item.preco, quantity: item.quantity || 1 })),
    cupons,
    frete: 0, // frete não entra no resumo de produtos
  });

  const descontoCupom = centsToReais(totals.couponDiscountCents);
  const produtosFinal = centsToReais(totals.itemsTotalAfterCouponCents);

  const descontoSite = Math.max(0, produtosDe - produtosPor);
  const totalEconomizado = descontoSite + descontoCupom;

  return { produtosDe, produtosPor, produtosFinal, descontoSite, descontoCupom, totalEconomizado };
}

/**
 * Calcula breakdown de precos a partir de um pedido salvo (server-side ou client lendo da API).
 * Usa os campos items[].preco_de, items[].preco e cupom_valor do pedido.
 */
export function calculatePedidoResumoCompra(pedido: {
  items: Array<{ preco: number; preco_de?: number; quantity: number }>;
  subtotal_produtos?: number | null;
  cupom_valor?: number | null;
  total_pedido?: number;
  total?: number;
  frete_calculado?: number;
  frete?: number;
}): ResumoCompraResult {
  // produtosDe: usar subtotal_produtos salvo (soma dos preco_de) ou calcular
  const produtosDe = pedido.subtotal_produtos ?? pedido.items.reduce((acc, item) => {
    const precoBase = item.preco_de && item.preco_de > item.preco ? item.preco_de : item.preco;
    return acc + precoBase * (item.quantity || 1);
  }, 0);

  // soma dos items[].preco salvos
  const somaItemPrecos = pedido.items.reduce((acc, item) => {
    return acc + item.preco * (item.quantity || 1);
  }, 0);

  const descontoCupom = pedido.cupom_valor != null ? pedido.cupom_valor : 0;
  const frete = pedido.frete_calculado ?? pedido.frete ?? 0;
  const totalPedido = pedido.total_pedido ?? pedido.total ?? 0;

  // Heurística para detectar modelo antigo vs novo:
  // Modelo novo: items[].preco = preço base (sem cupom), cupom_valor separado
  //   → somaItemPrecos - cupom_valor + frete ≈ totalPedido
  // Modelo antigo: items[].preco já tem cupom embutido
  //   → somaItemPrecos + frete ≈ totalPedido
  const isModeloNovo = descontoCupom > 0 &&
    Math.abs((somaItemPrecos - descontoCupom + frete) - totalPedido) < 1;

  let produtosPor: number;
  let produtosFinal: number;

  if (isModeloNovo) {
    // Modelo novo: preco é base, cupom aplicado no total
    produtosPor = somaItemPrecos;
    produtosFinal = somaItemPrecos - descontoCupom;
  } else {
    // Modelo antigo: preco já tem cupom embutido
    produtosPor = somaItemPrecos + descontoCupom; // reconstruir preço base
    produtosFinal = somaItemPrecos;
  }

  const descontoSite = Math.max(0, produtosDe - produtosPor);
  const totalEconomizado = descontoSite + descontoCupom;

  return { produtosDe, produtosPor, produtosFinal, descontoSite, descontoCupom, totalEconomizado };
}
