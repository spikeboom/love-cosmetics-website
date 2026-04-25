import { lookupCustoInterno, type ItemNf } from "./custos-internos";
import {
  BLING_IDGRUPODRE_PARA_LOCAL,
  CATEGORIA_PAI_PARA_SUBGRUPO,
  type SubgrupoOperacional,
} from "./grupos-bling";

export interface NfeDetalhada {
  id: number;
  numero: string;
  dataEmissao: string;
  situacao: number;
  valorNota: number;
  valorFrete: number;
  itens: ItemNf[];
}

export interface ContaPagarDetalhada {
  id: number;
  valor: number;
  competencia?: string;
  dataEmissao?: string;
  vencimento?: string;
  historico?: string;
  categoria?: { id: number };
}

export interface CategoriaRD {
  id: number;
  descricao: string;
  idCategoriaPai: number;
  idGrupoDre: number | null;
  tipo: number;
}

export type WarningGrupo =
  | "dados_bling" // Precisam ser corrigidos no Bling pelo time
  | "regras_calculo" // Decisões da nossa implementação — informativo
  | "atencao"; // Sinais de alerta no período

export interface WarningDRE {
  codigo:
    | "custo_sku_faltando"
    | "conta_sem_categoria"
    | "categoria_sem_subgrupo"
    | "nfe_sem_itens"
    | "poucas_contas_pagar"
    | "compras_fornecedores_ignoradas"
    | "nfe_cancelada_no_periodo"
    | "grupos_dre_ignorados_com_saldo"
    | "despesa_valor_zero"
    | "contas_sem_competencia"
    | "filtro_data_competencia_vs_emissao"
    | "receita_sem_emissao_nf"
    | "custo_interno_desatualizado"
    | "kit_em_nf"
    | "mes_futuro_ou_ausente_de_nfs";
  grupo: WarningGrupo;
  titulo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
  quantidade?: number;
  valor?: number;
}

export interface DespesaDetalhe {
  contaId: number;
  valor: number;
  historico?: string;
  categoriaId?: number;
  categoriaDescricao?: string;
  subgrupo: "marketing" | "operacional" | "administrativo" | "outros";
  motivoOutros?: "sem_categoria" | "categoria_fora_das_arvores";
}

export interface DreResultado {
  periodo: { mes: number; ano: number; inicio: string; fim: string };
  receitaBruta: number;
  cpv: number;
  margemBruta: number;
  despesasOperacionais: {
    marketing: number;
    operacional: number;
    administrativo: number;
    outros: number;
    total: number;
    detalhes: DespesaDetalhe[];
  };
  ebitda: number;
  resultadoExercicio: number;
  detalhes: {
    nfsAnalisadas: number;
    quantidadePorCodigo: Record<string, { quantidade: number; descricao: string }>;
    contasAnalisadas: number;
    contasSemCategoria: number;
    contasSemCategoriaValor: number;
    contasIgnoradasPorGrupo: number; // Grupos ignorados (financeiras, impostos etc.)
    contasIgnoradasValor: number;
  };
  warnings: WarningDRE[];
}

/**
 * Calcula DRE a partir dos dados crus do Bling. Função pura — sem I/O.
 */
