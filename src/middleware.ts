import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/cliente/auth";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname;

  // ===== PROTEÇÃO ADMIN =====
  const adminPaths = ["/pedidos", "/api/pedidos"];
  const isAdminRoute = adminPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isAdminRoute) {
    const adminToken = request.cookies.get("auth_token")?.value;

    if (!adminToken || adminToken !== "sktE)7381J1") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ===== PROTEÇÃO CLIENTE =====
  const clientePaths = [
    "/minha-conta",
    "/api/cliente/conta",
    "/conta/dashboard",
    "/conta/pedidos",
    "/conta/enderecos",
    "/conta/configuracoes"
  ];
  const isClienteRoute = clientePaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isClienteRoute) {
    const clienteToken = request.cookies.get("cliente_token")?.value;

    if (!clienteToken) {
      // Redirecionar para login com URL de retorno
      const loginUrl = new URL("/conta/entrar", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar se o token é válido
    const session = await verifySession(clienteToken);
    if (!session) {
      // Token inválido, redirecionar para login
      const loginUrl = new URL("/conta/entrar", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      
      // Remover cookie inválido
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("cliente_token", "", {
        maxAge: 0,
        path: "/"
      });
      return response;
    }

    // Adicionar dados da sessão aos headers para uso nas rotas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-cliente-id", session.id);
    requestHeaders.set("x-cliente-email", session.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ===== REDIRECIONAMENTOS =====
  // Redirecionar usuários logados de páginas de auth
  const authPages = ["/conta/entrar", "/conta/cadastrar"];
  if (authPages.includes(pathname)) {
    const clienteToken = request.cookies.get("cliente_token")?.value;
    
    if (clienteToken) {
      const session = await verifySession(clienteToken);
      if (session) {
        // Usuário já está logado, redirecionar para dashboard
        return NextResponse.redirect(new URL("/minha-conta", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Rotas protegidas
    "/pedidos/:path*",
    "/api/pedidos/:path*",
    "/minha-conta/:path*",
    "/conta/:path*",
    "/api/cliente/conta/:path*",
    // Páginas de autenticação
    "/login",
  ],
};
