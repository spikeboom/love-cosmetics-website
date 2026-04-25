/**
 * Script de teste: verifica se a API do Bling retorna os dados necessários
 * para o DRE e se os endpoints estão habilitados para nossa aplicação.
 *
 * Endpoints testados:
 *  - GET /nfe                         (notas fiscais de saída)
 *  - GET /nfe/{id}                    (itens da NF)
 *  - GET /contas/pagar                (despesas)
 *  - GET /categorias/receitas-despesas (classificação das despesas)
 *
 * Uso: node scripts/test-bling-dre-endpoints.js
 */

const { PrismaClient } = require('@prisma/client');

const BLING_BASE = 'https://api.bling.com.br/Api/v3';
const BLING_TOKEN_URL = 'https://api.bling.com.br/Api/v3/oauth/token';
const BLING_CLIENT_ID = '0fc9335fe026c928d97d7571eca24580ebe72aae';
const BLING_CLIENT_SECRET = '2de51d4c3ac3aff33272c6c4843aaf0027655f6b15ef904bf3b42de65469';

async function refreshTokenFlow(prisma, refreshToken) {
  const credentials = Buffer.from(`${BLING_CLIENT_ID}:${BLING_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(BLING_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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
  return { accessToken: data.access_token, expiresAt };
}

async function getToken() {
  const prisma = new PrismaClient();
  try {
    const token = await prisma.authToken.findFirst({
      where: { provider: 'bling' },
      orderBy: { createdAt: 'desc' },
    });
    if (!token) throw new Error('Nenhum AuthToken do Bling encontrado no banco');
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    const expired = token.expiresAt <= fiveMinutesFromNow;
    if (expired) {
      if (!token.refreshToken) throw new Error('Token expirado e sem refresh_token');
      if (token.refreshExpiresAt && token.refreshExpiresAt <= new Date()) {
        throw new Error('Refresh token também expirou — precisa refazer OAuth via /bling-auth');
      }
      console.log(`Token expirado em ${token.expiresAt.toISOString()}. Renovando via refresh_token...`);
      const fresh = await refreshTokenFlow(prisma, token.refreshToken);
      console.log(`✅ Novo access_token válido até ${fresh.expiresAt.toISOString()}`);
      return { accessToken: fresh.accessToken, expired: false, expiresAt: fresh.expiresAt };
    }
    return { accessToken: token.accessToken, expired: false, expiresAt: token.expiresAt };
  } finally {
    await prisma.$disconnect();
  }
}

async function callBling(path, accessToken, label) {
  const url = `${BLING_BASE}${path}`;
  const started = Date.now();
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  const ms = Date.now() - started;
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { label, status: res.status, ok: res.ok, ms, url, body };
}

function summarize(result) {
  const { label, status, ok, ms, url, body } = result;
  console.log(`\n=== ${label} ===`);
  console.log(`  ${ok ? 'OK' : 'FAIL'}  HTTP ${status}  ${ms}ms`);
  console.log(`  URL: ${url}`);
  if (!ok) {
    console.log(`  Body:`, typeof body === 'string' ? body.slice(0, 500) : JSON.stringify(body, null, 2).slice(0, 1000));
    return;
  }
  if (typeof body !== 'object' || !body) {
    console.log(`  Body (raw):`, String(body).slice(0, 500));
    return;
  }
  if (Array.isArray(body.data)) {
    console.log(`  data.length = ${body.data.length}`);
    if (body.data[0]) {
      console.log(`  exemplo[0] keys:`, Object.keys(body.data[0]));
      console.log(`  exemplo[0] (preview):`, JSON.stringify(body.data[0], null, 2).slice(0, 1200));
    }
  } else if (body.data) {
    console.log(`  data keys:`, Object.keys(body.data));
    console.log(`  data (preview):`, JSON.stringify(body.data, null, 2).slice(0, 1500));
  } else {
    console.log(`  body keys:`, Object.keys(body));
  }
}

function monthRange(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const ini = new Date(y, m, 1);
  const fim = new Date(y, m + 1, 0, 23, 59, 59);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { inicio: fmt(ini), fim: fmt(fim) };
}

(async () => {
  const token = await getToken();
  console.log('Token ativo:', {
    expired: token.expired,
    expiresAt: token.expiresAt,
  });
  if (token.expired) {
    console.log('⚠️  Token expirado. Rode /bling-auth no admin para renovar antes.');
    // continuamos mesmo assim — API retornará 401 e saberemos
  }

  const { inicio, fim } = monthRange();
  const periodoAnterior = (() => {
    const hoje = new Date();
    hoje.setMonth(hoje.getMonth() - 1);
    return monthRange(hoje);
  })();

  console.log(`\nPeríodo atual: ${inicio} → ${fim}`);
  console.log(`Período anterior (fallback): ${periodoAnterior.inicio} → ${periodoAnterior.fim}`);

  // 1) NF-es saída autorizadas (período atual)
  const nfeAtual = await callBling(
    `/nfe?tipo=1&situacao=5&dataEmissaoInicial=${inicio}&dataEmissaoFinal=${fim}&limite=5`,
    token.accessToken,
    'GET /nfe (saída, autorizada, mês atual, limite=5)'
  );
  summarize(nfeAtual);

  // 1b) Se vazio, tenta mês anterior
  let nfeSample = nfeAtual;
  if (nfeAtual.ok && Array.isArray(nfeAtual.body?.data) && nfeAtual.body.data.length === 0) {
    console.log('\n(Mês atual vazio — tentando mês anterior)');
    nfeSample = await callBling(
      `/nfe?tipo=1&situacao=5&dataEmissaoInicial=${periodoAnterior.inicio}&dataEmissaoFinal=${periodoAnterior.fim}&limite=5`,
      token.accessToken,
      'GET /nfe (saída, autorizada, mês anterior, limite=5)'
    );
    summarize(nfeSample);
  }

  // 2) Detalhe de uma NF (para ver se vem itens/SKU/qtd)
  const firstNfId = Array.isArray(nfeSample.body?.data) && nfeSample.body.data[0]?.id;
  if (firstNfId) {
    await new Promise((r) => setTimeout(r, 400)); // rate limit
    const detalhe = await callBling(`/nfe/${firstNfId}`, token.accessToken, `GET /nfe/${firstNfId} (itens/SKU)`);
    summarize(detalhe);
    if (detalhe.ok && detalhe.body?.data?.itens) {
      const itens = detalhe.body.data.itens;
      console.log(`\n  ✅ Itens encontrados: ${itens.length}`);
      console.log(`  Campos do item[0]:`, Object.keys(itens[0] || {}));
      console.log(`  item[0] (preview):`, JSON.stringify(itens[0], null, 2).slice(0, 800));
    } else {
      console.log(`\n  ⚠️  Campo "itens" não veio no body.data. Verifique shape real.`);
    }
  } else {
    console.log('\n(Sem NF para buscar detalhe)');
  }

  // 3) Contas a pagar
  await new Promise((r) => setTimeout(r, 400));
  const contas = await callBling(
    `/contas/pagar?dataEmissaoInicial=${periodoAnterior.inicio}&dataEmissaoFinal=${fim}&limite=5`,
    token.accessToken,
    'GET /contas/pagar (período=mês anterior+atual, limite=5)'
  );
  summarize(contas);

  // 4) Categorias de receitas e despesas
  await new Promise((r) => setTimeout(r, 400));
  const categorias = await callBling(
    `/categorias/receitas-despesas?limite=10`,
    token.accessToken,
    'GET /categorias/receitas-despesas (limite=10)'
  );
  summarize(categorias);

  console.log('\n=== RESUMO ===');
  const checks = [
    ['NF-e (GET /nfe)', nfeAtual.ok || nfeSample.ok],
    ['NF-e detalhe (itens/SKU)', firstNfId ? 'tentado' : 'sem dados'],
    ['Contas a pagar', contas.ok],
    ['Categorias RD', categorias.ok],
  ];
  for (const [label, ok] of checks) {
    const icon = ok === true ? '✅' : ok === false ? '❌' : '➖';
    console.log(`  ${icon} ${label}`);
  }
})().catch((e) => {
  console.error('FALHA GERAL:', e);
  process.exit(1);
});
