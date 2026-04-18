/**
 * Mega script exploratório da API do Bling.
 *
 * Objetivos:
 *  1. Sondar TODOS os endpoints conhecidos com GET limite=1 para descobrir quais escopos
 *     estão liberados (200 = liberado, 403 insufficient_scope = bloqueado, 404 = inexistente).
 *  2. Para os 4 endpoints relevantes ao DRE (nfe, nfe/{id}, contas/pagar, categorias RD),
 *     fazer exploração profunda e gerar relatório acionável.
 *
 * Uso: node scripts/bling-mega-explore.js
 * Saída:
 *   - stdout (resumo)
 *   - docs/2026-04-18-dre-admin-pedidos/bling-scan-<timestamp>.json (dump completo)
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const BLING_BASE = 'https://api.bling.com.br/Api/v3';
const BLING_TOKEN_URL = 'https://api.bling.com.br/Api/v3/oauth/token';
const BLING_CLIENT_ID = '0fc9335fe026c928d97d7571eca24580ebe72aae';
const BLING_CLIENT_SECRET = '2de51d4c3ac3aff33272c6c4843aaf0027655f6b15ef904bf3b42de65469';

const RATE_DELAY_MS = 400; // 3 req/s oficial, vai de 400ms para margem

// ========================================================================
// Auth
// ========================================================================

async function refreshTokenFlow(prisma, refreshToken) {
  const credentials = Buffer.from(`${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`refresh falhou: ${res.status} ${text}`);
  const data = JSON.parse(text);
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);
  const refreshExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const existing = await prisma.authToken.findFirst({ where: { provider: 'bling' } });
  await prisma.authToken.update({
    where: { id: existing.id },
    data: {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      tokenType: 'Bearer',
      expiresAt,
      refreshExpiresAt,
      clientId: BLING_CLIENT_ID,
      isActive: true,
    },
  });
  return data.access_token;
}

async function getAccessToken() {
  const prisma = new PrismaClient();
  try {
    const token = await prisma.authToken.findFirst({ where: { provider: 'bling' }, orderBy: { createdAt: 'desc' } });
    if (!token) throw new Error('Nenhum AuthToken do Bling no banco');
    const fiveMin = new Date(Date.now() + 5 * 60 * 1000);
    if (token.expiresAt <= fiveMin) {
      console.log(`Token expirado. Renovando...`);
      return await refreshTokenFlow(prisma, token.refreshToken);
    }
    return token.accessToken;
  } finally {
    await prisma.$disconnect();
  }
}

// ========================================================================
// HTTP
// ========================================================================

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callBling(pathWithQuery, accessToken) {
  const url = `${BLING_BASE}${pathWithQuery}`;
  const start = Date.now();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  });
  const ms = Date.now() - start;
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { url, status: res.status, ok: res.ok, ms, body };
}

function classify(result) {
  if (result.ok) return { label: '✅ 200 OK', tag: 'ok' };
  if (result.status === 403) {
    const type = result.body?.error?.type;
    if (type === 'insufficient_scope') return { label: '🔒 403 insufficient_scope', tag: 'no_scope' };
    return { label: `🚫 403 ${type || 'forbidden'}`, tag: 'forbidden' };
  }
  if (result.status === 401) return { label: '🔑 401 invalid_token', tag: 'auth' };
  if (result.status === 404) return { label: '❓ 404 not found', tag: 'not_found' };
  if (result.status === 400) {
    const msg = result.body?.error?.description || result.body?.error?.message || '';
    return { label: `⚠️  400 ${msg.slice(0, 60)}`, tag: 'bad_request' };
  }
  if (result.status === 429) return { label: '🐢 429 rate limit', tag: 'rate_limit' };
  return { label: `❌ ${result.status}`, tag: 'other' };
}

// ========================================================================
// Lista de endpoints para sondar (scope scan)
// Baseada em bling-erp-api-js/src/entities
// ========================================================================

const SCOPE_PROBES = [
  // Finanças
  { group: 'Finanças', path: '/contas/pagar?limite=1' },
  { group: 'Finanças', path: '/contas/receber?limite=1' },
  { group: 'Finanças', path: '/contas-contabeis?limite=1' },
  { group: 'Finanças', path: '/categorias/receitas-despesas?limite=1' },
  { group: 'Finanças', path: '/borderos?limite=1' },
  { group: 'Finanças', path: '/formas-de-pagamento?limite=1' },
  // Fiscal
  { group: 'Fiscal', path: '/nfe?limite=1' },
  { group: 'Fiscal', path: '/nfce?limite=1' },
  { group: 'Fiscal', path: '/nfse?limite=1' },
  { group: 'Fiscal', path: '/naturezas-operacoes?limite=1' },
  // Vendas
  { group: 'Vendas', path: '/pedidos/vendas?limite=1' },
  { group: 'Vendas', path: '/propostas-comerciais?limite=1' },
  { group: 'Vendas', path: '/canais-venda?limite=1' },
  { group: 'Vendas', path: '/vendedores?limite=1' },
  // Compras
  { group: 'Compras', path: '/pedidos/compras?limite=1' },
  // Produtos
  { group: 'Produtos', path: '/produtos?limite=1' },
  { group: 'Produtos', path: '/produtos/variacoes?limite=1' },
  { group: 'Produtos', path: '/produtos/estruturas?limite=1' },
  { group: 'Produtos', path: '/produtos/fornecedores?limite=1' },
  { group: 'Produtos', path: '/produtos/lojas?limite=1' },
  { group: 'Produtos', path: '/categorias/produtos?limite=1' },
  { group: 'Produtos', path: '/categorias/lojas?limite=1' },
  { group: 'Produtos', path: '/grupos-produtos?limite=1' },
  { group: 'Produtos', path: '/campos-customizados?limite=1' },
  // Estoque
  { group: 'Estoque', path: '/estoques?limite=1' },
  { group: 'Estoque', path: '/depositos?limite=1' },
  // Cadastros
  { group: 'Cadastros', path: '/contatos?limite=1' },
  { group: 'Cadastros', path: '/contatos/tipos?limite=1' },
  { group: 'Cadastros', path: '/empresas?limite=1' },
  // Contratos / Recorrência
  { group: 'Contratos', path: '/contratos?limite=1' },
  // Logística
  { group: 'Logística', path: '/logisticas?limite=1' },
  { group: 'Logística', path: '/logisticas/etiquetas?limite=1' },
  { group: 'Logística', path: '/logisticas/objetos?limite=1' },
  { group: 'Logística', path: '/logisticas/remessas?limite=1' },
  { group: 'Logística', path: '/logisticas/servicos?limite=1' },
  // Produção
  { group: 'Produção', path: '/ordens-producao?limite=1' },
  // Sistema
  { group: 'Sistema', path: '/usuarios?limite=1' },
  { group: 'Sistema', path: '/situacoes?limite=1' },
  { group: 'Sistema', path: '/notificacoes?limite=1' },
  { group: 'Sistema', path: '/homologacao?limite=1' },
];

// ========================================================================
// Deep dives DRE
// ========================================================================

function monthRange(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear();
  const m = d.getMonth();
  const ini = new Date(y, m, 1);
  const fim = new Date(y, m + 1, 0);
  const fmt = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  return { inicio: fmt(ini), fim: fmt(fim) };
}

async function exploreNfes(accessToken, report) {
  report.deepDives.nfe = { queries: [] };
  for (let offset = 0; offset >= -3; offset--) {
    const r = monthRange(offset);
    await sleep(RATE_DELAY_MS);
    const result = await callBling(
      `/nfe?tipo=1&situacao=5&dataEmissaoInicial=${r.inicio}&dataEmissaoFinal=${r.fim}&limite=100`,
      accessToken
    );
    const cls = classify(result);
    const count = Array.isArray(result.body?.data) ? result.body.data.length : null;
    const sumValorNota = Array.isArray(result.body?.data)
      ? result.body.data.reduce((s, n) => s + (Number(n.valorNota) || 0), 0)
      : null;
    report.deepDives.nfe.queries.push({
      periodo: r,
      offset,
      status: cls.label,
      count,
      sumValorNota,
      primeirosIds: Array.isArray(result.body?.data) ? result.body.data.slice(0, 3).map((n) => n.id) : null,
    });
  }

  // Busca detalhe de 1 NF (para confirmar shape de itens)
  const firstMesComDados = report.deepDives.nfe.queries.find((q) => q.count > 0);
  if (firstMesComDados) {
    const id = firstMesComDados.primeirosIds[0];
    await sleep(RATE_DELAY_MS);
    const detalhe = await callBling(`/nfe/${id}`, accessToken);
    const itens = detalhe.body?.data?.itens || [];
    report.deepDives.nfe.detalheExemplo = {
      id,
      status: classify(detalhe).label,
      valorNota: detalhe.body?.data?.valorNota,
      valorFrete: detalhe.body?.data?.valorFrete,
      qtdItens: itens.length,
      itens: itens.map((i) => ({
        codigo: i.codigo,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valor: i.valor,
        valorTotal: i.valorTotal,
        gtin: i.gtin,
      })),
    };
  }
}

async function exploreContasPagar(accessToken, report) {
  report.deepDives.contasPagar = { probes: [] };
  const r = monthRange(-3); // últimos 3 meses a partir de -3 até atual → cobre ~4 meses
  const hojeFim = monthRange(0).fim;

  // 1. Sem filtro de data (limite 20, mais recentes)
  await sleep(RATE_DELAY_MS);
  let result = await callBling(`/contas/pagar?limite=20`, accessToken);
  report.deepDives.contasPagar.probes.push({
    query: 'sem_filtro_data',
    status: classify(result).label,
    count: Array.isArray(result.body?.data) ? result.body.data.length : null,
    sample: Array.isArray(result.body?.data) ? result.body.data.slice(0, 3) : result.body,
    keys: Array.isArray(result.body?.data) && result.body.data[0] ? Object.keys(result.body.data[0]) : null,
  });

  // 2. Por dataEmissao
  await sleep(RATE_DELAY_MS);
  result = await callBling(`/contas/pagar?dataEmissaoInicial=${r.inicio}&dataEmissaoFinal=${hojeFim}&limite=20`, accessToken);
  report.deepDives.contasPagar.probes.push({
    query: `dataEmissao ${r.inicio}..${hojeFim}`,
    status: classify(result).label,
    count: Array.isArray(result.body?.data) ? result.body.data.length : null,
  });

  // 3. Por dataVencimento
  await sleep(RATE_DELAY_MS);
  result = await callBling(`/contas/pagar?dataVencimentoInicial=${r.inicio}&dataVencimentoFinal=${hojeFim}&limite=20`, accessToken);
  report.deepDives.contasPagar.probes.push({
    query: `dataVencimento ${r.inicio}..${hojeFim}`,
    status: classify(result).label,
    count: Array.isArray(result.body?.data) ? result.body.data.length : null,
    sample: Array.isArray(result.body?.data) ? result.body.data.slice(0, 3) : null,
  });

  // 4. Por dataPagamento
  await sleep(RATE_DELAY_MS);
  result = await callBling(`/contas/pagar?dataPagamentoInicial=${r.inicio}&dataPagamentoFinal=${hojeFim}&limite=20`, accessToken);
  report.deepDives.contasPagar.probes.push({
    query: `dataPagamento ${r.inicio}..${hojeFim}`,
    status: classify(result).label,
    count: Array.isArray(result.body?.data) ? result.body.data.length : null,
    sample: Array.isArray(result.body?.data) ? result.body.data.slice(0, 3) : null,
  });

  // 5. Detalhe da primeira conta se houver alguma
  const firstProbeComDados = report.deepDives.contasPagar.probes.find((p) => p.count > 0 && p.sample && p.sample[0]);
  if (firstProbeComDados) {
    const id = firstProbeComDados.sample[0].id;
    await sleep(RATE_DELAY_MS);
    const det = await callBling(`/contas/pagar/${id}`, accessToken);
    report.deepDives.contasPagar.detalheExemplo = {
      id,
      status: classify(det).label,
      data: det.body?.data,
    };
  }
}

async function exploreCategoriasRD(accessToken, report) {
  report.deepDives.categoriasRD = {};

  // Busca todas as 62 categorias (paginado)
  const todas = [];
  let page = 1;
  while (true) {
    await sleep(RATE_DELAY_MS);
    const result = await callBling(`/categorias/receitas-despesas?limite=100&pagina=${page}`, accessToken);
    if (!result.ok) {
      report.deepDives.categoriasRD.error = classify(result).label;
      break;
    }
    const list = Array.isArray(result.body?.data) ? result.body.data : [];
    todas.push(...list);
    if (list.length < 100) break;
    page++;
    if (page > 10) break;
  }

  report.deepDives.categoriasRD.total = todas.length;
  report.deepDives.categoriasRD.sample = todas.slice(0, 5);

  // Agrupa por idGrupoDre + tipo
  const porGrupoDre = {};
  for (const c of todas) {
    const key = `idGrupoDre=${c.idGrupoDre ?? 'null'} tipo=${c.tipo}`;
    if (!porGrupoDre[key]) porGrupoDre[key] = { count: 0, exemplos: [] };
    porGrupoDre[key].count++;
    if (porGrupoDre[key].exemplos.length < 5) {
      porGrupoDre[key].exemplos.push({ id: c.id, descricao: c.descricao, idCategoriaPai: c.idCategoriaPai });
    }
  }
  report.deepDives.categoriasRD.porGrupoDre = porGrupoDre;

  // Pega detalhe de 1 categoria para ver se há campos extras (ex.: nome do grupo DRE)
  if (todas[0]) {
    await sleep(RATE_DELAY_MS);
    const det = await callBling(`/categorias/receitas-despesas/${todas[0].id}`, accessToken);
    report.deepDives.categoriasRD.detalheExemplo = {
      id: todas[0].id,
      status: classify(det).label,
      data: det.body?.data,
    };
  }

  // Salva lista completa para análise offline
  report.deepDives.categoriasRD.todas = todas;
}

// ========================================================================
// Main
// ========================================================================

(async () => {
  const accessToken = await getAccessToken();
  console.log('Access token OK. Iniciando exploração...\n');

  const report = {
    runAt: new Date().toISOString(),
    scopeScan: [],
    deepDives: {},
  };

  // --- FASE 1: Scope scan ---
  console.log('=== FASE 1: Scope scan (sondando', SCOPE_PROBES.length, 'endpoints) ===\n');
  for (const probe of SCOPE_PROBES) {
    await sleep(RATE_DELAY_MS);
    const result = await callBling(probe.path, accessToken);
    const cls = classify(result);
    const count = Array.isArray(result.body?.data) ? result.body.data.length : null;
    const entry = {
      group: probe.group,
      path: probe.path,
      status: cls.label,
      tag: cls.tag,
      count,
    };
    report.scopeScan.push(entry);
    console.log(`  [${probe.group.padEnd(11)}] ${cls.label.padEnd(30)} ${probe.path}${count != null ? ` (count=${count})` : ''}`);
  }

  // --- FASE 2: Deep dives DRE ---
  console.log('\n=== FASE 2: Deep dives DRE ===\n');

  console.log('-> /nfe');
  await exploreNfes(accessToken, report);

  console.log('-> /contas/pagar');
  await exploreContasPagar(accessToken, report);

  console.log('-> /categorias/receitas-despesas');
  await exploreCategoriasRD(accessToken, report);

  // --- Resumo ---
  const byTag = {};
  for (const e of report.scopeScan) {
    byTag[e.tag] = (byTag[e.tag] || 0) + 1;
  }
  console.log('\n=== RESUMO SCOPE SCAN ===');
  console.log('  Tags:', byTag);
  console.log('  ✅ Liberados:', report.scopeScan.filter((e) => e.tag === 'ok').map((e) => e.path).join(', '));
  console.log('  🔒 Bloqueados por escopo:', report.scopeScan.filter((e) => e.tag === 'no_scope').map((e) => e.path).join(', ') || 'nenhum');

  console.log('\n=== DEEP DIVE /nfe ===');
  for (const q of report.deepDives.nfe.queries) {
    console.log(`  ${q.periodo.inicio}..${q.periodo.fim} → ${q.status}  count=${q.count}  sumValorNota=R$${(q.sumValorNota ?? 0).toFixed(2)}`);
  }

  console.log('\n=== DEEP DIVE /contas/pagar ===');
  for (const p of report.deepDives.contasPagar.probes) {
    console.log(`  ${p.query.padEnd(40)} → ${p.status}  count=${p.count}`);
  }
  if (report.deepDives.contasPagar.probes[0]?.keys) {
    console.log(`  Campos do registro:`, report.deepDives.contasPagar.probes[0].keys);
  }

  console.log('\n=== DEEP DIVE /categorias/receitas-despesas ===');
  console.log(`  Total: ${report.deepDives.categoriasRD.total}`);
  for (const [key, val] of Object.entries(report.deepDives.categoriasRD.porGrupoDre || {})) {
    console.log(`  ${key.padEnd(30)} count=${val.count}  ex=${val.exemplos.map((e) => e.descricao).slice(0, 3).join(' | ')}`);
  }

  // --- Dump ---
  const outDir = path.join(__dirname, '..', 'docs', '2026-04-18-dre-admin-pedidos');
  fs.mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(outDir, `bling-scan-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nDump completo salvo em: ${path.relative(process.cwd(), outPath)}`);
})().catch((e) => {
  console.error('FALHA GERAL:', e);
  process.exit(1);
});
