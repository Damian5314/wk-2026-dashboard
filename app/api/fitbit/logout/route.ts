import { NextResponse } from "next/server";
import { clearTokens } from "@/lib/fitbit";

export const dynamic = "force-dynamic";

export async function GET() {
  await clearTokens();
  return NextResponse.redirect(
    new URL("/fitbit", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000")
  );
}
