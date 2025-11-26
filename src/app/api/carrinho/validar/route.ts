import { NextRequest, NextResponse } from "next/server";
import { fetchProdutosComFallback, fetchAndValidateCupom, PRICE_TOLERANCE } from "@/lib/strapi";

interface CartItem {
  id: string;
  documentId?: string;
  nome: string;
  preco: number;
  quantity: number;
}

interface CupomInfo {
  codigo: string;
  multiplacar?: number;
  diminuir?: number;
}

interface ProdutoDesatualizado {
  id: string;
  nome: string;
  precoCarrinho: number;
  precoAtual: number;
  precoAtualComCupom: number;
}

interface CupomDesatualizado {
  codigo: string;
  valido: boolean;
  multiplacar: number;
  diminuir: number;
  erro?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { items, cupons } = await req.json() as { items: CartItem[]; cupons: CupomInfo[] };

    if (!items || items.length === 0) {
      return NextResponse.json({
        atualizado: true,
        produtosDesatualizados: [],
        cuponsDesatualizados: [],
        produtosAtualizados: [],
      });
    }

    // 1. Validar cupons
    let multiplicador = 1;
    let diminuir = 0;
    const cuponsDesatualizados: CupomDesatualizado[] = [];

    for (const cupomInfo of cupons || []) {
      const cupomResult = await fetchAndValidateCupom(cupomInfo.codigo);

      if (!cupomResult.valido || !cupomResult.cupom) {
        cuponsDesatualizados.push({
          codigo: cupomInfo.codigo,
          valido: false,
          multiplacar: 1,
          diminuir: 0,
          erro: cupomResult.erro,
        });
      } else {
        // Verificar se os valores do cupom mudaram
        const multiplacarMudou = cupomInfo.multiplacar !== undefined &&
          Math.abs((cupomInfo.multiplacar || 1) - cupomResult.cupom.multiplacar) > 0.001;
        const diminuirMudou = cupomInfo.diminuir !== undefined &&
          Math.abs((cupomInfo.diminuir || 0) - cupomResult.cupom.diminuir) > PRICE_TOLERANCE;

        if (multiplacarMudou || diminuirMudou) {
          cuponsDesatualizados.push({
            codigo: cupomResult.cupom.codigo,
            valido: true,
            multiplacar: cupomResult.cupom.multiplacar,
            diminuir: cupomResult.cupom.diminuir,
            erro: "Valores do cupom foram alterados",
          });
        }

        multiplicador = cupomResult.cupom.multiplacar;
        diminuir = cupomResult.cupom.diminuir;
      }
    }

    // 2. Buscar produtos (com fallback por nome)
    const itemsParaBusca = items.map(item => ({
      id: item.documentId || item.id,
      documentId: item.documentId,
      nome: item.nome,
    }));
    const produtosReais = await fetchProdutosComFallback(itemsParaBusca);

    // 3. Comparar preços
    const produtosDesatualizados: ProdutoDesatualizado[] = [];
    const produtosAtualizados: Array<{
      id: string;
      documentId: string;
      nome: string;
      precoAtual: number;
      precoComCupom: number;
    }> = [];

    for (const item of items) {
      const key = item.documentId || item.id;
      const produtoReal = produtosReais.get(key);

      if (!produtoReal) {
        produtosDesatualizados.push({
          id: item.id,
          nome: item.nome,
          precoCarrinho: item.preco,
          precoAtual: 0,
          precoAtualComCupom: 0,
        });
        continue;
      }

      const precoAtual = produtoReal.preco;
      const precoAtualComCupom = precoAtual * multiplicador - diminuir;

      if (Math.abs(precoAtualComCupom - item.preco) > PRICE_TOLERANCE) {
        produtosDesatualizados.push({
          id: item.id,
          nome: item.nome,
          precoCarrinho: item.preco,
          precoAtual,
          precoAtualComCupom,
        });
      }

      produtosAtualizados.push({
        id: item.id,
        documentId: produtoReal.documentId,
        nome: produtoReal.nome,
        precoAtual,
        precoComCupom: precoAtualComCupom,
      });
    }

    const atualizado = produtosDesatualizados.length === 0 && cuponsDesatualizados.length === 0;

    return NextResponse.json({
      atualizado,
      produtosDesatualizados,
      cuponsDesatualizados,
      produtosAtualizados,
    });
  } catch (error) {
    console.error("Erro ao validar carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao validar carrinho" },
      { status: 500 }
    );
  }
}
