import { NextRequest, NextResponse } from 'next/server';
import { findClienteByCPF } from '@/lib/cliente/session';
import { codigosVerificacao } from '@/lib/cliente/sms-storage';
import twilio from 'twilio';

// Cliente Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Mascarar telefone: (11) 97407-9898 -> (11) *****-9898
function mascararTelefone(telefone: string): string {
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) *****-${limpo.slice(-4)}`;
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ****-${limpo.slice(-4)}`;
  }
  return `*****${limpo.slice(-4)}`;
}

// Gerar código de 6 dígitos (usado apenas em dev quando Twilio falha)
function gerarCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf } = body;

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar cliente pelo CPF
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

    // Tentar enviar via Twilio Verify
    try {
      if (process.env.TWILIO_VERIFY_SERVICE_SID) {
        // Usar Twilio Verify (recomendado)
        await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({
            to: telefoneFormatado,
            channel: 'sms'
          });

        return NextResponse.json({
          success: true,
          message: 'Código enviado com sucesso',
          telefoneMascarado: mascararTelefone(cliente.telefone),
          method: 'verify'
        });
      } else {
        throw new Error('TWILIO_VERIFY_SERVICE_SID não configurado');
      }
    } catch (twilioError) {
      console.error('[SMS Verify] Erro:', twilioError);

      // Fallback para dev: gerar código local
      if (process.env.NODE_ENV === 'development') {
        const codigo = gerarCodigo();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        codigosVerificacao.set(cpf, {
          code: codigo,
          expiresAt,
          attempts: 0
        });

        console.log(`[SMS DEV] Código de verificação: ${codigo}`);

        return NextResponse.json({
          success: true,
          message: 'Código enviado com sucesso',
          telefoneMascarado: mascararTelefone(cliente.telefone),
          method: 'dev',
          _dev: { codigo }
        });
      }

      return NextResponse.json(
        { error: 'Erro ao enviar SMS. Tente novamente.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar código' },
      { status: 500 }
    );
  }
}
