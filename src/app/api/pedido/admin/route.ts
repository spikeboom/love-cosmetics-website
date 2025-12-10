/**
 * API para criar pedidos pelo painel admin
 *
 * POST /api/pedido/admin
 *
 * Cria pedido no banco e gera link de pagamento PagBank
 * Suporta pedidos cortesia (sem link de pagamento)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPagBankCheckoutLink,
  formatCustomerForCheckout,
  formatItemsForCheckout,
} from "@/lib/pagbank/create-checkout-link";

interface ItemPedido {
  id: string;
  documentId?: string;
  nome: string;
  preco: number;
  quantity: number;
  bling_number?: string;
  imagem?: string;
}

interface DadosCliente {
  nome: string;
  sobrenome: string;
  email: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  pais?: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface RequestBody {
  // Dados do cliente
  cliente: DadosCliente;

  // Items do pedido
  items: ItemPedido[];

  // Frete
  frete: {
    valor: number;
    transportadora_nome?: string;
    transportadora_servico?: string;
    transportadora_prazo?: number;
  };

  // Desconto
  desconto: {
    tipo: "cupom" | "manual" | "nenhum";
    cupom_codigo?: string;
    valor?: number; // Em reais
    porcentagem?: number;
  };

  // Flags
  cortesia: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();

    const { cliente, items, frete, desconto, cortesia } = body;

    // Validações básicas
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum produto selecionado" },
        { status: 400 }
      );
    }

    if (!cliente.nome || !cliente.email || !cliente.cpf || !cliente.telefone) {
      return NextResponse.json(
        { error: "Dados do cliente incompletos" },
        { status: 400 }
      );
    }

    // Calcular subtotal
    const subtotal = items.reduce(
      (acc, item) => acc + item.preco * item.quantity,
      0
    );

    // Calcular desconto
    let descontoValor = 0;
    let cuponsAplicados: string[] = [];

    if (desconto.tipo === "cupom" && desconto.cupom_codigo) {
      // Buscar cupom no Strapi (opcional - admin pode forçar)
      cuponsAplicados = [desconto.cupom_codigo];
      // Por simplicidade, usar valor manual se informado
      descontoValor = desconto.valor || 0;
    } else if (desconto.tipo === "manual") {
      if (desconto.porcentagem) {
        descontoValor = subtotal * (desconto.porcentagem / 100);
      } else if (desconto.valor) {
        descontoValor = desconto.valor;
      }
    }

    // Calcular total
    const freteValor = frete.valor || 0;
    let totalPedido = subtotal - descontoValor + freteValor;

    // Se cortesia, zera o total
    if (cortesia) {
      totalPedido = 0;
      descontoValor = subtotal + freteValor; // Desconto total
    }

    // Formatar items para salvar no banco
    // unit_amount é salvo em REAIS (não centavos) para consistência na exibição
    const itemsParaSalvar = items.map((item) => ({
      reference_id: item.documentId || String(item.id),
      name: item.nome,
      quantity: item.quantity,
      preco: item.preco,
      unit_amount: item.preco,
      bling_number: item.bling_number || null,
      image_url: item.imagem || null,
    }));

    // Criar pedido no banco
    const pedido = await prisma.pedido.create({
      data: {
        nome: cliente.nome,
        sobrenome: cliente.sobrenome,
        email: cliente.email,
        cpf: cliente.cpf.replace(/\D/g, ""),
        telefone: cliente.telefone.replace(/\D/g, ""),
        data_nascimento: new Date(cliente.data_nascimento),
        pais: cliente.pais || "Brasil",
        cep: cliente.cep.replace(/\D/g, ""),
        endereco: cliente.endereco,
        numero: cliente.numero,
        complemento: cliente.complemento || null,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        estado: cliente.estado,
        items: itemsParaSalvar,
        cupons: cuponsAplicados,
        descontos: Math.round(descontoValor * 100), // Salvar em centavos
        total_pedido: totalPedido,
        frete_calculado: freteValor,
        transportadora_nome: frete.transportadora_nome || null,
        transportadora_servico: frete.transportadora_servico || null,
        transportadora_prazo: frete.transportadora_prazo
          ? parseInt(String(frete.transportadora_prazo), 10)
          : null,
        salvar_minhas_informacoes: false,
        aceito_receber_whatsapp: false,
        destinatario: null,
        ga_session_number: null,
        ga_session_id: null,
        // Status inicial
        status_pagamento: cortesia ? "CORTESIA" : "PENDING",
      },
    });

    console.log("[Admin Pedido] Pedido criado:", pedido.id);

    // Se cortesia, não gera link
    if (cortesia) {
      return NextResponse.json(
        {
          success: true,
          message: "Pedido cortesia criado com sucesso!",
          pedidoId: pedido.id,
          cortesia: true,
          total: 0,
        },
        { status: 201 }
      );
    }

    // Gerar link de pagamento
    const customer = formatCustomerForCheckout({
      nome: cliente.nome,
      sobrenome: cliente.sobrenome,
      email: cliente.email,
      cpf: cliente.cpf,
      telefone: cliente.telefone,
    });

    const itemsForCheckout = formatItemsForCheckout(
      items.map((item) => ({
        id: item.documentId || String(item.id),
        nome: item.nome,
        preco: item.preco,
        quantity: item.quantity,
      }))
    );

    const linkResult = await createPagBankCheckoutLink({
      pedidoId: pedido.id,
      items: itemsForCheckout,
      customer,
      frete: freteValor,
      descontos: Math.round(descontoValor * 100), // Em centavos
    });

    if (!linkResult.success) {
      // Se falhou, remove o pedido criado
      await prisma.pedido.delete({ where: { id: pedido.id } });

      return NextResponse.json(
        {
          error: "Erro ao gerar link de pagamento",
          details: linkResult.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pedido criado com sucesso!",
        pedidoId: pedido.id,
        link: linkResult.link,
        total: totalPedido,
        cortesia: false,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("[Admin Pedido] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}
