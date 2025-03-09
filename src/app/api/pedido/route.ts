import { getBaseURL } from "@/utils/getBaseUrl";
import { createLogger } from "@/utils/logMessage";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const logMessage = createLogger();
  try {
    const body = await req.json();

    // Cria o registro do pedido no banco
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
        items: body.items,
        cupons: body.cupons,
        descontos: body.descontos,
        total_pedido: body.total_pedido,
        salvar_minhas_informacoes: body.salvar_minhas_informacoes,
        aceito_receber_whatsapp: body.aceito_receber_whatsapp,
        destinatario: body.destinatario,
      },
    });

    logMessage("Pedido Criado", pedido);
    logMessage("Base URL", getBaseURL({ STAGE: "PRODUCTION" }));

    // Remove quaisquer caracteres não numéricos de telefone e CPF
    const cleanedPhone = body.telefone.replace(/\D/g, "");
    const cleanedCPF = body.cpf.replace(/\D/g, "");

    const bodyCheckoutPagSeguro = {
      customer: {
        phone: {
          country: "+55",
          area: cleanedPhone.substring(0, 2),
          number: cleanedPhone.substring(2),
        },
        name: `${body.nome} ${body.sobrenome}`,
        email: body.email,
        tax_id: cleanedCPF,
      },
      ...(body.descontos ? { discount_amount: body.descontos } : {}),
      additional_amount: 15 * 100,
      reference_id: pedido.id,
      customer_modifiable: true,
      items: body.items,
      redirect_url: `${getBaseURL({ STAGE: "PRODUCTION" })}/confirmacao`,
      notification_urls: [
        "https://www.lovecosmetics.com.br/api/checkout_notification",
      ],
      payment_notification_urls: [
        "https://www.lovecosmetics.com.br/api/payment_notification",
      ],
    };

    logMessage("Body Checkout PagSeguro", bodyCheckoutPagSeguro);

    const fetchResponse = await fetch("https://api.pagseguro.com/checkouts", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${process.env.PAGSEGURO_TOKEN_DEV}`,
        accept: "*/*",
      },
      body: JSON.stringify(bodyCheckoutPagSeguro),
    });

    const responseData = await fetchResponse.json();
    logMessage("Resposta PagSeguro", responseData);

    // Se a requisição falhar, remove o pedido criado
    if (!fetchResponse.ok) {
      logMessage("Erro na API PagSeguro", responseData);
      await prisma.pedido.delete({ where: { id: pedido.id } });
      return NextResponse.json(
        { error: "Erro ao processar pagamento", details: responseData },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Pedido criado com sucesso",
        id: pedido.id,
        // @ts-ignore
        link: responseData.links.find((link) => link.rel === "PAY")?.href,
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
