import { NextResponse } from "next/server";
import { GROUPS, KNOCKOUT_MATCHES } from "@/lib/wc2026-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    groups: GROUPS,
    knockout: KNOCKOUT_MATCHES,
    lastUpdated: new Date().toISOString(),
  });
}
