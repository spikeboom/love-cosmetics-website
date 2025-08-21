import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Configurações de segurança
const JWT_SECRET = process.env.JWT_SECRET_CLIENTE || 'dev-secret-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);
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

// Verificar apenas o JWT (compatível com edge runtime - sem consulta ao banco)
export async function verifyJWTOnly(token: string): Promise<ClientePayload | null> {
  try {
    console.log('[LOVE-AUTH-LOG] Verificando apenas JWT...');
    // Verificar JWT usando jose (compatível com edge)
    const { payload } = await jwtVerify(token, secret);
    const clientePayload = payload as unknown as ClientePayload;
    console.log('[LOVE-AUTH-LOG] Token JWT válido:', { clienteId: clientePayload.clienteId, email: clientePayload.email });
    return clientePayload;
  } catch (error) {
    console.log('[LOVE-AUTH-LOG] Erro na verificação de JWT:', error);
    return null;
  }
}

// Verificar e obter sessão do token (compatível com edge runtime)
export async function verifySessionEdge(token: string): Promise<ClienteSession | null> {
  try {
    console.log('[LOVE-AUTH-LOG] Verificando token JWT...');
    // Verificar JWT usando jose (compatível com edge)
    const { payload } = await jwtVerify(token, secret);
    const clientePayload = payload as unknown as ClientePayload;
    console.log('[LOVE-AUTH-LOG] Token JWT válido:', { clienteId: clientePayload.clienteId, email: clientePayload.email });
    
    // Buscar sessão no banco
    console.log('[LOVE-AUTH-LOG] Buscando sessão no banco de dados...');
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
    const isExpired = sessao?.expiresAt ? sessao.expiresAt < new Date() : true;
    const isActive = sessao?.cliente?.ativo ?? false;
    
    console.log('[LOVE-AUTH-LOG] Validação de sessão:', { 
      found: !!sessao, 
      expired: isExpired, 
      active: isActive,
      expiresAt: sessao?.expiresAt
    });
    
    if (!sessao || isExpired || !isActive) {
      console.log('[LOVE-AUTH-LOG] Sessão inválida ou expirada');
      return null;
    }
    
    const sessionData = {
      id: sessao.cliente.id,
      email: sessao.cliente.email,
      nome: sessao.cliente.nome,
      sobrenome: sessao.cliente.sobrenome
    };
    
    console.log('[LOVE-AUTH-LOG] Sessão válida retornada:', { clienteId: sessionData.id, email: sessionData.email });
    return sessionData;
  } catch (error) {
    console.log('[LOVE-AUTH-LOG] Erro na verificação de sessão:', error);
    return null;
  }
}

// Obter sessão atual dos cookies (compatível com edge runtime)
export async function getCurrentSessionEdge(): Promise<ClienteSession | null> {
  console.log('[LOVE-AUTH-LOG] Obtendo sessão atual dos cookies...');
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  console.log('[LOVE-AUTH-LOG] Token encontrado nos cookies:', !!token);
  
  if (!token) {
    console.log('[LOVE-AUTH-LOG] Nenhum token encontrado nos cookies');
    return null;
  }
  
  return verifySessionEdge(token);
}