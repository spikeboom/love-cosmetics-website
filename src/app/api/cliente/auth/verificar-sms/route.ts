import { NextRequest, NextResponse } from 'next/server';
import { findClienteByCPF } from '@/lib/cliente/session';
import { codigosVerificacao } from '@/lib/cliente/sms-storage';
import { prisma } from '@/lib/prisma';
import twilio from 'twilio';
import crypto from 'crypto';

// Cliente Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, codigo } = body;

    if (!cpf || !codigo) {
      return NextResponse.json(
        { error: 'CPF e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar cliente para pegar o telefone
    const cliente = await findClienteByCPF(cpf);

    if (!cliente) {
      return NextResponse.json(
        { error: 'CPF não encontrado' },
        { status: 404 }
      );
    }

    if (!cliente.telefone) {
      return NextResponse.json(
        { error: 'Nenhum telefone cadastrado para este CPF' },
        { status: 400 }
      );
    }

    const telefoneFormatado = `+55${cliente.telefone.replace(/\D/g, '')}`;

    // Tentar verificar via Twilio Verify
    if (process.env.TWILIO_VERIFY_SERVICE_SID) {
      try {
        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({
            to: telefoneFormatado,
            code: codigo
          });

        if (verification.status !== 'approved') {
          return NextResponse.json(
            { error: 'Código incorreto. Tente novamente.' },
            { status: 400 }
          );
        }

        console.log(`[SMS Verify] Código verificado para ${cliente.telefone}`);

      } catch (twilioError: any) {
        console.error('[SMS Verify] Erro na verificação:', twilioError);

        // Código expirado ou não encontrado
        if (twilioError.code === 20404) {
          return NextResponse.json(
            { error: 'Código expirado. Solicite um novo código.' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { error: 'Erro ao verificar código. Tente novamente.' },
          { status: 500 }
        );
      }
    } else {
      // Fallback para dev: verificar código local
      const registro = codigosVerificacao.get(cpf);

      if (!registro) {
        return NextResponse.json(
          { error: 'Código expirado ou não encontrado. Solicite um novo código.' },
          { status: 400 }
        );
      }

      if (registro.expiresAt < new Date()) {
        codigosVerificacao.delete(cpf);
        return NextResponse.json(
          { error: 'Código expirado. Solicite um novo código.' },
          { status: 400 }
        );
      }

      if (registro.attempts >= 3) {
        codigosVerificacao.delete(cpf);
        return NextResponse.json(
          { error: 'Muitas tentativas incorretas. Solicite um novo código.' },
          { status: 400 }
        );
      }

      if (registro.code !== codigo) {
        registro.attempts++;
        const tentativasRestantes = 3 - registro.attempts;

        return NextResponse.json(
          {
            error: `Código incorreto. ${tentativasRestantes} ${tentativasRestantes === 1 ? 'tentativa restante' : 'tentativas restantes'}.`,
            tentativasRestantes
          },
          { status: 400 }
        );
      }

      // Código válido - remover do mapa
      codigosVerificacao.delete(cpf);
      console.log(`[SMS DEV] Código verificado para CPF ${cpf}`);
    }

    // Gerar token de reset (válido por 10 minutos)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Salvar token no banco de dados
    await prisma.tokenRecuperacao.create({
      data: {
        clienteId: cliente.id,
        token,
        expiresAt: tokenExpiresAt,
      }
    });

    console.log(`[Token Reset] Criado para cliente ${cliente.id}, expira em ${tokenExpiresAt}`);

    return NextResponse.json({
      success: true,
      message: 'Código verificado com sucesso',
      token, // Token para usar na próxima etapa (reset de senha)
      cliente: {
        nome: cliente.nome,
        email: cliente.email?.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mascarar email
      }
    });

  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar código' },
      { status: 500 }
    );
  }
}

