import { describe, it, expect, vi, beforeEach } from "vitest";

const { fetchAndValidateCupom, fetchProdutosComFallback } = vi.hoisted(() => ({
  fetchAndValidateCupom: vi.fn(),
  fetchProdutosComFallback: vi.fn(),
}));

vi.mock("@/lib/strapi", () => ({
  fetchAndValidateCupom,
  fetchProdutosComFallback,
  PRICE_TOLERANCE: 0.01,
}));

import { POST } from "@/app/api/carrinho/validar/route";

function makeRequest(body: unknown): any {
  return { json: async () => body } as any;
}

const kitCompletoFresco = {
  id: 25,
  documentId: "kit-completo-doc",
  nome: "Kit Completo",
  slug: "kit-completo",
  preco: 273.54,
  peso_gramas: 678,
  altura: 22,
  largura: 12,
  comprimento: 7,
  bling_number: 9999,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/carrinho/validar — campos de dimensão em produtosAtualizados", () => {
  it("retorna peso_gramas/altura/largura/comprimento atuais do CMS", async () => {
    fetchProdutosComFallback.mockResolvedValue(
      new Map([["25", kitCompletoFresco]]),
    );

    const res = await POST(
      makeRequest({
        items: [
          {
            id: "25",
            nome: "Kit Completo",
            preco: 273.54,
            quantity: 1,
          },
        ],
        cupons: [],
      }),
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.produtosAtualizados).toHaveLength(1);
    const atualizado = json.produtosAtualizados[0];
    expect(atualizado.peso_gramas).toBe(678);
    expect(atualizado.altura).toBe(22);
    expect(atualizado.largura).toBe(12);
    expect(atualizado.comprimento).toBe(7);
  });

  it("não inclui bling_number no produtoAtualizado (não é função desta rota)", async () => {
    fetchProdutosComFallback.mockResolvedValue(
      new Map([["25", kitCompletoFresco]]),
    );

    const res = await POST(
      makeRequest({
        items: [{ id: "25", nome: "Kit Completo", preco: 273.54, quantity: 1 }],
        cupons: [],
      }),
    );
    const json = await res.json();
    expect(json.produtosAtualizados[0]).not.toHaveProperty("bling_number");
  });

  it("propaga undefined em peso/dim quando o CMS não tem esses campos", async () => {
    const semDim = { ...kitCompletoFresco };
    delete (semDim as any).peso_gramas;
    delete (semDim as any).altura;
    delete (semDim as any).largura;
    delete (semDim as any).comprimento;
    fetchProdutosComFallback.mockResolvedValue(new Map([["25", semDim]]));

    const res = await POST(
      makeRequest({
        items: [{ id: "25", nome: "Kit Completo", preco: 273.54, quantity: 1 }],
        cupons: [],
      }),
    );
    const json = await res.json();
    const atualizado = json.produtosAtualizados[0];
    expect(atualizado.peso_gramas).toBeUndefined();
    expect(atualizado.altura).toBeUndefined();
    expect(atualizado.largura).toBeUndefined();
    expect(atualizado.comprimento).toBeUndefined();
  });

  it("ainda detecta produto desatualizado quando preco do CMS difere do carrinho", async () => {
    fetchProdutosComFallback.mockResolvedValue(
      new Map([["25", { ...kitCompletoFresco, preco: 300 }]]),
    );

    const res = await POST(
      makeRequest({
        items: [{ id: "25", nome: "Kit Completo", preco: 273.54, quantity: 1 }],
        cupons: [],
      }),
    );
    const json = await res.json();
    expect(json.atualizado).toBe(false);
    expect(json.produtosDesatualizados).toHaveLength(1);
    expect(json.produtosDesatualizados[0].precoAtual).toBeGreaterThan(0);
  });

  it("payload vazio: 200 com listas vazias e atualizado=true", async () => {
    const res = await POST(makeRequest({ items: [], cupons: [] }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.atualizado).toBe(true);
    expect(json.produtosAtualizados).toEqual([]);
    expect(fetchProdutosComFallback).not.toHaveBeenCalled();
  });
});
