import { NextRequest, NextResponse } from 'next/server';
import { recuperarSenhaSchema, resetSenhaSchema } from '@/lib/cliente/validation';
import { hashPassword, destroyAllSessions } from '@/lib/cliente/auth';
import { findClienteByEmail, updateClientePassword } from '@/lib/cliente/session';
import { prisma } from '@/lib/prisma';
import { ZodError } from 'zod';
import crypto from 'crypto';

// POST - Solicitar recuperação de senha
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar email
    const validatedData = recuperarSenhaSchema.parse(body);
    
    // Buscar cliente
    const cliente = await findClienteByEmail(validatedData.email);
    
    // Sempre retornar sucesso (segurança - não revelar se email existe)
    if (!cliente) {
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
      });
    }
    
    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    
    // Salvar token no banco (expira em 1 hora)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    await prisma.tokenRecuperacao.create({
      data: {
        clienteId: cliente.id,
        token,
        expiresAt
      }
    });
    
    // URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/conta/reset-senha?token=${token}`;
    
    // TODO: Integrar com serviço de email
    // Por enquanto, vamos retornar o link no desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Reset URL:', resetUrl);
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.',
        // Apenas em desenvolvimento:
        _dev: { resetUrl }
      });
    }
    
    // Em produção, enviar email aqui
    // await sendEmail({
    //   to: cliente.email,
    //   subject: 'Recuperação de Senha - Love Cosmetics',
    //   html: `
    //     <h2>Recuperação de Senha</h2>
    //     <p>Olá ${cliente.nome},</p>
    //     <p>Recebemos uma solicitação para redefinir sua senha.</p>
    //     <p>Clique no link abaixo para criar uma nova senha:</p>
    //     <a href="${resetUrl}">Redefinir Senha</a>
    //     <p>Este link expira em 1 hora.</p>
    //     <p>Se você não solicitou esta alteração, ignore este email.</p>
    //   `
    // });
    
    return NextResponse.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }
    
    console.error('Erro na recuperação de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}

// PUT - Resetar senha com token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = resetSenhaSchema.parse(body);
    
    // Buscar token válido
    const tokenRecord = await prisma.tokenRecuperacao.findUnique({
      where: { 
        token: validatedData.token,
      }
    });
    
    // Verificar se token existe, não foi usado e não expirou
    if (!tokenRecord || tokenRecord.usado || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }
    
    // Hash da nova senha
    const passwordHash = await hashPassword(validatedData.novaSenha);
    
    // Atualizar senha e marcar token como usado
    await prisma.$transaction(async (tx) => {
      // Atualizar senha
      await updateClientePassword(tokenRecord.clienteId, passwordHash);
      
      // Marcar token como usado
      await tx.tokenRecuperacao.update({
        where: { id: tokenRecord.id },
        data: { usado: true }
      });
      
      // Invalidar todas as sessões antigas
      await destroyAllSessions(tokenRecord.clienteId);
    });
    
    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso! Faça login com sua nova senha.'
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { 
          error: firstError.message,
          field: firstError.path.join('.')
        },
        { status: 400 }
      );
    }
    
    console.error('Erro ao resetar senha:', error);
    return NextResponse.json(
      { error: 'Erro ao resetar senha' },
      { status: 500 }
    );
  }
}

// GET - Verificar se token é válido
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token não fornecido' },
        { status: 400 }
      );
    }
    
    // Buscar token
    const tokenRecord = await prisma.tokenRecuperacao.findUnique({
      where: { token }
    });
    
    // Verificar validade
    const valid = tokenRecord && 
                  !tokenRecord.usado && 
                  tokenRecord.expiresAt > new Date();
    
    if (!valid || !tokenRecord) {
      return NextResponse.json({
        valid: false,
        error: 'Token inválido ou expirado'
      });
    }

    // Buscar dados do cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: tokenRecord.clienteId },
      select: {
        email: true,
        nome: true
      }
    });

    if (!cliente) {
      return NextResponse.json({
        valid: false,
        error: 'Cliente não encontrado'
      });
    }
    
    return NextResponse.json({
      valid: true,
      email: cliente.email,
      nome: cliente.nome
    });
    
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return NextResponse.json(
      { valid: false, error: 'Erro ao verificar token' },
      { status: 500 }
    );
  }
}