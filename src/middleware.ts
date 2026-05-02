import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWTOnly } from "@/lib/cliente/auth-edge";
import { verifyAdminJWTOnly } from "@/lib/admin/auth-edge";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname;
  

  // ===== PROTEÇÃO ADMIN =====
  // Excluir página de login do admin da proteção
  if (pathname === "/pedidos/login") {
    return NextResponse.next();
  }

  const adminPaths = ["/pedidos", "/api/pedidos", "/dashboard", "/api/admin"];
  const isAdminRoute = adminPaths.some((path) =>
    pathname.startsWith(path),
  );

  if (isAdminRoute) {
    const adminToken = request.cookies.get("auth_token")?.value;

    const adminPayload = adminToken ? await verifyAdminJWTOnly(adminToken) : null;

    if (!adminPayload) {
      const loginUrl = new URL("/pedidos/login", request.url);
      // Preserve the original path + querystring so filters (e.g. /pedidos?tab=funil&funil_*)
      // can be restored after re-login.
      const redirectTarget = pathname + (request.nextUrl.search || "");
      if (redirectTarget && redirectTarget !== "/pedidos/login") {
        loginUrl.searchParams.set("redirect", redirectTarget);
      }
      return NextResponse.redirect(loginUrl);
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
    "/dashboard/:path*",
    "/api/admin/:path*",
    "/minha-conta/:path*",
    "/conta/:path*",
    "/api/cliente/conta/:path*",
  ],
};
