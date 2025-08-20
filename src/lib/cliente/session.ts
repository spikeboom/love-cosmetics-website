import { prisma } from '@/lib/prisma';
import { Cliente } from '@prisma/client';

// Rate limiting simples em memória
const loginAttempts = new Map<string, { count: number; resetAt: Date }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutos
const MAX_ATTEMPTS = 5;

// Verificar rate limit
export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number } {
  const now = new Date();
  const attempt = loginAttempts.get(identifier);
  
  // Se não há registro ou expirou, resetar
  if (!attempt || attempt.resetAt < now) {
    loginAttempts.set(identifier, {
      count: 1,
      resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW)
    });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  // Incrementar tentativas
  attempt.count++;
  
  // Verificar se excedeu o limite
  if (attempt.count > MAX_ATTEMPTS) {
    return { 
      allowed: false, 
      remainingAttempts: 0 
    };
  }
  
  return { 
    allowed: true, 
    remainingAttempts: MAX_ATTEMPTS - attempt.count 
  };
}

// Resetar rate limit após login bem-sucedido
export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Limpar rate limits expirados (executar periodicamente)
export function cleanupRateLimits(): void {
  const now = new Date();
  for (const [key, value] of loginAttempts.entries()) {
    if (value.resetAt < now) {
      loginAttempts.delete(key);
    }
  }
}

// Buscar cliente por email
export async function findClienteByEmail(email: string): Promise<Cliente | null> {
  return prisma.cliente.findUnique({
    where: { 
      email: email.toLowerCase(),
      ativo: true
    }
  });
}

// Buscar cliente por CPF
export async function findClienteByCPF(cpf: string): Promise<Cliente | null> {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  return prisma.cliente.findUnique({
    where: { 
      cpf: cpfLimpo,
      ativo: true
    }
  });
}

// Criar novo cliente
export async function createCliente(data: {
  email: string;
  nome: string;
  sobrenome: string;
  passwordHash: string;
  cpf?: string;
  telefone?: string;
  receberWhatsapp?: boolean;
  receberEmail?: boolean;
}): Promise<Cliente> {
  return prisma.cliente.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      cpf: data.cpf ? data.cpf.replace(/\D/g, '') : null,
      telefone: data.telefone ? data.telefone.replace(/\D/g, '') : null,
    }
  });
}

// Atualizar dados do cliente
export async function updateCliente(
  clienteId: string,
  data: Partial<Omit<Cliente, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>>
): Promise<Cliente> {
  return prisma.cliente.update({
    where: { id: clienteId },
    data: {
      ...data,
      email: data.email ? data.email.toLowerCase() : undefined,
      cpf: data.cpf ? data.cpf.replace(/\D/g, '') : undefined,
      telefone: data.telefone ? data.telefone.replace(/\D/g, '') : undefined,
    }
  });
}

// Atualizar senha do cliente
export async function updateClientePassword(
  clienteId: string,
  passwordHash: string
): Promise<void> {
  await prisma.cliente.update({
    where: { id: clienteId },
    data: { passwordHash }
  });
  
  // Invalidar todas as sessões antigas
  await prisma.sessaoCliente.deleteMany({
    where: { clienteId }
  });
}

// Verificar se email já existe
export async function emailExists(email: string, excludeId?: string): Promise<boolean> {
  const cliente = await prisma.cliente.findFirst({
    where: {
      email: email.toLowerCase(),
      id: excludeId ? { not: excludeId } : undefined
    }
  });
  
  return !!cliente;
}

// Verificar se CPF já existe
export async function cpfExists(cpf: string, excludeId?: string): Promise<boolean> {
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  if (!cpfLimpo) return false;
  
  const cliente = await prisma.cliente.findFirst({
    where: {
      cpf: cpfLimpo,
      id: excludeId ? { not: excludeId } : undefined
    }
  });
  
  return !!cliente;
}

// Buscar pedidos do cliente
export async function getClientePedidos(clienteId: string, limit = 10) {
  return prisma.pedidoCliente.findMany({
    where: { clienteId },
    include: {
      pedido: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}

// Buscar cupons usados pelo cliente
export async function getClienteCupons(clienteId: string) {
  return prisma.cupomUsado.findMany({
    where: { clienteId },
    orderBy: { usadoEm: 'desc' }
  });
}

// Registrar uso de cupom
export async function registrarUsoCupom(
  clienteId: string,
  cupom: string,
  valorDesconto: number,
  pedidoId?: string
): Promise<void> {
  await prisma.cupomUsado.create({
    data: {
      clienteId,
      cupom,
      valorDesconto,
      pedidoId
    }
  });
}

// Vincular pedido ao cliente
export async function vincularPedidoCliente(
  pedidoId: string,
  clienteId: string
): Promise<void> {
  await prisma.pedidoCliente.create({
    data: {
      pedidoId,
      clienteId
    }
  });
}