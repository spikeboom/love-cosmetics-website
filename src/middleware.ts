import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWTOnly } from "@/lib/cliente/auth-edge";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname;
  

  // ===== PROTEÇÃO ADMIN =====
  // Excluir página de login do admin da proteção
  if (pathname === "/pedidos/login") {
    return NextResponse.next();
  }

  const adminPaths = ["/pedidos", "/api/pedidos"];
  const isAdminRoute = adminPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isAdminRoute) {
    const adminToken = request.cookies.get("auth_token")?.value;

    if (!adminToken || adminToken !== "sktE)7381J1") {
      return NextResponse.redirect(new URL("/pedidos/login", request.url));
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

    // Verificar se o token é válido (apenas JWT, sem consulta ao banco)
    const jwtPayload = await verifyJWTOnly(clienteToken);
    
    if (!jwtPayload) {
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

    // Adicionar dados do JWT aos headers para uso nas rotas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-cliente-id", jwtPayload.clienteId);
    requestHeaders.set("x-cliente-email", jwtPayload.email);

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
      const jwtPayload = await verifyJWTOnly(clienteToken);
      if (jwtPayload) {
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
  ],
};
