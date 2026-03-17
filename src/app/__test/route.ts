import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "is_test_user";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.TEST_MODE_SECRET;
  if (!secret) return false;
  const provided = req.nextUrl.searchParams.get("secret");
  return typeof provided === "string" && provided.length > 0 && provided === secret;
}

export async function GET(req: NextRequest) {
  // Keep this route effectively invisible without a secret.
  if (!isAuthorized(req)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const off = req.nextUrl.searchParams.get("off");
  const shouldDisable = off === "1" || off === "true";

  const res = new NextResponse(
    shouldDisable ? "test_mode=off\n" : "test_mode=on\n",
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );

  if (shouldDisable) {
    res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  } else {
    res.cookies.set(COOKIE_NAME, "1", {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return res;
}

