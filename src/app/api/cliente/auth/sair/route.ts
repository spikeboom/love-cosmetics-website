import { NextRequest, NextResponse } from 'next/server';
import { destroySession, removeSessionCookie } from '@/lib/cliente/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Obter token do cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('cliente_token')?.value;
    
    if (token) {
      // Destruir sessão no banco
      await destroySession(token);
    }
    
    // Remover cookie
    await removeSessionCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro no logout:', error);
    
    // Mesmo com erro, remover o cookie
    await removeSessionCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logout realizado'
    });
  }
}

// Removido método GET para evitar logout acidental via navegação
// Logout deve ser feito apenas via POST