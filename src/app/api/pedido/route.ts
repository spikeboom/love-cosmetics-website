import { createLogger } from "@/utils/logMessage";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/cliente/auth";
import {
  createAccountForOrderIfRequested,
  createPedidoFromBody,
  linkPedidoToLoggedCliente,
} from "@/lib/pedido/create-pedido";
import { validateOrder } from "@/lib/pedido/validate-order";

export async function POST(req: NextRequest) {
  const logMessage = createLogger();
  try {
    const body = await req.json();

    // ============================================================
    // VALIDAAØAŸO DE SEGURANAØA - Previne manipulaAAœo de preAos
    // ============================================================
    const validationResult = await validateOrder(
      body.items,
      body.cupons,
      body.descontos,
      body.total_pedido,
      body.frete_calculado
    );

    if (!validationResult.valid) {
      logMessage("ValidaAAœo do pedido falhou - carrinho desatualizado ou valores divergentes", {
        error: validationResult.error,
        code: validationResult.code,
        email: body.email,
        totalEnviado: body.total_pedido,
        totalCalculado: validationResult.calculatedTotal,
        descontosEnviado: body.descontos,
        descontosCalculado: validationResult.calculatedDescontos,
        items: body.items?.map((i: any) => ({ name: i.name, preco: i.preco, qty: i.quantity })),
        cupons: body.cupons,
      });

      return NextResponse.json(
        {
          error: validationResult.error,
          code: validationResult.code,
        },
        { status: 400 }
      );
    }

    // Usar valores calculados pelo servidor (mais seguro)
    const totalSeguro = validationResult.calculatedTotal;
    const descontosSeguro = validationResult.calculatedDescontos;

    // Verificar se hA­ cliente logado
    const clienteSession = await getCurrentSession();

    // Cria o registro do pedido no banco (usando valores validados)
    // IMPORTANTE: Banco salva em REAIS, PagBank espera CENTAVOS
    // Os items vA¦m do frontend com unit_amount em REAIS (ver useCreateOrder.ts)
    // A conversAœo para centavos Ac feita em /api/pagbank/create-order
    const pedido = await createPedidoFromBody({
      body,
      totalSeguro,
      descontosSeguro,
    });

    // VariA­vel para armazenar cliente (logado ou recAcm criado)
    let clienteParaVincular = clienteSession?.id || null;
    let contaCriada = false;

    // SEMPRE vincular pedido se cliente estiver logado (independente de salvar_minhas_informacoes)
    if (clienteSession) {
      await linkPedidoToLoggedCliente({
        pedidoId: pedido.id,
        clienteId: clienteSession.id,
        body,
      });

      clienteParaVincular = clienteSession.id;
    }
    // Se nAœo hA­ cliente logado mas usuA­rio quer criar conta
    else if (body.salvar_minhas_informacoes) {
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
    } else {
    }

    // ============================================================
    // CHECKOUT TRANSPARENTE
    // O pagamento serA­ processado na pA­gina /checkout/pagamento
    // usando a nova API Orders do PagBank
    // ============================================================

    logMessage("Pedido criado com sucesso (Checkout Transparente)", {
      pedidoId: pedido.id,
      nome: body.nome,
      email: body.email,
      total: pedido.total_pedido,
      frete: pedido.frete_calculado,
    });

    return NextResponse.json(
      {
        message: "Pedido criado com sucesso",
        id: pedido.id,
        // InformaAAæes adicionais sobre conta criada
        contaCriada: contaCriada,
        clienteVinculado: !!clienteParaVincular,
      },
      { status: 201 },
    );
  } catch (error) {
    logMessage("Erro ao criar pedido", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
