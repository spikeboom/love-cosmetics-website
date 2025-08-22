import { freteValue } from "@/utils/frete-value";
import { getBaseURL } from "@/utils/getBaseUrl";
import { createLogger } from "@/utils/logMessage";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, hashPassword, createSession, setSessionCookie } from "@/lib/cliente/auth";

export async function POST(req: NextRequest) {
  const logMessage = createLogger();
  try {
    const body = await req.json();

    // Verificar se há cliente logado
    const clienteSession = await getCurrentSession();

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
        ga_session_number: body.ga_session_number,
        ga_session_id: body.ga_session_id,
      },
    });

    
    // Variável para armazenar cliente (logado ou recém criado)
    let clienteParaVincular = clienteSession?.id || null;
    let contaCriada = false;

    // SEMPRE vincular pedido se cliente estiver logado (independente de salvar_minhas_informacoes)
    if (clienteSession) {
      logMessage("[LOG-LOVE] Cliente logado detectado", {
        clienteId: clienteSession.id,
        email: clienteSession.email,
        pedidoId: pedido.id,
        salvarMinhasInformacoes: body.salvar_minhas_informacoes,
      });
      
      try {
        const vinculacao = await prisma.pedidoCliente.create({
          data: {
            pedidoId: pedido.id,
            clienteId: clienteSession.id,
          },
        });
        
        logMessage("[LOG-LOVE] Pedido vinculado ao cliente logado com sucesso", {
          vinculacaoId: vinculacao.id,
          clienteId: clienteSession.id,
          pedidoId: pedido.id,
        });
        
        clienteParaVincular = clienteSession.id;
        
        // Atualizar dados do cliente se necessário
        await prisma.cliente.update({
          where: { id: clienteSession.id },
          data: {
            cep: body.cep,
            endereco: body.endereco,
            numero: body.numero,
            complemento: body.complemento,
            bairro: body.bairro,
            cidade: body.cidade,
            estado: body.estado,
            telefone: body.telefone,
            receberWhatsapp: body.aceito_receber_whatsapp,
          },
        });
        
      } catch (error) {
      }
    } 
    // Se não há cliente logado mas usuário quer criar conta
    else if (body.salvar_minhas_informacoes) {
      logMessage("[LOG-LOVE] Usuário não logado marcou 'salvar minhas informações'", {
        email: body.email,
        nome: body.nome,
        sobrenome: body.sobrenome,
        cpf: body.cpf,
      });
      
      try {
        // Verificar se já existe cliente com este email
        const clienteExistente = await prisma.cliente.findUnique({
          where: { email: body.email },
        });
        
        logMessage("[LOG-LOVE] Verificação de email existente", {
          email: body.email,
          emailJaExiste: !!clienteExistente,
          clienteId: clienteExistente?.id || null,
        });

        
        if (!clienteExistente) {
          logMessage("[LOG-LOVE] Email não existe, criando nova conta", {
            email: body.email,
          });
          
          // Gerar senha temporária (será enviada por email)
          const senhaTemporaria = Math.random().toString(36).slice(-12);
          const senhaHash = await hashPassword(senhaTemporaria);

          // Criar nova conta
          const novoCliente = await prisma.cliente.create({
            data: {
              email: body.email,
              nome: body.nome,
              sobrenome: body.sobrenome,
              cpf: body.cpf,
              telefone: body.telefone,
              passwordHash: senhaHash,
              cep: body.cep,
              endereco: body.endereco,
              numero: body.numero,
              complemento: body.complemento,
              bairro: body.bairro,
              cidade: body.cidade,
              estado: body.estado,
              receberWhatsapp: body.aceito_receber_whatsapp,
              receberEmail: true,
            },
          });
          
          
          // Vincular pedido ao novo cliente
          const vinculacaoNovoCliente = await prisma.pedidoCliente.create({
            data: {
              pedidoId: pedido.id,
              clienteId: novoCliente.id,
            },
          });
          

          // Criar sessão automática para o novo cliente
          const userAgent = req.headers.get('user-agent') || undefined;
          const forwarded = req.headers.get('x-forwarded-for');
          const realIp = req.headers.get('x-real-ip');
          const ipAddress = forwarded ? forwarded.split(',')[0] : realIp || undefined;
          
          const token = await createSession(
            novoCliente.id,
            novoCliente.email,
            userAgent,
            ipAddress
          );
          
          await setSessionCookie(token);
          
          clienteParaVincular = novoCliente.id;
          contaCriada = true;
          
          logMessage("[LOG-LOVE] Nova conta criada com sucesso e pedido vinculado", {
            clienteId: novoCliente.id,
            email: novoCliente.email,
            pedidoId: pedido.id,
            senhaTemporaria: senhaTemporaria, // TODO: Enviar por email
          });
        } else {
          // Email já existe - não permitir vinculação automática por segurança
          logMessage("[LOG-LOVE] ATENÇÃO: Email já existe! Usuário não logado tentou salvar informações", {
            email: body.email,
            clienteExistenteId: clienteExistente.id,
            pedidoId: pedido.id,
            action: "BLOQUEANDO_CRIACAO_CONTA",
          });
          
          // Remover o pedido criado e retornar erro
          await prisma.pedido.delete({ where: { id: pedido.id } });
          
          logMessage("[LOG-LOVE] Pedido removido por segurança - email já existe", {
            pedidoId: pedido.id,
            email: body.email,
          });
          
          return NextResponse.json({
            error: 'Este email já possui uma conta. Faça login para continuar a compra ou use outro email.',
            code: 'EMAIL_ALREADY_EXISTS'
          }, { status: 409 });
        }
      } catch (error) {
        // Continua sem criar conta, apenas processa o pedido
        logMessage("[LOG-LOVE] Erro ao processar 'salvar minhas informações'", {
          email: body.email,
          error: error,
        });
      }
    } else {
      logMessage("[LOG-LOVE] Usuário não logado e NÃO marcou 'salvar minhas informações'", {
        email: body.email,
        pedidoId: pedido.id,
      });
    }
    

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
      additional_amount: freteValue * 100,
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
        // Informações adicionais sobre conta criada
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
