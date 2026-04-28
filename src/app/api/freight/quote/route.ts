import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateFreightFrenet } from "@/lib/freight/frenet";

export const runtime = "nodejs";

const freightItemSchema = z.object({
  quantity: z.number().int().positive().max(100),
  peso_gramas: z.number().positive().optional(),
  altura: z.number().positive().optional(),
  largura: z.number().positive().optional(),
  comprimento: z.number().positive().optional(),
  bling_number: z.number().optional(),
  preco: z.number().nonnegative(),
});

const quoteSchema = z.object({
  cep: z.string().min(8).max(12),
  items: z.array(freightItemSchema).min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const parsed = quoteSchema.safeParse(await req.json());
    if (!parsed.success) {
      console.warn("[checkout_issue]", {
        step: "entrega",
        kind: "freight_quote_invalid_payload",
        severity: "warning",
        issues: parsed.error.issues,
      });
      return NextResponse.json({ success: false, error: "Dados de frete invalidos" }, { status: 400 });
    }

    const result = await calculateFreightFrenet(parsed.data.cep, parsed.data.items);
    if (!result.success) {
      console.warn("[checkout_issue]", {
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
    console.error("[checkout_issue]", {
      step: "entrega",
      kind: "freight_quote_exception",
      severity: "error",
      error,
    });
    return NextResponse.json(
      { success: false, error: "Erro ao calcular frete. Por favor, tente novamente." },
      { status: 500 },
    );
  }
}