export function calcularDRE(input: {
  periodo: { mes: number; ano: number };
  nfes: NfeDetalhada[];
  /**
   * NFs canceladas do período (situacao=6). Não entram no cálculo — só geram warning.
   */
  nfesCanceladas?: Array<{ id: number; numero: string; dataEmissao: string }>;
  contasPagar: ContaPagarDetalhada[];
  categorias: CategoriaRD[];
}): DreResultado {
  const { periodo, nfes, nfesCanceladas = [], contasPagar, categorias } = input;

  // --- Receita Bruta (soma valorNota de NFs autorizadas) ---
  const nfesAutorizadas = nfes.filter((n) => n.situacao === 5);
  const receitaBruta = nfesAutorizadas.reduce((s, n) => s + (Number(n.valorNota) || 0), 0);

  // --- CPV (custo interno × quantidade) ---
  let cpv = 0;
  const quantidadePorCodigo: Record<string, { quantidade: number; descricao: string }> = {};
  const custosFaltando = new Map<string, { descricao: string; quantidade: number }>();

  for (const nfe of nfesAutorizadas) {
    for (const item of nfe.itens) {
      const qtd = Number(item.quantidade) || 0;
      const ref = quantidadePorCodigo[item.codigo] || { quantidade: 0, descricao: item.descricao };
      ref.quantidade += qtd;
      quantidadePorCodigo[item.codigo] = ref;

      const { custoUnitario, fonte } = lookupCustoInterno(item);
      if (custoUnitario == null) {
        const existing = custosFaltando.get(item.codigo) || { descricao: item.descricao, quantidade: 0 };
        existing.quantidade += qtd;
        custosFaltando.set(item.codigo, existing);
      } else {
        cpv += custoUnitario * qtd;
      }
    }
  }

  // --- Despesas Operacionais (contas a pagar categorizadas em idGrupoDre=7) ---
  const catById = new Map<number, CategoriaRD>();
  for (const c of categorias) catById.set(c.id, c);

  let despMarketing = 0;
  let despOperacional = 0;
  let despAdministrativo = 0;
  let despOutros = 0;
  let contasSemCategoria = 0;
  let contasSemCategoriaValor = 0;
  let contasIgnoradasPorGrupo = 0;
  let contasIgnoradasValor = 0;
  let contasCompras = 0;
  let contasComprasValor = 0;
  let contasValorZero = 0;
  let contasSemCompetencia = 0;
  const categoriasSemSubgrupo = new Map<number, { descricao: string; valor: number }>();
  const ignoradasPorGrupoDetalhe: Array<{ id: number; valor: number; grupoDre: number | null; categoriaDescricao: string }> = [];
  const despesasDetalhes: DespesaDetalhe[] = [];

  for (const conta of contasPagar) {
    const valor = Number(conta.valor) || 0;
    const catId = conta.categoria?.id ?? 0;

    if (!conta.competencia) contasSemCompetencia++;
    if (valor === 0) contasValorZero++;

    if (!catId) {
      contasSemCategoria++;
      contasSemCategoriaValor += valor;
      despOutros += valor; // conservador: entra no DRE como "Outros"
      despesasDetalhes.push({
        contaId: conta.id,
        valor,
        historico: conta.historico,
        subgrupo: "outros",
        motivoOutros: "sem_categoria",
      });
      continue;
    }

    const cat = catById.get(catId);
    if (!cat) {
      contasSemCategoria++;
      contasSemCategoriaValor += valor;
      despOutros += valor;
      despesasDetalhes.push({
        contaId: conta.id,
        valor,
        historico: conta.historico,
        categoriaId: catId,
        subgrupo: "outros",
        motivoOutros: "sem_categoria",
      });
      continue;
    }

    const grupoLocal = BLING_IDGRUPODRE_PARA_LOCAL[cat.idGrupoDre ?? -1];
    if (grupoLocal !== "despesa_operacional") {
      contasIgnoradasPorGrupo++;
      contasIgnoradasValor += valor;
      ignoradasPorGrupoDetalhe.push({
        id: conta.id,
        valor,
        grupoDre: cat.idGrupoDre,
        categoriaDescricao: cat.descricao,
      });
      if (cat.idGrupoDre === 1) {
        contasCompras++;
        contasComprasValor += valor;
      }
      continue;
    }

    // É despesa operacional — classifica via categoria-pai
    const paiId = cat.idCategoriaPai || cat.id;
    const subgrupo: SubgrupoOperacional | undefined = CATEGORIA_PAI_PARA_SUBGRUPO[paiId];

    const sub: DespesaDetalhe["subgrupo"] =
      subgrupo === "marketing" ? "marketing"
      : subgrupo === "administrativo" ? "administrativo"
      : subgrupo === "operacional" ? "operacional"
      : "outros";

    if (sub === "marketing") despMarketing += valor;
    else if (sub === "administrativo") despAdministrativo += valor;
    else if (sub === "operacional") despOperacional += valor;
    else {
      despOutros += valor;
      const existing = categoriasSemSubgrupo.get(cat.id) || { descricao: cat.descricao, valor: 0 };
      existing.valor += valor;
      categoriasSemSubgrupo.set(cat.id, existing);
    }

    despesasDetalhes.push({
      contaId: conta.id,
      valor,
      historico: conta.historico,
      categoriaId: cat.id,
      categoriaDescricao: cat.descricao,
      subgrupo: sub,
      motivoOutros: sub === "outros" ? "categoria_fora_das_arvores" : undefined,
    });
  }

  const totalDespesas = despMarketing + despOperacional + despAdministrativo + despOutros;
  const margemBruta = receitaBruta - cpv;
  const ebitda = margemBruta - totalDespesas;

  // --- Warnings ---
  const warnings: WarningDRE[] = [];

  // === GRUPO: dados_bling (o time precisa corrigir no Bling) ===

  if (contasSemCategoria > 0) {
    warnings.push({
      codigo: "conta_sem_categoria",
      grupo: "dados_bling",
      titulo: `${contasSemCategoria} conta(s) a pagar sem categoria no Bling`,
      mensagem:
        "Dentro do Bling, essas despesas foram lançadas sem atribuir uma categoria (campo 'categoria' vazio ou id=0). Elas caem em 'Outros' por falta de dados. Abra o Bling → Financeiro → Contas a Pagar e atribua a categoria correta para cada lançamento. Depois disso, o DRE separa certo em Marketing/Operacional/Administrativo.",
      quantidade: contasSemCategoria,
      valor: contasSemCategoriaValor,
    });
  }

  if (categoriasSemSubgrupo.size > 0) {
    warnings.push({
      codigo: "categoria_sem_subgrupo",
      grupo: "dados_bling",
      titulo: `${categoriasSemSubgrupo.size} categoria(s) operacional(is) sem subgrupo mapeado`,
      mensagem:
        "Estas categorias estão em 'Despesas Operacionais' no Bling (idGrupoDre=7) mas não batem com nenhuma das 3 árvores conhecidas (Despesas comerciais → Marketing, Despesas administrativas → Administrativo, Despesas com pessoal → Operacional). Elas caem em 'Outros'. Para corrigir, mova a categoria no Bling para a árvore apropriada, ou adicione o mapeamento em src/core/dre/grupos-bling.ts.",
      detalhes: {
        categorias: Array.from(categoriasSemSubgrupo.entries()).map(([id, v]) => ({ id, ...v })),
      },
      quantidade: categoriasSemSubgrupo.size,
    });
  }

  if (contasValorZero > 0) {
    warnings.push({
      codigo: "despesa_valor_zero",
      grupo: "dados_bling",
      titulo: `${contasValorZero} conta(s) a pagar com valor R$ 0`,
      mensagem:
        "Essas contas têm valor zero no Bling, provavelmente lançamentos incompletos ou importações automáticas (ex.: 'Ref. a NF nº …' sem valor preenchido). Não afetam o DRE. Vale limpar no Bling.",
      quantidade: contasValorZero,
    });
  }

  if (contasSemCompetencia > 0) {
    warnings.push({
      codigo: "contas_sem_competencia",
      grupo: "dados_bling",
      titulo: `${contasSemCompetencia} conta(s) sem data de competência`,
      mensagem:
        "O campo 'competencia' (mês contábil ao qual a despesa pertence) está vazio nessas contas. O DRE filtra por dataEmissao por padrão, mas o ideal contabilmente é filtrar por competência. Preencher esse campo no Bling deixa o DRE mais preciso.",
      quantidade: contasSemCompetencia,
    });
  }

  if (custosFaltando.size > 0) {
    const itens = Array.from(custosFaltando.entries()).map(([codigo, v]) => ({ codigo, ...v }));
    warnings.push({
      codigo: "custo_sku_faltando",
      grupo: "dados_bling",
      titulo: `${custosFaltando.size} SKU(s) sem custo interno mapeado`,
      mensagem:
        "Produtos foram vendidos em NFs do período mas seu custo ainda não está mapeado em src/core/dre/custos-internos.ts. O CPV calculado está subestimado — adicione os custos para o DRE ficar preciso.",
      detalhes: { itens },
      quantidade: custosFaltando.size,
    });
  }

  // === GRUPO: regras_calculo (decisões informativas) ===

  warnings.push({
    codigo: "filtro_data_competencia_vs_emissao",
    grupo: "regras_calculo",
    titulo: "Filtro atual: dataEmissao (ver nota)",
    mensagem:
      "A doc do DRE pede 'data de lançamento/vencimento'. Hoje o DRE filtra contas a pagar por dataEmissao no Bling. Na prática, para as contas existentes, dataEmissao e competencia são iguais. Se o processo mudar e competencia começar a divergir, avise — dá para trocar o filtro para 'competencia' (puxando sem filtro e filtrando localmente, já que a API do Bling não aceita filtro por competência diretamente).",
  });

  warnings.push({
    codigo: "custo_interno_desatualizado",
    grupo: "regras_calculo",
    titulo: "Custos por SKU estão hardcoded",
    mensagem:
      "Os custos internos usados no CPV estão hardcoded em src/core/dre/custos-internos.ts (indexados por codigo do Bling, com fallback por descrição). Valores vieram da planilha interna — Espuma 44,90 | Hidratante 58,54 | Sérum 45,70 | Máscara 44,17 | Manteiga 56,45. Para refletir mudanças de custo (reajustes, novos fornecedores), edite esse arquivo. No futuro, vale migrar para tabela Prisma editável via UI admin.",
  });

  if (contasCompras > 0) {
    warnings.push({
      codigo: "compras_fornecedores_ignoradas",
      grupo: "regras_calculo",
      titulo: `${contasCompras} conta(s) de 'Compras de fornecedores' ignoradas`,
      mensagem:
        "Essas contas estão classificadas no Bling com idGrupoDre=1 (Compras). A doc do DRE pede para o CPV vir de CUSTO INTERNO por SKU (não das compras registradas no Bling), então elas não entram nem como CPV nem como despesa operacional — para não dobrar valor. Se quiser mudar essa regra, me avise.",
      quantidade: contasCompras,
      valor: contasComprasValor,
    });
  }

  if (nfesCanceladas.length > 0) {
    warnings.push({
      codigo: "nfe_cancelada_no_periodo",
      grupo: "regras_calculo",
      titulo: `${nfesCanceladas.length} NF(s) canceladas no período`,
      mensagem:
        "Essas notas fiscais estão com situação=6 (cancelada) no Bling. Elas foram IGNORADAS do cálculo de Receita Bruta, seguindo prática contábil comum. Se sua contabilidade trata diferente (ex.: subtrair o valor), me avise.",
      detalhes: { nfes: nfesCanceladas },
      quantidade: nfesCanceladas.length,
    });
  }

  // === GRUPO: atencao (sinais no período atual) ===

  if (nfesAutorizadas.length === 0) {
    warnings.push({
      codigo: "mes_futuro_ou_ausente_de_nfs",
      grupo: "atencao",
      titulo: "Nenhuma NF emitida neste período",
      mensagem:
        "Não há NFs emitidas no intervalo selecionado. Pode ser: (a) mês futuro, (b) vendas do período ainda não viraram NF, ou (c) filtro errado. Verifique no Bling se há NFs pendentes de emissão ou confirme o período.",
    });
  }

  const nfesSemItens = nfesAutorizadas.filter((n) => !n.itens || n.itens.length === 0).length;
  if (nfesSemItens > 0) {
    warnings.push({
      codigo: "nfe_sem_itens",
      grupo: "atencao",
      titulo: `${nfesSemItens} NF(s) sem itens`,
      mensagem:
        "Essas notas fiscais foram emitidas mas o detalhe delas não trouxe itens. O valor delas entra na Receita Bruta mas não no CPV.",
      quantidade: nfesSemItens,
    });
  }

  const nfesComKit = nfesAutorizadas.filter((n) =>
    (n.itens || []).some((i) => /^kit\b/i.test(i.descricao))
  );
  if (nfesComKit.length > 0) {
    warnings.push({
      codigo: "kit_em_nf",
      grupo: "atencao",
      titulo: `${nfesComKit.length} NF(s) com item 'Kit …'`,
      mensagem:
        "Detectamos itens cuja descrição começa com 'Kit' nestas NFs. O cálculo de CPV assume que kits SEMPRE vêm explodidos em componentes individuais na NF (como observado nas NFs analisadas). Se 'Kit …' aparecer literal na NF, o custo interno dele não está mapeado e vai para o warning de SKU faltando — resultando em CPV subestimado. Vale investigar.",
      detalhes: { nfes: nfesComKit.map((n) => ({ id: n.id, numero: n.numero })) },
      quantidade: nfesComKit.length,
    });
  }

  if (contasPagar.length < 3) {
    warnings.push({
      codigo: "poucas_contas_pagar",
      grupo: "atencao",
      titulo: "Poucas despesas lançadas no Bling",
      mensagem: `Só ${contasPagar.length} conta(s) a pagar foram encontradas neste período. Se a Lovè realmente teve só essas despesas, tudo certo — mas é comum faltar lançamentos (aluguel, energia, serviços, salários) no Bling. Sem essas despesas no Bling, o EBITDA fica superestimado.`,
      quantidade: contasPagar.length,
    });
  }

  const ignoradasLiquidas = contasIgnoradasValor - contasComprasValor;
  if (ignoradasLiquidas > 0) {
    warnings.push({
      codigo: "grupos_dre_ignorados_com_saldo",
      grupo: "atencao",
      titulo: `R$ ${ignoradasLiquidas.toFixed(2)} em contas ignoradas por grupo DRE`,
      mensagem:
        "Foram ignoradas contas classificadas em grupos DRE fora do modelo simplificado da Lovè: Impostos (idGrupoDre=13), Juros/Financeiras (9), Outras despesas (11), Deduções (3). A doc manda ignorar — mas vale revisar se algum desses valores deveria ter virado Despesa Operacional. Para corrigir, basta mudar a categoria da conta no Bling para uma que esteja em 'Despesas Operacionais' (idGrupoDre=7).",
      detalhes: { contas: ignoradasPorGrupoDetalhe.filter((c) => c.grupoDre !== 1) },
      valor: ignoradasLiquidas,
      quantidade: contasIgnoradasPorGrupo - contasCompras,
    });
  }

  warnings.push({
    codigo: "receita_sem_emissao_nf",
    grupo: "atencao",
    titulo: "Receita depende 100% de NFs emitidas",
    mensagem:
      "O DRE usa APENAS NFs emitidas para calcular Receita Bruta (é o que a doc pede). Pedidos pagos que ainda não viraram NF NÃO aparecem aqui. Se houver defasagem entre pagamento e emissão de NF, a receita do mês pode estar subestimada. Para validar: compare com relatório de pedidos pagos no PagBank vs. NFs emitidas no Bling no mesmo período.",
  });

  return {
    periodo: {
      mes: periodo.mes,
      ano: periodo.ano,
      inicio: formatDate(new Date(periodo.ano, periodo.mes - 1, 1)),
      fim: formatDate(new Date(periodo.ano, periodo.mes, 0)),
    },
    receitaBruta,
    cpv,
    margemBruta,
    despesasOperacionais: {
      marketing: despMarketing,
      operacional: despOperacional,
      administrativo: despAdministrativo,
      outros: despOutros,
      total: totalDespesas,
      detalhes: despesasDetalhes,
    },
    ebitda,
    resultadoExercicio: ebitda,
    detalhes: {
      nfsAnalisadas: nfesAutorizadas.length,
      quantidadePorCodigo,
      contasAnalisadas: contasPagar.length,
      contasSemCategoria,
      contasSemCategoriaValor,
      contasIgnoradasPorGrupo,
      contasIgnoradasValor,
    },
    warnings,
  };
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
