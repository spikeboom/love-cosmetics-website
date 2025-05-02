// app/api/login/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username === "admin" && password === "123love") {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", "sktE)7381J1", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });
    return response;
  }

  return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
}
