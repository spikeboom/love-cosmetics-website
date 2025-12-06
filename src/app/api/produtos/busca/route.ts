/**
 * API para buscar produtos no Strapi (autocomplete)
 *
 * GET /api/produtos/busca?q=termo
 *
 * Retorna lista de produtos com: id, nome, preco, imagem
 */

import { NextRequest, NextResponse } from "next/server";
import qs from "qs";

const getBaseURL = () => process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const getToken = () => process.env.STRAPI_API_TOKEN;

export interface ProdutoBuscaResult {
  id: number;
  documentId: string;
  nome: string;
  preco: number;
  preco_de?: number;
  imagem?: string;
  bling_number?: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const termo = searchParams.get("q") || "";

    // Se termo vazio, retorna todos os produtos (para dropdown inicial)
    const filters: any = {
      // Não mostrar produtos ocultos
      $or: [
        { backgroundFlags: { $notContainsi: "hide" } },
        { backgroundFlags: { $null: true } },
      ],
    };

    // Se houver termo de busca, adiciona filtro por nome
    if (termo.trim()) {
      filters.$and = [
        { nome: { $containsi: termo.trim() } },
        filters.$or ? { $or: filters.$or } : {},
      ];
      delete filters.$or;
    }

    const query = qs.stringify(
      {
        filters: termo.trim() ? filters : {
          $or: [
            { backgroundFlags: { $notContainsi: "hide" } },
            { backgroundFlags: { $null: true } },
          ],
        },
        fields: ["id", "documentId", "nome", "preco", "preco_de", "bling_number"],
        populate: {
          carouselImagensPrincipal: {
            populate: {
              imagem: {
                fields: ["url", "formats"],
              },
            },
          },
        },
        sort: ["nome:asc"],
        pagination: {
          pageSize: termo.trim() ? 20 : 100, // Se buscando, limita a 20; senão, pega todos
        },
      },
      { encodeValuesOnly: true }
    );

    const response = await fetch(`${getBaseURL()}/api/produtos?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[Busca Produtos] Erro ao buscar no Strapi:", await response.text());
      return NextResponse.json(
        { error: "Erro ao buscar produtos" },
        { status: 500 }
      );
    }

    const result = await response.json();

    // Formatar resposta
    const produtos: ProdutoBuscaResult[] = (result.data || []).map((p: any) => {
      // Pegar primeira imagem do carousel
      const primeiraImagem = p.carouselImagensPrincipal?.[0]?.imagem;
      // Preferir thumbnail se existir, senão URL original
      const imagemUrl =
        primeiraImagem?.formats?.thumbnail?.url ||
        primeiraImagem?.formats?.small?.url ||
        primeiraImagem?.url ||
        null;

      return {
        id: p.id,
        documentId: p.documentId,
        nome: p.nome,
        preco: p.preco,
        preco_de: p.preco_de || null,
        bling_number: p.bling_number || null,
        // Construir URL completa da imagem
        imagem: imagemUrl
          ? imagemUrl.startsWith("http")
            ? imagemUrl
            : `${getBaseURL()}${imagemUrl}`
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      produtos,
      total: produtos.length,
    });

  } catch (error) {
    console.error("[Busca Produtos] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}
