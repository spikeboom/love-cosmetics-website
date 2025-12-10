import { freteValue } from "@/utils/frete-value";
import { getBaseURL } from "@/utils/getBaseUrl";
import { createLogger } from "@/utils/logMessage";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, hashPassword, createSession, setSessionCookie } from "@/lib/cliente/auth";
import { validateOrder } from "@/lib/pedido/validate-order";

export async function POST(req: NextRequest) {
  const logMessage = createLogger();
  try {
    const body = await req.json();

    // ============================================================
    // VALIDAÇÃO DE SEGURANÇA - Previne manipulação de preços
    // ============================================================
    const validationResult = await validateOrder(
      body.items,
      body.cupons,
      body.descontos,
      body.total_pedido,
      body.frete_calculado
    );

    if (!validationResult.valid) {
      logMessage("Validação do pedido falhou - carrinho desatualizado ou valores divergentes", {
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

    // Verificar se há cliente logado
    const clienteSession = await getCurrentSession();

    // Cria o registro do pedido no banco (usando valores validados)
    // IMPORTANTE: Banco salva em REAIS, PagBank espera CENTAVOS
    // Os items vêm do frontend com unit_amount em REAIS (ver useCreateOrder.ts)
    // A conversão para centavos é feita em /api/pagbank/create-order
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
        items: body.items, // unit_amount em REAIS
        cupons: body.cupons,
        descontos: descontosSeguro, // Valor calculado pelo servidor
        total_pedido: totalSeguro,  // Valor calculado pelo servidor
        frete_calculado: body.frete_calculado,
        transportadora_nome: body.transportadora_nome,
        transportadora_servico: body.transportadora_servico,
        transportadora_prazo: body.transportadora_prazo ? parseInt(String(body.transportadora_prazo)) : null,
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
      
      try {
        const vinculacao = await prisma.pedidoCliente.create({
          data: {
            pedidoId: pedido.id,
            clienteId: clienteSession.id,
          },
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
      try {
        // Verificar se já existe cliente com este email
        const clienteExistente = await prisma.cliente.findUnique({
          where: { email: body.email },
        });

        
        if (!clienteExistente) {
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
          
          logMessage("Nova conta criada e pedido vinculado", {
            clienteId: novoCliente.id,
            email: novoCliente.email,
          });
        } else {
          // Email já existe - não permitir vinculação automática por segurança
          // Remover o pedido criado e retornar erro
          await prisma.pedido.delete({ where: { id: pedido.id } });
          
          return NextResponse.json({
            error: 'Este email já possui uma conta. Faça login para continuar a compra ou use outro email.',
            code: 'EMAIL_ALREADY_EXISTS'
          }, { status: 409 });
        }
      } catch (error) {
        // Continua sem criar conta, apenas processa o pedido
      }
    } else {
    }
    

    // ============================================================
    // CHECKOUT TRANSPARENTE
    // O pagamento será processado na página /checkout/pagamento
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
