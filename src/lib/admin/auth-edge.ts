import { jwtVerify } from "jose";

export interface AdminPayload {
  username: string;
  type: "admin";
}

function getSecret() {
  const raw = process.env.ADMIN_JWT_SECRET;
  if (!raw) return null;
  return new TextEncoder().encode(raw);
}

// Edge-compatible JWT verification (no DB access).
export async function verifyAdminJWTOnly(token: string): Promise<AdminPayload | null> {
  const secret = getSecret();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const p = payload as unknown as Partial<AdminPayload>;

    if (p.type !== "admin") return null;
    if (typeof p.username !== "string" || p.username.length === 0) return null;

    return { type: "admin", username: p.username };
  } catch {
    return null;
  }
}

