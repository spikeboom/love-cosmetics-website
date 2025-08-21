import { jwtVerify } from 'jose';

// Configurações de segurança
const JWT_SECRET = process.env.JWT_SECRET_CLIENTE || 'dev-secret-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

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

