import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/utils/logMessage";
import type {
  PagBankOrderRequest,
  PagBankOrderResponse,
  PagBankError,
  PagBankPixOrderRequest,
} from "@/types/pagbank";

const logMessage = createLogger();

/**
 * Cria um pedido no PagBank usando a API Orders (Checkout Transparente)
 * Suporta pagamento com cartão de crédito e PIX
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pedidoId,
      paymentMethod, // "credit_card" ou "pix"
      encryptedCard, // apenas para cartão
      installments = 1, // número de parcelas
    } = body;

    // Buscar pedido no banco de dados
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o pedido já foi pago
    if (pedido.status_pagamento === "PAID" || pedido.status_pagamento === "AUTHORIZED") {
      logMessage("Tentativa de pagamento duplicado", {
        pedidoId,
        status_atual: pedido.status_pagamento,
      });

      return NextResponse.json(
        {
          error: "Este pedido já foi pago",
          details: "Não é possível criar um novo pagamento para um pedido já pago",
          status: pedido.status_pagamento,
        },
        { status: 400 }
      );
    }

    // Preparar dados do cliente
    const cleanedPhone = pedido.telefone.replace(/\D/g, "");
    const cleanedCPF = pedido.cpf.replace(/\D/g, "");
    const cleanedCEP = pedido.cep.replace(/\D/g, "");

    const customer = {
      name: `${pedido.nome} ${pedido.sobrenome}`,
      email: pedido.email,
      tax_id: cleanedCPF,
      phones: [
        {
          country: "55",
          area: cleanedPhone.substring(0, 2),
          number: cleanedPhone.substring(2),
          type: "MOBILE" as const,
        },
      ],
    };

    // Preparar itens do pedido
    const items = (pedido.items as any[]).map((item: any) => ({
      reference_id: item.reference_id || item.id,
      name: item.name,
      quantity: item.quantity,
      unit_amount: Math.round(item.unit_amount * 100), // Converter de REAIS para centavos
    }));

    // Calcular valor total em centavos (converter de REAIS)
    const totalAmount = Math.round((pedido.total_pedido + (pedido.frete_calculado || 0)) * 100);

    // Preparar endereço de entrega
    const shipping = {
      address: {
        street: pedido.endereco,
        number: pedido.numero,
        complement: pedido.complemento || undefined,
        locality: pedido.bairro,
        city: pedido.cidade,
        region_code: pedido.estado,
        country: "BRA" as const,
        postal_code: cleanedCEP,
      },
    };

    // URLs de notificação
    // Prioridade: NGROK_URL (dev local) > BASE_URL_PRODUCTION > fallback
    const baseUrl =
      process.env.NGROK_URL ||
      process.env.BASE_URL_PRODUCTION ||
      "https://www.lovecosmetics.com.br";
    const notification_urls = [`${baseUrl}/api/pagbank/webhook`];

    logMessage("URL de notificação configurada", {
      baseUrl,
      notification_url: notification_urls[0],
    });

    let requestBody: PagBankOrderRequest | PagBankPixOrderRequest;
    let endpoint: string;

    if (paymentMethod === "pix") {
      // ======= PAGAMENTO COM PIX =======
      requestBody = {
        reference_id: pedidoId,
        customer,
        items,
        qr_codes: [
          {
            amount: {
              value: Math.round(totalAmount),
              currency: "BRL",
            },
            // Expiração em 24 horas (opcional)
            expiration_date: new Date(
              Date.now() + 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
        notification_urls,
      };

      endpoint = "/orders";
    } else if (paymentMethod === "credit_card") {
      // ======= PAGAMENTO COM CARTÃO =======
      if (!encryptedCard) {
        return NextResponse.json(
          { error: "Cartão criptografado não fornecido" },
          { status: 400 }
        );
      }

      requestBody = {
        reference_id: pedidoId,
        customer,
        items,
        shipping,
        charges: [
          {
            reference_id: `charge-${pedidoId}`,
            description: `Pedido Love Cosmetics #${pedidoId}`,
            amount: {
              value: Math.round(totalAmount),
              currency: "BRL",
            },
            payment_method: {
              type: "CREDIT_CARD",
              installments,
              capture: true, // captura automática
              card: {
                encrypted: encryptedCard,
              },
            },
          },
        ],
        notification_urls,
      };

      endpoint = "/orders";
    } else {
      return NextResponse.json(
        { error: "Método de pagamento inválido" },
        { status: 400 }
      );
    }

    // Fazer requisição para PagBank
    const pagBankUrl = process.env.PAGBANK_API_URL || "https://sandbox.api.pagseguro.com";
    const token = process.env.PAGBANK_TOKEN_SANDBOX;

    if (!token) {
      logMessage("Token do PagBank não configurado", { error: "PAGBANK_TOKEN_SANDBOX não encontrado" });
      return NextResponse.json(
        { error: "Configuração de pagamento inválida" },
        { status: 500 }
      );
    }

    logMessage("Enviando requisição para PagBank", {
      endpoint,
      paymentMethod,
      pedidoId,
    });

    const response = await fetch(`${pagBankUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData: PagBankOrderResponse | PagBankError =
      await response.json();

    if (!response.ok) {
      logMessage("Erro na API PagBank", {
        status: response.status,
        error: responseData,
      });

      // Atualizar status do pedido
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          status_pagamento: "PAYMENT_FAILED",
          pagbank_error: JSON.stringify(responseData),
        },
      });

      return NextResponse.json(
        {
          error: "Erro ao processar pagamento",
          details: responseData,
        },
        { status: response.status }
      );
    }

    const orderResponse = responseData as PagBankOrderResponse;
    logMessage("Resposta PagBank", orderResponse);

    // Atualizar pedido no banco de dados
    const updateData: any = {
      pagbank_order_id: orderResponse.id,
    };

    if (paymentMethod === "pix") {
      // Para PIX, armazenar QR Code
      const qrCode = orderResponse.qr_codes?.[0];
      if (qrCode) {
        updateData.pix_qr_code = qrCode.text;
        updateData.pix_qr_code_url = qrCode.links.find(
          (l) => l.rel === "QRCODE.PNG"
        )?.href;
        updateData.pix_expiration = qrCode.expiration_date;
        updateData.status_pagamento = "AWAITING_PAYMENT";
      }
    } else {
      // Para cartão, verificar status da cobrança
      const charge = orderResponse.charges?.[0];
      if (charge) {
        updateData.pagbank_charge_id = charge.id;
        updateData.status_pagamento = charge.status;

        // Armazenar informações do cartão (últimos dígitos, bandeira, etc)
        if (charge.payment_method.card) {
          updateData.payment_card_info = JSON.stringify({
            brand: charge.payment_method.card.brand,
            last_digits: charge.payment_method.card.last_digits,
            first_digits: charge.payment_method.card.first_digits,
          });
        }
      }
    }

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: updateData,
    });

    // Retornar resposta apropriada
    if (paymentMethod === "pix") {
      return NextResponse.json({
        success: true,
        orderId: orderResponse.id,
        paymentMethod: "pix",
        qrCode: {
          text: orderResponse.qr_codes?.[0]?.text,
          imageUrl: orderResponse.qr_codes?.[0]?.links.find(
            (l) => l.rel === "QRCODE.PNG"
          )?.href,
          expirationDate: orderResponse.qr_codes?.[0]?.expiration_date,
        },
      });
    } else {
      const charge = orderResponse.charges?.[0];
      return NextResponse.json({
        success: true,
        orderId: orderResponse.id,
        chargeId: charge?.id,
        paymentMethod: "credit_card",
        status: charge?.status,
        message:
          charge?.status === "PAID" || charge?.status === "AUTHORIZED"
            ? "Pagamento aprovado!"
            : "Pagamento em análise",
      });
    }
  } catch (error) {
    logMessage("Erro ao processar pagamento", error);
    return NextResponse.json(
      {
        error: "Erro ao processar pagamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
