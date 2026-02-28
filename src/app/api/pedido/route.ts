import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/cliente/auth";
import { validacoes } from "@/lib/checkout/validation";
import { createLogger } from "@/utils/logMessage";
import { validateOrder } from "@/lib/pedido/validate-order";
import {
  createAccountForOrderIfRequested,
  createPedidoFromBody,
  linkPedidoToLoggedCliente,
} from "@/lib/pedido/create-pedido";
import { CupomEsgotadoError, reserveCupomForPedido } from "@/lib/cupom/usage";

const logMessage = createLogger();

const asNumber = (v: unknown) => (typeof v === "string" ? Number(v) : v);
const zAnyNumber = z.preprocess(asNumber, z.number());
const zNonNegativeNumber = z.preprocess(asNumber, z.number().min(0));
const zPositiveIntMax100 = z.preprocess(asNumber, z.number().int().min(1).max(100));
const zNullableInt = z.preprocess(asNumber, z.number().int()).nullable();

const orderItemSchema = z
  .object({
    reference_id: z.string().min(1).max(100),
    name: z.string().min(1).max(200),
    quantity: zPositiveIntMax100,
    preco: zNonNegativeNumber,
    unit_amount: zNonNegativeNumber,
  })
  .passthrough();

const dataNascimentoSchema = z
  .preprocess((v) => {
    if (v instanceof Date) return v;
    if (typeof v === "string" || typeof v === "number") return new Date(v);
    return v;
  }, z.date())
  .refine((d) => Number.isFinite(d.getTime()), "Data de nascimento invalida")
  .refine((d) => d.getFullYear() >= 1900, "Data de nascimento invalida")
  .refine((d) => d <= new Date(), "Data de nascimento invalida");

const createPedidoSchema = z
  .object({
    idempotencyKey: z.string().min(8).max(128).optional(),

    // Dados pessoais
    nome: z.string().min(1).max(80),
    sobrenome: z.string().min(1).max(120),
    email: z.string().email().max(254),
    telefone: z.string().min(8).max(25).refine((v) => validacoes.telefone(v), "Telefone invalido"),
    cpf: z.string().min(11).max(25).refine((v) => validacoes.cpf(v), "CPF invalido"),
    data_nascimento: dataNascimentoSchema,
    pais: z.string().min(1).max(60),

    // Entrega
    cep: z.string().min(8).max(12).refine((v) => validacoes.cep(v), "CEP invalido"),
    endereco: z.string().min(1).max(200),
    numero: z.string().min(1).max(20),
    complemento: z.string().max(200).optional().default(""),
    bairro: z.string().min(1).max(120),
    cidade: z.string().min(1).max(120),
    estado: z.string().min(2).max(2),

    // Preferencias
    salvar_minhas_informacoes: z.boolean().optional().default(false),
    aceito_receber_whatsapp: z.boolean().optional().default(false),
    destinatario: z.string().max(120).optional().default(""),

    // Itens e valores (validados no server)
    items: z.array(orderItemSchema),
    cupons: z.array(z.string()).optional().default([]),
    descontos: zAnyNumber,
    total_pedido: zAnyNumber,
    frete_calculado: zAnyNumber,

    // Informacoes de frete (apenas informativo)
    transportadora_nome: z.string().nullable().optional(),
    transportadora_servico: z.string().nullable().optional(),
    transportadora_prazo: zNullableInt.optional(),

    // Campos de apresentacao (nao afetam calculos)
    subtotal_produtos: zAnyNumber.optional(),
    cupom_valor: zAnyNumber.nullable().optional(),
    cupom_descricao: z.string().nullable().optional(),

    // Analytics
    ga_session_id: z.string().nullable().optional(),
    ga_session_number: z.string().nullable().optional(),
  })
  .passthrough();

