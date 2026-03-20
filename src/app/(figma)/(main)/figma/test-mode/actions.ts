"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "is_test_user";

export async function toggleTestMode(
  secret: string,
  enable: boolean
): Promise<{ ok: boolean; error?: string }> {
  const expected = process.env.TEST_MODE_SECRET;
  if (!expected || secret !== expected) {
    return { ok: false, error: "Secret incorreto." };
  }

  const cookieStore = await cookies();

  if (enable) {
    cookieStore.set(COOKIE_NAME, "1", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } else {
    cookieStore.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  }

  return { ok: true };
}
