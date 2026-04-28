import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateFreightFrenet } from "@/lib/freight/frenet";
import { logError, logWarn } from "@/utils/logMessage";

export const runtime = "nodejs";

// Directus retorna campos decimais como string; coagimos para número na borda.
const freightItemSchema = z.object({
  quantity: z.coerce.number().int().positive().max(100),
  peso_gramas: z.coerce.number().positive().optional(),
  altura: z.coerce.number().positive().optional(),
  largura: z.coerce.number().positive().optional(),
  comprimento: z.coerce.number().positive().optional(),
  bling_number: z.coerce.number().optional(),
  preco: z.coerce.number().nonnegative(),
});

const quoteSchema = z.object({
  cep: z.string().min(8).max(12),
  items: z.array(freightItemSchema).min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = quoteSchema.safeParse(await req.json());
    if (!parsed.success) {
      logWarn("checkout_issue", {
        step: "entrega",
        kind: "freight_quote_invalid_payload",
        severity: "warning",
        issues: parsed.error.issues,
      });
      return NextResponse.json({ success: false, error: "Dados de frete invalidos" }, { status: 400 });
    }

    const result = await calculateFreightFrenet(parsed.data.cep, parsed.data.items);
    if (!result.success) {
      logWarn("checkout_issue", {
        step: "entrega",
        kind: "freight_quote_failed",
        severity: "warning",
        error: result.error,
        cep: parsed.data.cep.replace(/^(\d{5}).*/, "$1***"),
        itemsCount: parsed.data.items.length,
      });
    }
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    logError("checkout_issue", {
      step: "entrega",
      kind: "freight_quote_exception",
      severity: "error",
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { success: false, error: "Erro ao calcular frete. Por favor, tente novamente." },
      { status: 500 },
    );
  }
}
