import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Protege rotas específicas
  const protectedPaths = ["/pedidos", "/api/pedidos"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (isProtected) {
    const token = request.cookies.get("auth_token")?.value;

    // Substitua pela lógica real de validação do token
    if (!token || token !== "sktE)7381J1") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*", // Middleware aplicado globalmente
};
