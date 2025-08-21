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
    // Verificar JWT usando jose (compatível com edge)
    const { payload } = await jwtVerify(token, secret);
    const clientePayload = payload as unknown as ClientePayload;
    return clientePayload;
  } catch (error) {
    return null;
  }
}

