/**
 * Probe: percorre todos os meses desde janeiro/2025 e mostra contagem de
 * contas a pagar em cada filtro de data. Também lista TODAS as contas sem
 * filtro nenhum para ver o que existe no Bling.
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

async function getToken() {
  const prisma = new PrismaClient();
  try {
    const t = await prisma.authToken.findFirst({ where: { provider: 'bling' }, orderBy: { createdAt: 'desc' } });
    const fiveMin = new Date(Date.now() + 5 * 60 * 1000);
    if (t.expiresAt <= fiveMin) return await refreshTokenFlow(prisma, t.refreshToken);
    return t.accessToken;
  } finally {
    await prisma.$disconnect();
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path, token) {
  const res = await fetch(`${BLING_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

function fmt(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

(async () => {
  const token = await getToken();
  console.log('Token OK.\n');

  // 1) Lista TODAS as contas a pagar (sem filtro, paginado)
  console.log('=== Todas as contas a pagar no Bling (sem filtro) ===\n');
  const todas = [];
  let page = 1;
  while (page <= 10) {
    await sleep(400);
    const r = await get(`/contas/pagar?limite=100&pagina=${page}`, token);
    if (!r.ok) { console.log('ERRO', r.status, r.body); break; }
    const data = r.body.data || [];
    todas.push(...data);
    if (data.length < 100) break;
    page++;
  }
  console.log(`Total de contas: ${todas.length}\n`);

  // Busca detalhe de TODAS para ter categoria + datas completas
  console.log('Buscando detalhe de cada...');
  const detalhes = [];
  for (const c of todas) {
    await sleep(400);
    const d = await get(`/contas/pagar/${c.id}`, token);
    if (d.ok) detalhes.push(d.body.data);
  }

  // Ordena por data (competencia ou dataEmissao ou vencimento)
  detalhes.sort((a, b) => {
    const da = a.competencia || a.dataEmissao || a.vencimento || '';
    const db = b.competencia || b.dataEmissao || b.vencimento || '';
    return da.localeCompare(db);
  });

  console.log('\n=== Detalhe de todas as contas a pagar ===\n');
  console.log('id | situacao | valor | dataEmissao | vencimento | competencia | categoria.id | historico');
  console.log('-'.repeat(120));
  for (const d of detalhes) {
    console.log(
      `${d.id} | s=${d.situacao} | R$${String(d.valor).padStart(8)} | ` +
      `em=${d.dataEmissao || '-'} | v=${d.vencimento || '-'} | c=${d.competencia || '-'} | ` +
      `cat=${d.categoria?.id ?? 'null'} | "${(d.historico || '').slice(0, 40)}"`
    );
  }

  // 2) Probe mês a mês
  console.log('\n\n=== Contas por mês (2025-01 até 2026-04) ===\n');
  console.log('Período         | dataEmissao | dataVencimento | dataPagamento');
  console.log('-'.repeat(75));
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2026 && m > 4) break;
      const ini = fmt(new Date(y, m - 1, 1));
      const fim = fmt(new Date(y, m, 0));
      await sleep(400);
      const rEm = await get(`/contas/pagar?dataEmissaoInicial=${ini}&dataEmissaoFinal=${fim}&limite=100`, token);
      await sleep(400);
      const rVe = await get(`/contas/pagar?dataVencimentoInicial=${ini}&dataVencimentoFinal=${fim}&limite=100`, token);
      await sleep(400);
      const rPa = await get(`/contas/pagar?dataPagamentoInicial=${ini}&dataPagamentoFinal=${fim}&limite=100`, token);
      console.log(
        `${ini}..${fim} | ` +
        String(rEm.body?.data?.length ?? '-').padStart(11) + ' | ' +
        String(rVe.body?.data?.length ?? '-').padStart(14) + ' | ' +
        String(rPa.body?.data?.length ?? '-').padStart(13)
      );
    }
  }

  // 3) NFs por mês (para contexto)
  console.log('\n\n=== NFs saída autorizadas por mês ===\n');
  console.log('Período         | count');
  console.log('-'.repeat(30));
  for (let y = 2025; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      if (y === 2026 && m > 4) break;
      const ini = fmt(new Date(y, m - 1, 1));
      const fim = fmt(new Date(y, m, 0));
      await sleep(400);
      const r = await get(`/nfe?tipo=1&situacao=5&dataEmissaoInicial=${ini}&dataEmissaoFinal=${fim}&limite=100`, token);
      console.log(`${ini}..${fim} | ${String(r.body?.data?.length ?? '-').padStart(5)}`);
    }
  }
})().catch((e) => { console.error(e); process.exit(1); });
