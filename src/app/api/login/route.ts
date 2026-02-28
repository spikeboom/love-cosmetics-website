// app/api/login/route.ts
import argon2 from "argon2";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COOKIE_NAME = "auth_token";
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function isProductionEnv() {
  return process.env.NODE_ENV === "production" || process.env.STAGE === "PRODUCTION";
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const passwordPlain = process.env.ADMIN_PASSWORD;
  const jwtSecretRaw = process.env.ADMIN_JWT_SECRET;

  // Fail-fast in production if auth is not configured.
  if (isProductionEnv() && (!jwtSecretRaw || (!passwordHash && !passwordPlain))) {
    return NextResponse.json({ error: "Configuracao de admin invalida" }, { status: 500 });
  }

  // If credentials are missing, deny (better than silently using hardcoded values).
  if (!jwtSecretRaw || (!passwordHash && !passwordPlain)) {
    return NextResponse.json({ error: "Configuracao de admin nao configurada" }, { status: 500 });
  }

  const usernameOk = username === expectedUsername;

  let passwordOk = false;
  if (passwordHash) {
    try {
      passwordOk = await argon2.verify(passwordHash, password);
    } catch {
      passwordOk = false;
    }
  } else if (passwordPlain) {
    passwordOk = password === passwordPlain;
  }

  if (!usernameOk || !passwordOk) {
    return NextResponse.json({ error: "Credenciais invalidas" }, { status: 401 });
  }

  const secret = new TextEncoder().encode(jwtSecretRaw);
  const token = await new SignJWT({ type: "admin", username: expectedUsername })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProductionEnv(),
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_SECONDS,
  });

  return response;
}

