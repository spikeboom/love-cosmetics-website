import { getBaseURL } from "@/utils/getBaseUrl";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const pedido = await prisma.pedido.create({
      data: {
        nome: body.nome,
        sobrenome: body.sobrenome,
        email: body.email,
        cpf: body.cpf,
        telefone: body.telefone,
        data_nascimento: new Date(body.data_nascimento),
        pais: body.pais,
        cep: body.cep,
        endereco: body.endereco,
        numero: body.numero,
        complemento: body.complemento,
        bairro: body.bairro,
        cidade: body.cidade,
        estado: body.estado,
        salvar_minhas_informacoes: body.salvar_minhas_informacoes,
        aceito_receber_whatsapp: body.aceito_receber_whatsapp,
        destinatario: body.destinatario,
      },
    });

    console.log({
      pedido,
    });

    console.log({ getBaseURL: getBaseURL({ STAGE: "PRODUCTION" }) });

    const bodyCheckoutPagSeguro = {
      customer: {
        phone: {
          country: "+55",
          area: body.telefone.substring(0, 2),
          number: body.telefone.substring(2),
        },
        name: `${body.nome} ${body.sobrenome}`,
        email: body.email,
        tax_id: body.cpf,
      },
      reference_id: pedido.id,
      customer_modifiable: true,
      items: body.items,
      redirect_url: getBaseURL({ STAGE: "PRODUCTION" }),
      notification_urls: [
        "https://www.lovecosmeticos.xyz/api/checkout_notification",
      ],
      payment_notification_urls: [
        "https://www.lovecosmeticos.xyz/api/payment_notification",
      ],
    };

    console.dir({ bodyCheckoutPagSeguro }, { depth: null, colors: true });

    const fetchResponse = await fetch(
      "https://sandbox.api.pagseguro.com/checkouts",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN_DEV}`,
          accept: "*/*",
        },
        body: JSON.stringify(bodyCheckoutPagSeguro),
      },
    );
    const responseData = await fetchResponse.json();
    console.log(responseData);

    if (!fetchResponse.ok) {
      const errorResponse = await responseData.json();
      console.error("Erro na API PagSeguro:", errorResponse);
      return NextResponse.json(
        { error: "Erro ao processar pagamento", details: errorResponse },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Pedido criado com sucesso",
        id: pedido.id,
        link: responseData.links.find(
          (link: { rel: string }) => link.rel === "PAY",
        )?.href,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    // Se preferir receber os parâmetros via query string, pode usar:
    // const { searchParams } = new URL(req.url);
    // const page = Number(searchParams.get("page") || 1);
    // const pageSize = Number(searchParams.get("pageSize") || 10);

    // Caso queira receber o JSON no corpo da requisição:
    const { page = 1, pageSize = 10 } = await req.json();
    const offset = (page - 1) * pageSize;

    // Consulta raw que retorna os pedidos com os pagamentos agregados em um array
    const pedidosComPagamentos = await prisma.$queryRaw`
      SELECT
        p.*,
        (
          SELECT json_agg(sp.*)
          FROM "StatusPagamento" sp
          WHERE sp.info->>'reference_id' = p.id
        ) AS pagamentos
      FROM "Pedido" p
      ORDER BY p."createdAt" DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    return NextResponse.json(pedidosComPagamentos);
  } catch (error) {
    console.error("Erro ao buscar pedidos com pagamentos:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 },
    );
  }
}
