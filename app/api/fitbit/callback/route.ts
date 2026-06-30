import { NextRequest, NextResponse } from "next/server";
import { saveTokens, FitbitTokens } from "@/lib/fitbit";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const FITBIT_CLIENT_ID = process.env.FITBIT_CLIENT_ID!;
const FITBIT_CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.FITBIT_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/fitbit?error=denied", req.url));
  }

  const store = await cookies();
  const savedState = store.get("fitbit_oauth_state")?.value;
  store.delete("fitbit_oauth_state");

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(new URL("/fitbit?error=invalid_state", req.url));
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  });

  const res = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL("/fitbit?error=token_exchange", req.url));
  }

  const data = await res.json();
  const tokens: FitbitTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await saveTokens(tokens);
  return NextResponse.redirect(new URL("/fitbit", req.url));
}
