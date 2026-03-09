import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MAX_BODY_BYTES = 25_000;

export const runtime = "nodejs";

const trackItemSchema = z.object({
  item_id: z.string().trim().min(1).max(100),
  item_name: z.string().trim().min(1).max(200),
  price: z.number().finite().nonnegative(),
  quantity: z.number().finite().int().positive().max(999),
});

const trackBodySchema = z.object({
  sessionId: z
    .string()
    .trim()
    .min(8)
    .max(128)
    .regex(/^[A-Za-z0-9._-]+$/),
  step: z.enum(["identificacao", "entrega", "pagamento"]),
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  telefone: z.string().trim().max(32).optional(),
  nome: z.string().trim().max(120).optional(),
  cpf: z.string().trim().max(32).optional(),
  cep: z.string().trim().max(16).optional(),
  cidade: z.string().trim().max(80).optional(),
  estado: z.string().trim().toUpperCase().max(50).optional(),
  items: z.array(trackItemSchema).max(200).optional(),
  valor: z.number().finite().nonnegative().nullable().optional(),
  cupons: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
  device: z.enum(["mobile", "desktop", "tablet"]).optional(),
  convertido: z.boolean().optional(),
});

type TrackBody = z.infer<typeof trackBodySchema>;

function digitsOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits ? digits : null;
}

function normalizeText(value: string | null | undefined): string | null {
  if (!value) return null;
  const t = value.trim();
  return t ? t : null;
}

function getClientIp(request: NextRequest): string | null {
  const raw =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null;
  if (!raw) return null;

  // Reduce sensitivity by storing only a coarse prefix.
  if (raw.includes(".")) {
    const host = raw.split(":")[0]; // strips potential ":port"
    const parts = host.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    return host;
  }

  if (raw.includes(":")) {
    const clean = raw.split("%")[0]; // strips zone index
    const parts = clean.split(":");
    const prefix = parts.slice(0, 4).join(":");
    return prefix ? `${prefix}::` : clean;
  }

  return raw;
}

function buildUpdateData(body: TrackBody): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  if (body.email !== undefined) data.email = body.email;
  if (body.telefone !== undefined) data.telefone = digitsOnly(body.telefone);
  if (body.nome !== undefined) data.nome = normalizeText(body.nome);
  if (body.cpf !== undefined) data.cpf = digitsOnly(body.cpf);
  if (body.cep !== undefined) data.cep = digitsOnly(body.cep);
  if (body.cidade !== undefined) data.cidade = normalizeText(body.cidade);
  if (body.estado !== undefined) data.estado = body.estado;
  if (body.items !== undefined) data.items = body.items;
  if (body.valor !== undefined) data.valor = body.valor;
  if (body.cupons !== undefined) data.cupons = body.cupons;
  if (body.device !== undefined) data.device = body.device;
  if (body.convertido !== undefined) data.convertido = body.convertido;

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const contentLengthHeader = request.headers.get("content-length");
    if (contentLengthHeader) {
      const contentLength = Number(contentLengthHeader);
      if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "Payload too large" }, { status: 413 });
      }
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = trackBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const body = parsed.data;
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") || null;
    const id = `${body.sessionId}_${body.step}`;

    await prisma.checkoutAbandonado.upsert({
      where: { id },
      create: {
        id,
        sessionId: body.sessionId,
        step: body.step,
        email: body.email ?? null,
        telefone: digitsOnly(body.telefone),
        nome: normalizeText(body.nome),
        cpf: digitsOnly(body.cpf),
        cep: digitsOnly(body.cep),
        cidade: normalizeText(body.cidade),
        estado: body.estado ?? null,
        items: body.items ?? undefined,
        valor: body.valor ?? null,
        cupons: body.cupons ?? [],
        convertido: body.convertido ?? false,
        device: body.device ?? null,
        userAgent,
        ip,
      },
      update: buildUpdateData(body),
    });

    if (body.convertido === true) {
      await prisma.checkoutAbandonado.updateMany({
        where: { sessionId: body.sessionId },
        data: { convertido: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao trackear checkout:", error);
    return NextResponse.json({ error: "Erro ao salvar dados" }, { status: 500 });
  }
}
