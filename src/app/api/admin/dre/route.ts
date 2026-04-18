import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/utils/logMessage";
import { prisma } from "@/lib/prisma";
import { listNfes, getNfeDetalhes } from "@/lib/bling/nfe";
import { listContasPagar, getContasPagarDetalhes } from "@/lib/bling/contas-pagar";
import { listCategoriasReceitasDespesas } from "@/lib/bling/categorias-rd";
import { calcularDRE } from "@/core/dre/calcular";

const logMessage = createLogger();

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function parseMesAno(searchParams: URLSearchParams): { mes: number; ano: number } | NextResponse {
  const mesStr = searchParams.get("mes");
  const anoStr = searchParams.get("ano");
  const hoje = new Date();
  const mes = mesStr ? Number(mesStr) : hoje.getMonth() + 1;
  const ano = anoStr ? Number(anoStr) : hoje.getFullYear();

  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    return NextResponse.json({ error: "Mês inválido" }, { status: 400 });
  }
  if (!Number.isInteger(ano) || ano < 2020 || ano > 2100) {
    return NextResponse.json({ error: "Ano inválido" }, { status: 400 });
  }
  return { mes, ano };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = parseMesAno(searchParams);
  if (parsed instanceof NextResponse) return parsed;
  const { mes, ano } = parsed;

  const forceRefresh = searchParams.get("refresh") === "1";
  const inicio = formatDate(new Date(ano, mes - 1, 1));
  const fim = formatDate(new Date(ano, mes, 0));

  // Cache hit: retorna direto
  if (!forceRefresh) {
    const cached = await prisma.dreCache.findUnique({ where: { mes_ano: { mes, ano } } });
    if (cached) {
      logMessage("DRE: cache hit", { mes, ano, updatedAt: cached.updatedAt });
      return NextResponse.json({
        ...(cached.resultado as object),
        _cache: { hit: true, updatedAt: cached.updatedAt.toISOString() },
      });
    }
  }

  try {
    logMessage("DRE: iniciando cálculo (cache miss ou refresh)", { mes, ano, inicio, fim, forceRefresh });

    // Paralelo: lista NFs autorizadas + NFs canceladas + contas a pagar + categorias
    const [nfesList, nfesCanceladasList, contasListEmissao, categorias] = await Promise.all([
      listNfes({ dataEmissaoInicial: inicio, dataEmissaoFinal: fim }),
      listNfes({ dataEmissaoInicial: inicio, dataEmissaoFinal: fim, situacao: 6 }),
      listContasPagar({ dataEmissaoInicial: inicio, dataEmissaoFinal: fim }),
      listCategoriasReceitasDespesas(),
    ]);

    logMessage("DRE: listagens ok", {
      nfes: nfesList.length,
      nfesCanceladas: nfesCanceladasList.length,
      contas: contasListEmissao.length,
      categorias: categorias.length,
    });

    // Busca detalhes (itens de NFs e categoria das contas) em sequência respeitando rate limit
    const [nfesDet, contasDet] = await Promise.all([
      getNfeDetalhes(nfesList.map((n) => n.id)),
      getContasPagarDetalhes(contasListEmissao.map((c) => c.id)),
    ]);

    const dre = calcularDRE({
      periodo: { mes, ano },
      nfesCanceladas: nfesCanceladasList.map((n) => ({
        id: n.id,
        numero: n.numero,
        dataEmissao: n.dataEmissao,
      })),
      nfes: nfesDet.map((n) => ({
        id: n.id,
        numero: n.numero,
        dataEmissao: n.dataEmissao,
        situacao: n.situacao,
        valorNota: Number(n.valorNota) || 0,
        valorFrete: Number(n.valorFrete) || 0,
        itens: (n.itens || []).map((it) => ({
          codigo: String(it.codigo),
          descricao: it.descricao,
          quantidade: Number(it.quantidade) || 0,
        })),
      })),
      contasPagar: contasDet.map((c) => ({
        id: c.id,
        valor: Number(c.valor) || 0,
        competencia: c.competencia,
        dataEmissao: c.dataEmissao,
        vencimento: c.vencimento,
        historico: c.historico,
        categoria: c.categoria,
      })),
      categorias: categorias.map((c) => ({
        id: c.id,
        descricao: c.descricao,
        idCategoriaPai: c.idCategoriaPai,
        idGrupoDre: c.idGrupoDre,
        tipo: c.tipo,
      })),
    });

    // Persiste no cache
    const saved = await prisma.dreCache.upsert({
      where: { mes_ano: { mes, ano } },
      create: { mes, ano, resultado: dre as any },
      update: { resultado: dre as any },
    });

    return NextResponse.json({
      ...dre,
      _cache: { hit: false, updatedAt: saved.updatedAt.toISOString() },
    });
  } catch (err: any) {
    logMessage("DRE: erro", { error: err?.message, status: err?.status });
    return NextResponse.json(
      { error: "Erro ao calcular DRE", detalhe: err?.message, status: err?.status },
      { status: 500 }
    );
  }
}

/**
 * Invalida o cache de DRE para um mês/ano. A próxima chamada GET refaz o cálculo
 * contra a API do Bling.
 */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = parseMesAno(searchParams);
  if (parsed instanceof NextResponse) return parsed;
  const { mes, ano } = parsed;

  const deleted = await prisma.dreCache.deleteMany({ where: { mes, ano } });
  logMessage("DRE: cache invalidado", { mes, ano, count: deleted.count });
  return NextResponse.json({ ok: true, removed: deleted.count, mes, ano });
}
