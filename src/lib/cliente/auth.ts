import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Configurações de segurança
const JWT_SECRET = process.env.JWT_SECRET_CLIENTE || 'dev-secret-change-in-production';
const TOKEN_EXPIRY_DAYS = 30;
const COOKIE_NAME = 'cliente_token';

// Tipos
export interface ClientePayload {
  clienteId: string;
  email: string;
  type: 'cliente';
}

export interface ClienteSession {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
}

// Hash de senha usando Argon2id
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

// Verificar senha
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

// Criar nova sessão
export async function createSession(
  clienteId: string, 
  email: string,
  userAgent?: string,
  ipAddress?: string
): Promise<string> {
  // Gerar token JWT
  const payload: ClientePayload = {
    clienteId,
    email,
    type: 'cliente'
  };
  
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${TOKEN_EXPIRY_DAYS}d`
  });
  
  // Salvar sessão no banco
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);
  
  await prisma.sessaoCliente.create({
    data: {
      token,
      clienteId,
      expiresAt,
      userAgent,
      ipAddress
    }
  });
  
  // Limpar sessões antigas do cliente (manter apenas as 5 mais recentes)
  const sessoes = await prisma.sessaoCliente.findMany({
    where: { clienteId },
    orderBy: { createdAt: 'desc' },
    skip: 5,
    select: { id: true }
  });
  
  if (sessoes.length > 0) {
    await prisma.sessaoCliente.deleteMany({
      where: {
        id: { in: sessoes.map(s => s.id) }
      }
    });
  }
  
  return token;
}

// Verificar e obter sessão do token
export async function verifySession(token: string): Promise<ClienteSession | null> {
  try {
    // Verificar JWT
    const payload = jwt.verify(token, JWT_SECRET) as ClientePayload;
    
    // Buscar sessão no banco
    const sessao = await prisma.sessaoCliente.findUnique({
      where: { token },
      include: {
        cliente: {
          select: {
            id: true,
            email: true,
            nome: true,
            sobrenome: true,
            ativo: true
          }
        }
      }
    });
    
    // Validar sessão
    if (!sessao || sessao.expiresAt < new Date() || !sessao.cliente.ativo) {
      return null;
    }
    
    return {
      id: sessao.cliente.id,
      email: sessao.cliente.email,
      nome: sessao.cliente.nome,
      sobrenome: sessao.cliente.sobrenome
    };
  } catch {
    return null;
  }
}

// Obter sessão atual dos cookies
export async function getCurrentSession(): Promise<ClienteSession | null> {
  
  const cookieStore = await cookies();
  
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  const session = await verifySession(token);
  
  return session;
}

// Destruir sessão
export async function destroySession(token: string): Promise<void> {
  await prisma.sessaoCliente.delete({
    where: { token }
  }).catch(() => {}); // Ignorar se não existir
}

// Destruir todas as sessões de um cliente
export async function destroyAllSessions(clienteId: string): Promise<void> {
  await prisma.sessaoCliente.deleteMany({
    where: { clienteId }
  });
}

// Definir cookie de sessão
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * TOKEN_EXPIRY_DAYS, // 30 dias em segundos
    path: '/'
  });
}

// Remover cookie de sessão
export async function removeSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });
}

// Limpar sessões expiradas (executar periodicamente)
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.sessaoCliente.deleteMany({
    where: {
      expiresAt: { lt: new Date() }
    }
  });
  
  return result.count;
}