function cleanDigits(value: unknown) {
  return String(value || "").replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = createPedidoSchema.safeParse(raw);

    if (!parsed.success) {
      logMessage("Invalid order payload", {
        issues: parsed.error.issues,
      });
      return NextResponse.json(
        { error: "Dados do pedido invalidos", code: "INVALID_ORDER_DATA" },
        { status: 400 },
      );
    }

    // Normalize/sanitize
    const body = {
      ...parsed.data,
      nome: parsed.data.nome.trim(),
      sobrenome: parsed.data.sobrenome.trim(),
      email: parsed.data.email.toLowerCase().trim(),
      telefone: cleanDigits(parsed.data.telefone),
      cpf: cleanDigits(parsed.data.cpf),
      cep: cleanDigits(parsed.data.cep),
      estado: parsed.data.estado.toUpperCase().trim(),
      endereco: parsed.data.endereco.trim(),
      bairro: parsed.data.bairro.trim(),
      cidade: parsed.data.cidade.trim(),
      complemento: (parsed.data.complemento || "").trim(),
      destinatario: (parsed.data.destinatario || "").trim(),
      cupons: (parsed.data.cupons || []).map((c) => String(c).toUpperCase().trim()).filter(Boolean),
    };

    // Idempotency: if we already created this pedido, return it.
    if (body.idempotencyKey) {
      const existing = await prisma.pedido.findUnique({
        where: { idempotency_key: body.idempotencyKey },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Pedido ja criado", id: existing.id, idempotent: true },
          { status: 200 },
        );
      }
    }

    // Validate pricing/coupon/freight server-side.
    const validationResult = await validateOrder(
      body.items,
      body.cupons,
      body.descontos,
      body.total_pedido,
      body.frete_calculado,
      body.cep,
    );

    if (!validationResult.valid) {
      logMessage("Order validation failed", {
        error: validationResult.error,
        code: validationResult.code,
        totalEnviado: body.total_pedido,
        totalCalculado: validationResult.calculatedTotal,
        descontosEnviado: body.descontos,
        descontosCalculado: validationResult.calculatedDescontos,
        items: body.items?.map((i: any) => ({ name: i.name, preco: i.preco, qty: i.quantity })),
        cupons: body.cupons,
      });

      return NextResponse.json(
        { error: validationResult.error, code: validationResult.code },
        { status: 400 },
      );
    }

    // Values calculated by server (source of truth).
    const totalSeguro = validationResult.calculatedTotal;
    const descontosSeguro = validationResult.calculatedDescontos;
    const freteSeguro = validationResult.details?.freteValidado ?? body.frete_calculado ?? 0;
    const transportadoraSeguro = validationResult.details?.freteService
      ? {
          nome: validationResult.details.freteService.carrier ?? null,
          servico: validationResult.details.freteService.service ?? null,
          prazo: validationResult.details.freteService.deliveryTime ?? null,
        }
      : undefined;

    // Campos de apresentação: usar sempre valores validados pelo server (não confiar no client)
    const cupomValorSeguro =
      validationResult.details?.cupomDesconto && validationResult.details.cupomDesconto > 0
        ? validationResult.details.cupomDesconto
        : null;
    const cupomDescricaoSeguro = validationResult.details?.cupomDescricao ?? null;

    const bodySeguro = {
      ...body,
      cupom_valor: cupomValorSeguro,
      cupom_descricao: cupomDescricaoSeguro,
    };

    const cupomCodigoParaReserva = validationResult.details?.cupomCodigo ?? null;
    const cupomMaxUsos = validationResult.details?.cupomUsosRestantes ?? null;

    // Business rule: "primeira compra" coupon
    const PRIMEIRA_COMPRA_CUPOM = "BEMVINDOLOVE15";
    const hasPrimeiraCompraCupom = (body.cupons || []).some(
      (c) => String(c).toUpperCase().trim() === PRIMEIRA_COMPRA_CUPOM,
    );

    if (hasPrimeiraCompraCupom) {
      const cpfLimpo = body.cpf;
      const emailLimpo = body.email;

      const pedidoPago = await prisma.pedido.findFirst({
        where: {
          status_pagamento: { in: ["PAID", "AUTHORIZED"] },
          OR: [{ cpf: cpfLimpo }, { email: emailLimpo }],
        },
        select: { id: true },
      });

      if (pedidoPago) {
        return NextResponse.json(
          {
            error: `Cupom \"${PRIMEIRA_COMPRA_CUPOM}\" valido apenas na primeira compra.`,
            code: "COUPON_FIRST_PURCHASE_ONLY",
          },
          { status: 400 },
        );
      }
    }

    // Logged-in cliente (if any)
    const clienteSession = await getCurrentSession();

    // Create pedido record (store totals validated by server).
    let pedido;
    try {
      pedido = await prisma.$transaction(async (tx) => {
        const created = await createPedidoFromBody({
          body: bodySeguro,
          totalSeguro,
          descontosSeguro,
          freteSeguro,
          transportadoraSeguro,
          prismaClient: tx,
        });

        // Reserve 1 global use for limited coupons (prevents infinite usage + races).
        if (cupomCodigoParaReserva && typeof cupomMaxUsos === "number" && cupomMaxUsos > 0) {
          await reserveCupomForPedido({
            tx,
            codigo: cupomCodigoParaReserva,
            pedidoId: created.id,
            maxUsos: cupomMaxUsos,
          });
        }

        return created;
      });
    } catch (err: any) {
      if (err instanceof CupomEsgotadoError || err?.code === "COUPON_EXHAUSTED") {
        return NextResponse.json(
          { error: "Cupom esgotado", code: "COUPON_EXHAUSTED" },
          { status: 400 },
        );
      }

      // Unique constraint on idempotency_key: return existing pedido.
      if (body.idempotencyKey) {
        const existing = await prisma.pedido.findUnique({
          where: { idempotency_key: body.idempotencyKey },
          select: { id: true },
        });
        if (existing) {
          return NextResponse.json(
            { message: "Pedido ja criado", id: existing.id, idempotent: true },
            { status: 200 },
          );
        }
      }
      throw err;
    }

    // Link or create account
    let clienteParaVincular = clienteSession?.id || null;
    let contaCriada = false;

    if (clienteSession) {
      await linkPedidoToLoggedCliente({
        pedidoId: pedido.id,
        clienteId: clienteSession.id,
        body,
      });
      clienteParaVincular = clienteSession.id;
    } else if (body.salvar_minhas_informacoes) {
      const userAgent = req.headers.get("user-agent") || undefined;
      const forwarded = req.headers.get("x-forwarded-for");
      const realIp = req.headers.get("x-real-ip");

      const result = await createAccountForOrderIfRequested({
        pedidoId: pedido.id,
        body,
        userAgent,
        forwardedFor: forwarded,
        realIp,
        logMessage,
      });

      if (result.errorResponse) {
        return NextResponse.json(result.errorResponse.body, { status: result.errorResponse.status });
      }

      clienteParaVincular = result.clienteId;
      contaCriada = result.contaCriada;
    }

    logMessage("Pedido criado com sucesso (Checkout Transparente)", {
      pedidoId: pedido.id,
      total: pedido.total_pedido,
      frete: pedido.frete_calculado,
    });

    return NextResponse.json(
      {
        message: "Pedido criado com sucesso",
        id: pedido.id,
        contaCriada,
        clienteVinculado: !!clienteParaVincular,
      },
      { status: 201 },
    );
  } catch (error) {
    logMessage("Erro ao criar pedido", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
