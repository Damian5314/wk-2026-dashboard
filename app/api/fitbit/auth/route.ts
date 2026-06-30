import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/fitbit";
import { cookies } from "next/headers";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("fitbit_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(buildAuthUrl(state));
}
