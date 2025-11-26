import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/utils/logMessage";
import type { PagBankWebhookNotification } from "@/types/pagbank";

const logMessage = createLogger();

// Função auxiliar para gerar SHA-256 e retornar como hex
async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Função para gerar SHA-256 sem normalização (para validação HMAC)
async function sha256Raw(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Valida a assinatura HMAC do webhook PagBank
 * Documentação: https://developer.pagbank.com.br/reference/confirmar-autenticidade-da-notificacao
 *
 * A assinatura é: SHA256(token + "-" + payload_raw)
 * Header: x-authenticity-token
 *
 * NOTA: O ambiente sandbox do PagBank frequentemente não envia o header de autenticidade
 */
async function validateWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): Promise<{ valid: boolean; reason?: string }> {
  const token = process.env.PAGBANK_WEBHOOK_TOKEN;
  const isSandbox = process.env.PAGBANK_API_URL?.includes("sandbox") ?? true;

  // Se não há header de assinatura
  if (!signatureHeader) {
    // Em sandbox, aceitar webhooks sem assinatura (comportamento normal do PagBank sandbox)
    if (isSandbox) {
      logMessage("Webhook sem assinatura aceito (ambiente sandbox)", {
        warning: "Em produção, webhooks sem assinatura serão rejeitados",
      });
      return { valid: true };
    }
    return { valid: false, reason: "Header x-authenticity-token ausente" };
  }

  // Se não há token configurado mas temos header, validar mesmo assim
  if (!token) {
    if (isSandbox) {
      logMessage("AVISO: PAGBANK_WEBHOOK_TOKEN não configurado, aceitando webhook em sandbox");
      return { valid: true };
    }
    logMessage("ERRO: PAGBANK_WEBHOOK_TOKEN não configurado");
    return { valid: false, reason: "Token de webhook não configurado no servidor" };
  }

  // Gerar hash esperado: SHA256(token + "-" + payload)
  const expectedSignature = await sha256Raw(`${token}-${rawBody}`);

  // Comparar com o header recebido
  const isValid = expectedSignature === signatureHeader.toLowerCase();

  if (!isValid) {
    logMessage("Assinatura do webhook inválida", {
      received: signatureHeader.substring(0, 16) + "...",
      expected: expectedSignature.substring(0, 16) + "...",
    });
  }

  return {
    valid: isValid,
    reason: isValid ? undefined : "Assinatura inválida",
  };
}

/**
 * Webhook para receber notificações do PagBank sobre mudanças no status do pagamento
 * Documentação: https://dev.pagbank.uol.com.br/reference/notificacoes
 */
export async function POST(req: NextRequest) {
  try {
    // Ler body como texto raw (necessário para validação HMAC)
    const rawBody = await req.text();

    // Validar assinatura HMAC do PagBank
    const signatureHeader = req.headers.get("x-authenticity-token");
    const validation = await validateWebhookSignature(rawBody, signatureHeader);

    if (!validation.valid) {
      logMessage("Webhook rejeitado - assinatura inválida", {
        reason: validation.reason,
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      });
      return NextResponse.json(
        { error: "Unauthorized", reason: validation.reason },
        { status: 401 }
      );
    }

    // Parsear JSON após validação
    const body: PagBankWebhookNotification = JSON.parse(rawBody);

    logMessage("Webhook PagBank recebido (assinatura válida)", {
      id: body.id,
      reference_id: body.reference_id,
      charges: body.charges,
    });

    // Verificar se o pedido existe
    const pedido = await prisma.pedido.findUnique({
      where: { id: body.reference_id },
      select: {
        id: true,
        status_pagamento: true,
        ga_session_id: true,
        ga_session_number: true,
      },
    });

    if (!pedido) {
      logMessage("Pedido não encontrado no webhook", {
        reference_id: body.reference_id,
      });
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar status do pedido baseado na cobrança
    const charge = body.charges?.[0];

    if (charge) {
      const updateData: any = {
        status_pagamento: charge.status,
      };

      logMessage("Atualizando status do pedido", {
        pedidoId: pedido.id,
        oldStatus: pedido.status_pagamento,
        newStatus: charge.status,
        paid_at: charge.paid_at,
      });

      await prisma.pedido.update({
        where: { id: body.reference_id },
        data: updateData,
      });

      logMessage("Status do pedido atualizado com sucesso", {
        pedidoId: pedido.id,
        status: charge.status,
      });

      // ✅ Se o pagamento foi confirmado (PAID), enviar evento para GTM
      if (charge.status === "PAID") {
        const emailRaw = body.customer?.email ?? "";
        const phoneRaw = [
          body.customer?.phones?.[0]?.country ?? "",
          body.customer?.phones?.[0]?.area ?? "",
          body.customer?.phones?.[0]?.number ?? "",
        ].join("");

        const gtmPayload = {
          event_name: "Purchase",
          event_id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transaction_id: body.id ?? "unknown",
          value: Number(charge.amount?.value ?? 0) / 100,
          currency: charge.amount?.currency ?? "BRL",
          items:
            body.items?.map((item: any) => ({
              item_id: item.reference_id ?? "unknown",
              item_name: item.name ?? "Produto",
              price: Number(item.unit_amount ?? 0) / 100,
              quantity: item.quantity ?? 1,
            })) ?? [],
          user_data: {
            em: emailRaw ? await sha256Hex(emailRaw) : undefined,
            ph: phoneRaw ? await sha256Hex(phoneRaw) : undefined,
          },
          user_email: emailRaw ? await sha256Hex(emailRaw) : undefined,
          user_phone: phoneRaw ? await sha256Hex(phoneRaw) : undefined,
          ga_session_id: pedido.ga_session_id,
          ga_session_number: pedido.ga_session_number,
        };

        logMessage("Enviando evento Purchase para GTM", {
          transaction_id: body.id,
          value: gtmPayload.value,
        });

        await fetch("https://gtm.lovecosmetics.com.br/data?v=2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gtmPayload),
        });
      }

      // TODO: Enviar email para cliente conforme status
      // - PAID: Pagamento confirmado
      // - DECLINED: Pagamento recusado
      // - CANCELED: Pagamento cancelado
      // - IN_ANALYSIS: Pagamento em análise

      // TODO: Se for PIX e foi pago, pode gerar nota fiscal automaticamente
    }

    // Armazenar notificação para auditoria
    await prisma.statusPagamento.create({
      data: {
        info: body as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Webhook processado com sucesso",
    });
  } catch (error) {
    logMessage("Erro ao processar webhook PagBank", error);

    // Mesmo com erro, retornar 200 para PagBank não reenviar
    // (salvar em log para investigação posterior)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }
    );
  }
}

/**
 * GET para buscar status de um pedido específico no PagBank
 * Útil para verificar status manualmente
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId é obrigatório" },
        { status: 400 }
      );
    }

    const pagBankUrl = process.env.PAGBANK_API_URL || "https://sandbox.api.pagseguro.com";
    const token = process.env.PAGBANK_TOKEN_SANDBOX;

    if (!token) {
      return NextResponse.json(
        { error: "Token do PagBank não configurado" },
        { status: 500 }
      );
    }

    // Consultar status do pedido no PagBank
    const response = await fetch(`${pagBankUrl}/orders/${orderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      logMessage("Erro ao consultar pedido no PagBank", errorData);
      return NextResponse.json(errorData, { status: response.status });
    }

    const orderData = await response.json();

    return NextResponse.json({
      success: true,
      order: orderData,
    });
  } catch (error) {
    logMessage("Erro ao consultar status do pedido", error);
    return NextResponse.json(
      {
        error: "Erro ao consultar status do pedido",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
