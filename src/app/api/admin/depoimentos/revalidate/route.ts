import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";

export async function POST() {
  revalidateTag("depoimentos");
  return NextResponse.json({ success: true, revalidatedAt: new Date().toISOString() });
}
