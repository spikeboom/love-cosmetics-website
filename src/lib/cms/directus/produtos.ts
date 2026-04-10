/**
 * Implementação Directus dos fetches de produtos
 * Retorna dados no mesmo formato do Strapi para manter compatibilidade
 */

import qs from "qs";
import { getDirectusConfig } from "../client";
import type { ProdutoStrapi } from "../types";

// Serializa filtro Directus corretamente usando qs
function buildQs(params: Record<string, any>): string {
  return qs.stringify(params, { encode: true, arrayFormat: "indices", allowDots: false });
}

function appendQuery(url: string, query: string): string {
  if (!url) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${query}`;
}

// Filtro base: status published + backgroundFlags não hidden (inclui nulos)
// Usa _and para evitar conflito entre status e _or no mesmo nível (Directus rejeita isso)
const BASE_FILTER = {
  _and: [
    { status: { _eq: "published" } },
    { _or: [
      { backgroundFlags: { _null: true } },
      { backgroundFlags: { _ncontains: "hide" } },
    ]},
  ],
};

// Remove acentos de uma string
function removeAcentos(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Gera variações de busca para cobrir casos com e sem acento.
// Problema: Directus _icontains não ignora acentos — "mascara" não encontra "Máscara".
// Estratégia: apenas original + sem acento (2 variações por termo, nunca estoura limite do Directus).
function expandirTermoBusca(q: string): string[] {
  const original = q.trim();
  const semAcento = removeAcentos(original).toLowerCase();
  if (original.toLowerCase() === semAcento) return [semAcento]; // já sem acento, só 1
  return [original, semAcento];
}

// Campos a solicitar para queries simples (sem relações)
const SIMPLE_FIELDS = [
  "id",
  "strapi_id",
  "strapi_document_id",
  "nome",
  "slug",
  "preco",
  "preco_de",
  "bling_number",
  "peso_gramas",
  "altura",
  "largura",
  "comprimento",
].join(",");

// Campos a solicitar para queries completas (com relações)
const FULL_FIELDS = [
  "id",
  "strapi_id",
  "strapi_document_id",
  "nome",
  "slug",
  "preco",
  "preco_de",
  "nota",
  "quantidadeResenhas",
  "descricaoResumida",
  "tituloLista",
  "o_que_ele_e",
  "unidade",
  "adesivo",
  "tag_desconto_1",
  "tag_desconto_2",
  "status",
  "backgroundFlags",
  "bling_number",
  "altura",
  "largura",
  "comprimento",
  "peso_gramas",
  // Relações
  "imagens.directus_files_id",
  "breadcrumbs.nome",
  "breadcrumbs.link",
  "listaDescricao.texto",
  "o_que_ele_tem.titulo",
  "o_que_ele_tem.descricao",
  "como_usar_essa_formula.numero",
  "como_usar_essa_formula.texto",
  "duvidas.pergunta",
  "duvidas.texto",
  "resultados.titulo",
  "resultados.descricao",
  "detalhe_notas.titulo",
  "detalhe_notas.descricao",
  "avaliacoes.nome",
  "avaliacoes.nota",
  "avaliacoes.texto",
].join(",");

/**
 * Normaliza um produto do Directus para o formato do Strapi
 * O código existente (transform-produtos-strapi.ts, domain.ts) usa o formato Strapi
 */
function normalizeProduto(p: any, config: ReturnType<typeof getDirectusConfig>) {
  // Imagens: Directus retorna [{directus_files_id: "uuid"}]
  // Strapi retorna [{id, imagem: {url, formats: {medium, thumbnail}}}]
  const carouselImagensPrincipal = (p.imagens || []).map((img: any, i: number) => {
    const fileId = img.directus_files_id;
    const imageUrl = config.getImageUrl(fileId);
    return {
      id: i + 1,
      imagem: {
        id: fileId,
        url: imageUrl,
        formats: {
          // URLs limpas para next/image (ele otimiza por conta, params conflitam)
          xlarge: { url: imageUrl },
          large: { url: imageUrl },
          medium: { url: imageUrl },
          small: { url: imageUrl },
          // thumbnail usa <img> direto, pode ter params do Directus
          thumbnail: { url: appendQuery(imageUrl, "width=200&height=200&fit=cover") },
        },
      },
    };
  });

  // Breadcrumbs
  const breadcrumbItems = (p.breadcrumbs || []).map((bc: any) => ({
    id: bc.id,
    nome: bc.nome,
    link: bc.link,
  }));

  // listaDescricao
  const listaDescricao = (p.listaDescricao || []).map((d: any) => ({
    id: d.id,
    descricao: d.texto,
  }));

  // o_que_ele_tem (ingredientes)
  const o_que_ele_tem = (p.o_que_ele_tem || []).map((ing: any) => ({
    id: ing.id,
    titulo: ing.titulo,
    descricao: ing.descricao,
  }));

  // como_usar_essa_formula
  const como_usar_essa_formula = (p.como_usar_essa_formula || []).map((cu: any) => ({
    id: cu.id,
    numero: cu.numero,
    texto: cu.texto,
  }));

  // duvidas (FAQ)
  const duvidas = (p.duvidas || []).map((faq: any) => ({
    id: faq.id,
    pergunta: faq.pergunta,
    texto: faq.texto,
  }));

  // resultados
  const resultados = (p.resultados || []).map((res: any) => ({
    id: res.id,
    titulo: res.titulo,
    descricao: res.descricao,
  }));

  // detalhe_notas
  const detalhe_notas = (p.detalhe_notas || []).map((nota: any) => ({
    id: nota.id,
    titulo: nota.titulo,
    descricao: nota.descricao,
  }));

  // avaliacoes
  const avaliacoes = (p.avaliacoes || []).map((av: any) => ({
    id: av.id,
    nome: av.nome,
    nota: av.nota,
    texto: av.texto,
  }));

  return {
    // IDs: usar strapi_id para compatibilidade (o código usa id numérico e documentId)
    id: p.strapi_id || p.id,
    documentId: p.strapi_document_id || String(p.id),
    nome: p.nome,
    slug: p.slug,
    preco: p.preco,
    preco_de: p.preco_de,
    nota: p.nota,
    quantidadeResenhas: p.quantidadeResenhas,
    descricaoResumida: p.descricaoResumida,
    tituloLista: p.tituloLista,
    o_que_ele_e: p.o_que_ele_e,
    unidade: p.unidade,
    adesivo: p.adesivo,
    tag_desconto_1: p.tag_desconto_1,
    tag_desconto_2: p.tag_desconto_2,
    backgroundFlags: p.backgroundFlags,
    bling_number: p.bling_number,
    altura: p.altura,
    largura: p.largura,
    comprimento: p.comprimento,
    peso_gramas: p.peso_gramas,
    carouselImagensPrincipal,
    breadcrumbItems,
    listaDescricao,
    o_que_ele_tem,
    como_usar_essa_formula,
    duvidas,
    resultados,
    detalhe_notas,
    avaliacoes,
  };
}

export async function fetchProdutosByIds(ids: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (ids.length === 0) return new Map();

  const numericIds: number[] = [];
  const documentIds: string[] = [];

  for (const id of ids) {
    if (!id) continue;
    const numId = parseInt(id, 10);
    if (!isNaN(numId) && String(numId) === id) {
      numericIds.push(numId);
    } else {
      documentIds.push(id);
    }
  }

  const config = getDirectusConfig();
  const parts: string[] = [];

  if (numericIds.length > 0) {
    parts.push(`filter[strapi_id][_in]=${numericIds.join(",")}`);
  }
  if (documentIds.length > 0) {
    parts.push(`filter[strapi_document_id][_in]=${documentIds.join(",")}`);
  }

  if (parts.length === 0) return new Map();

  const queryParams = `${parts.join("&")}&fields=${SIMPLE_FIELDS}&limit=100`;
  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produtos por ID no Directus");

  const result = await response.json();
  const config2 = getDirectusConfig();
  const produtosMap = new Map<string, ProdutoStrapi>();

  for (const p of result.data || []) {
    const normalized = normalizeProduto(p, config2) as ProdutoStrapi;
    produtosMap.set(String(normalized.id), normalized);
    if (normalized.documentId) produtosMap.set(normalized.documentId, normalized);
  }

  return produtosMap;
}

export async function fetchProdutosByNomes(nomes: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (nomes.length === 0) return new Map();

  const config = getDirectusConfig();
  const filterParts = nomes.map((nome, i) => `filter[_or][${i}][nome][_eq]=${encodeURIComponent(nome)}`);
  const queryParams = `${filterParts.join("&")}&fields=${SIMPLE_FIELDS}&limit=100`;

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) return new Map();

  const result = await response.json();
  const config2 = getDirectusConfig();
  const produtosMap = new Map<string, ProdutoStrapi>();

  for (const p of result.data || []) {
    const normalized = normalizeProduto(p, config2) as ProdutoStrapi;
    produtosMap.set(normalized.nome, normalized);
  }

  return produtosMap;
}

export async function fetchProdutosBySlugs(slugs: string[]): Promise<Map<string, ProdutoStrapi>> {
  if (slugs.length === 0) return new Map();

  const config = getDirectusConfig();
  const filterParts = slugs.map((slug, i) => `filter[_or][${i}][slug][_eq]=${encodeURIComponent(slug)}`);
  const queryParams = `${filterParts.join("&")}&fields=${SIMPLE_FIELDS}&limit=100`;

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produtos por slug no Directus");

  const result = await response.json();
  const config2 = getDirectusConfig();
  const produtosMap = new Map<string, ProdutoStrapi>();

  for (const p of result.data || []) {
    const normalized = normalizeProduto(p, config2) as ProdutoStrapi;
    if (normalized.slug) produtosMap.set(normalized.slug, normalized);
  }

  return produtosMap;
}

// Queries de domínio equivalentes ao domain.ts do Strapi

export async function fetchProdutoBySlug(slug: string): Promise<any> {
  const config = getDirectusConfig();
  const queryParams = `filter[slug][_eq]=${encodeURIComponent(slug)}&filter[status][_eq]=published&fields=${FULL_FIELDS}&limit=1`;

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produto por slug no Directus");

  const result = await response.json();
  const config2 = getDirectusConfig();
  return { data: (result.data || []).map((p: any) => normalizeProduto(p, config2)) };
}

export async function fetchProdutosForHome_Kit(): Promise<any> {
  const config = getDirectusConfig();
  const queryParams = buildQs({
    filter: { _and: [...BASE_FILTER._and, { nome: { _icontains: "Kit" } }] },
    fields: FULL_FIELDS,
    sort: "-sort",
    limit: 100,
  });

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar kits no Directus");

  const result = await response.json();
  const config2 = getDirectusConfig();
  return { data: (result.data || []).map((p: any) => normalizeProduto(p, config2)) };
}

export async function fetchProdutosForHome_NotKit(): Promise<any> {
  const config = getDirectusConfig();
  const queryParams = buildQs({
    filter: { _and: [...BASE_FILTER._and, { nome: { _nicontains: "Kit" } }] },
    fields: FULL_FIELDS,
    sort: "-sort",
    limit: 100,
  });

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produtos no Directus");

  const result = await response.json();
  const config2 = getDirectusConfig();
  return { data: (result.data || []).map((p: any) => normalizeProduto(p, config2)) };
}

export async function fetchProdutosForCarouselPDP(): Promise<any> {
  const config = getDirectusConfig();
  const queryParams = buildQs({
    filter: BASE_FILTER,
    fields: FULL_FIELDS,
    sort: "-sort",
    limit: 100,
  });

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produtos para carousel no Directus");

  const result = await response.json();
  const config2 = getDirectusConfig();
  return { data: (result.data || []).map((p: any) => normalizeProduto(p, config2)) };
}

export async function fetchProdutosSugeridosCarrinho(): Promise<any> {
  const config = getDirectusConfig();
  const queryParams = `filter[status][_eq]=published&filter[backgroundFlags][_contains]=-showInCart&fields=${FULL_FIELDS}&sort=-sort&limit=100`;

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Falha ao buscar produtos sugeridos no Directus");

  const result = await response.json();
  const config2 = getDirectusConfig();
  return { data: (result.data || []).map((p: any) => normalizeProduto(p, config2)) };
}

export async function fetchProdutosForDesign(): Promise<any> {
  return fetchProdutosForCarouselPDP();
}

export async function fetchProdutosForSearch({ q, termos }: { q?: string; termos?: string[] }): Promise<any> {
  const config = getDirectusConfig();

  // Monta variações de termos para cobrir acentos
  let nomeVariações: string[] = [];

  if (termos && termos.length > 0) {
    nomeVariações = termos.flatMap(t => expandirTermoBusca(t));
  } else if (q && q.toLowerCase().includes("rotina-essencial") || q?.toLowerCase().includes("rotina essencial")) {
    nomeVariações = ["kit uso diário", "kit uso diario", "manteiga corporal", "máscara de argila", "mascara de argila"];
  } else if (q && q.trim() !== "") {
    nomeVariações = expandirTermoBusca(q.trim());
  }

  // Constrói filtro como _and para evitar conflito entre status e _or no nível raiz
  let filter: Record<string, any>;

  if (nomeVariações.length === 0) {
    filter = { status: { _eq: "published" } };
  } else if (nomeVariações.length === 1) {
    filter = { _and: [{ status: { _eq: "published" } }, { nome: { _icontains: nomeVariações[0] } }] };
  } else {
    filter = {
      _and: [
        { status: { _eq: "published" } },
        { _or: nomeVariações.map(t => ({ nome: { _icontains: t } })) },
      ],
    };
  }

  const queryParams = buildQs({ filter, fields: FULL_FIELDS, sort: "-sort", limit: 100 });

  const response = await fetch(`${config.baseUrl}/items/produtos?${queryParams}`, {
    headers: config.getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "(sem body)");
    throw new Error(`Falha ao buscar produtos para search no Directus: ${response.status} ${errorBody}`);
  }

  const result = await response.json();
  const config2 = getDirectusConfig();
  return { data: (result.data || []).map((p: any) => normalizeProduto(p, config2)) };
}
