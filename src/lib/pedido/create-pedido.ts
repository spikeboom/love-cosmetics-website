import { prisma } from "@/lib/prisma";
import { createSession, hashPassword, setSessionCookie } from "@/lib/cliente/auth";

type LogMessage = (message: string, data?: unknown) => void;

export async function createPedidoFromBody({
  body,
  totalSeguro,
  descontosSeguro,
}: {
  body: any;
  totalSeguro: number;
  descontosSeguro: number;
}) {
  return prisma.pedido.create({
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
      descontos: descontosSeguro,
      total_pedido: totalSeguro,
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
}

export async function linkPedidoToLoggedCliente({
  pedidoId,
  clienteId,
  body,
}: {
  pedidoId: string;
  clienteId: string;
  body: any;
}) {
  try {
    await prisma.pedidoCliente.create({
      data: {
        pedidoId,
        clienteId,
      },
    });

    await prisma.cliente.update({
      where: { id: clienteId },
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

export async function createAccountForOrderIfRequested({
  pedidoId,
  body,
  userAgent,
  forwardedFor,
  realIp,
  logMessage,
}: {
  pedidoId: string;
  body: any;
  userAgent?: string;
  forwardedFor?: string | null;
  realIp?: string | null;
  logMessage: LogMessage;
}): Promise<{
  clienteId: string | null;
  contaCriada: boolean;
  errorResponse?: { status: number; body: any };
}> {
  try {
    const cpfLimpo = body.cpf?.replace(/\D/g, "");
    const clienteExistente = cpfLimpo
      ? await prisma.cliente.findUnique({
          where: { cpf: cpfLimpo },
        })
      : null;

    if (!clienteExistente) {
      const senhaTemporaria = Math.random().toString(36).slice(-12);
      const senhaHash = await hashPassword(senhaTemporaria);

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

      await prisma.pedidoCliente.create({
        data: {
          pedidoId,
          clienteId: novoCliente.id,
        },
      });

      const ipAddress = forwardedFor ? forwardedFor.split(",")[0] : realIp || undefined;

      const token = await createSession(
        novoCliente.id,
        novoCliente.email,
        userAgent,
        ipAddress
      );

      await setSessionCookie(token);

      logMessage("Nova conta criada e pedido vinculado", {
        clienteId: novoCliente.id,
        email: novoCliente.email,
      });

      return {
        clienteId: novoCliente.id,
        contaCriada: true,
      };
    }

    await prisma.pedido.delete({ where: { id: pedidoId } });

    return {
      clienteId: null,
      contaCriada: false,
      errorResponse: {
        status: 409,
        body: {
          error: "Este email jA­ possui uma conta. FaAa login para continuar a compra ou use outro email.",
          code: "EMAIL_ALREADY_EXISTS",
        },
      },
    };
  } catch (error) {
    return {
      clienteId: null,
      contaCriada: false,
    };
  }
}
