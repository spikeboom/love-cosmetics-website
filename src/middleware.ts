import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const cupom = url.searchParams.get("cupom");

  // 1) Lida com cupom (válido para qualquer rota)
  if (cupom) {
    console.log("🔖 middleware capturou cupom:", cupom);

    const res = NextResponse.redirect(url);
    res.cookies.set("cupom", cupom, { path: "/" });
    res.cookies.set("cupomBackend", cupom, { path: "/" });

    url.searchParams.delete("cupom");
    res.headers.set("location", url.toString());

    return res;
  }

  // 2) Protege rotas específicas
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
