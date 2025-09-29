import { NextRequest, NextResponse } from "next/server";
import { getCurrentToken } from "@/lib/bling/simple-auth";

export async function GET(req: NextRequest) {
  const token = getCurrentToken();

  return NextResponse.json({
    hasToken: !!token,
    fullToken: token,
    envVar: process.env.BLING_TEMP_TOKEN
  });
}