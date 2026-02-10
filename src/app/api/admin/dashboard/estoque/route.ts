import { NextResponse } from "next/server";
import { makeAuthenticatedRequest } from "@/lib/bling/simple-auth";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const BLING_API = "https://api.bling.com.br/Api/v3";

interface ProdutoStrapi {
  id: number;
  documentId: string;
  nome: string;
  bling_number?: number;
}

interface BlingEstoqueItem {
  produto: { id: number };
  saldoFisicoTotal: number;
  saldoVirtualTotal: number;
}

export async function GET() {
  try {
    // 1. Buscar todos os produtos do Strapi com bling_number
    const query = qs.stringify(
      {
        filters: { bling_number: { $notNull: true } },
        fields: ["id", "documentId", "nome", "bling_number"],
        pagination: { pageSize: 100 },
      },
      { encodeValuesOnly: true }
    );

    const strapiRes = await fetch(`${STRAPI_URL}/api/produtos?${query}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      console.error("[ESTOQUE] Erro ao buscar produtos do Strapi:", strapiRes.status);
      return NextResponse.json(
        { error: "Erro ao buscar produtos do Strapi" },
        { status: 500 }
      );
    }

    const strapiData = await strapiRes.json();
    const produtos: ProdutoStrapi[] = (strapiData.data || []).filter(
      (p: ProdutoStrapi) => p.bling_number
    );

    console.log("[ESTOQUE] Produtos do Strapi com bling_number:", produtos.map(p => ({ nome: p.nome, bling_number: p.bling_number })));

    if (produtos.length === 0) {
      return NextResponse.json({ estoque: [], message: "Nenhum produto com bling_number encontrado" });
    }

    // 2. Buscar saldos do Bling
    // bling_number pode ser o código (SKU) do produto, não o ID interno.
    // Tentar com ambos: idsProdutos[] e codigos[]
    const blingNumbers = produtos.map((p) => String(p.bling_number));
    console.log("[ESTOQUE] Bling numbers a buscar:", blingNumbers);

    // Bling limita a quantidade por request, fazer em batches de 50
    const BATCH_SIZE = 50;
    const allSaldos: BlingEstoqueItem[] = [];

    for (let i = 0; i < blingNumbers.length; i += BATCH_SIZE) {
      const batch = blingNumbers.slice(i, i + BATCH_SIZE);
      // Tentar com idsProdutos E codigos ao mesmo tempo
      const paramsIds = batch.map((id) => `idsProdutos[]=${id}`).join("&");
      const paramsCodigos = batch.map((c) => `codigos[]=${c}`).join("&");
      const url = `${BLING_API}/estoques/saldos?${paramsIds}&${paramsCodigos}`;

      console.log("[ESTOQUE] Bling URL:", url);

      const blingRes = await makeAuthenticatedRequest(url);

      console.log("[ESTOQUE] Bling response status:", blingRes.status);

      if (!blingRes.ok) {
        const errText = await blingRes.text();
        console.error("[ESTOQUE] Erro Bling:", blingRes.status, errText);

        if (blingRes.status === 403) {
          return NextResponse.json({
            error: "O app do Bling nao tem permissao para acessar estoques. Ative o escopo 'Estoques' no painel do Bling Developer e reautorize o app.",
            scopeError: true,
            estoque: [],
          });
        }
        if (blingRes.status === 401) {
          return NextResponse.json({
            error: "Token do Bling expirado ou invalido. Reautorize o app no Bling.",
            authError: true,
            estoque: [],
          });
        }
        continue;
      }

      const blingData = await blingRes.json();
      console.log("[ESTOQUE] Bling raw response:", JSON.stringify(blingData).slice(0, 1000));

      if (blingData.data) {
        allSaldos.push(...blingData.data);
      }
    }

    console.log("[ESTOQUE] Total saldos do Bling:", allSaldos.length);
    if (allSaldos.length > 0) {
      console.log("[ESTOQUE] Primeiro saldo:", JSON.stringify(allSaldos[0]));
    }

    // 3. Cruzar dados — mapear por ID e por código (string)
    const blingMapById = new Map<number, BlingEstoqueItem>();
    const blingMapByCode = new Map<string, BlingEstoqueItem>();
    for (const item of allSaldos) {
      blingMapById.set(item.produto.id, item);
      // Se o Bling retornar codigo, mapear tambem
      if ((item.produto as any).codigo) {
        blingMapByCode.set(String((item.produto as any).codigo), item);
      }
    }

    console.log("[ESTOQUE] Bling map by ID keys:", [...blingMapById.keys()]);
    console.log("[ESTOQUE] Bling map by code keys:", [...blingMapByCode.keys()]);
    console.log("[ESTOQUE] Strapi bling_numbers:", produtos.map(p => p.bling_number));

    const estoque = produtos.map((prod) => {
      const bn = prod.bling_number!;
      const saldo = blingMapById.get(Number(bn)) || blingMapByCode.get(String(bn));
      return {
        nome: prod.nome,
        bling_number: bn,
        saldoFisico: saldo?.saldoFisicoTotal ?? null,
        saldoVirtual: saldo?.saldoVirtualTotal ?? null,
      };
    });

    // Ordenar: menor estoque primeiro (alerta)
    estoque.sort((a, b) => (a.saldoFisico ?? 999) - (b.saldoFisico ?? 999));

    console.log("[ESTOQUE] Retornando", estoque.length, "produtos, com saldo:", estoque.filter(e => e.saldoFisico !== null).length);

    return NextResponse.json({ estoque });
  } catch (error) {
    console.error("[ESTOQUE] Erro geral:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estoque" },
      { status: 500 }
    );
  }
}
