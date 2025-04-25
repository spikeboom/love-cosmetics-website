import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const cupom = url.searchParams.get("cupom");

  if (cupom) {
    console.log("🔖 middleware capturou cupom:", cupom);

    // 1) grava em cookie para todo o site
    const res = NextResponse.redirect(url);
    res.cookies.set("cupom", cupom, { path: "/" });
    res.cookies.set("cupomBackend", cupom, { path: "/" });

    // 2) opcional: remove o param da URL para não reaplicar
    url.searchParams.delete("cupom");
    res.headers.set("location", url.toString());

    return res;
  }

  return NextResponse.next();
}

// roda em TODAS as rotas do front-end
export const config = {
  matcher: "/:path*",
};
