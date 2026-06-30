import { cookies } from "next/headers";

const FITBIT_CLIENT_ID = process.env.FITBIT_CLIENT_ID!;
const FITBIT_CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET!;
const REDIRECT_URI = process.env.FITBIT_REDIRECT_URI!;

const TOKEN_URL = "https://api.fitbit.com/oauth2/token";

export interface FitbitTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix ms
}

export async function getTokens(): Promise<FitbitTokens | null> {
  const store = await cookies();
  const raw = store.get("fitbit_tokens")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FitbitTokens;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: FitbitTokens) {
  const store = await cookies();
  store.set("fitbit_tokens", JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearTokens() {
  const store = await cookies();
  store.delete("fitbit_tokens");
}

export async function refreshIfNeeded(tokens: FitbitTokens): Promise<FitbitTokens> {
  if (Date.now() < tokens.expires_at - 60_000) return tokens;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${FITBIT_CLIENT_ID}:${FITBIT_CLIENT_SECRET}`).toString("base64")}`,
    },
    body,
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);

  const data = await res.json();
  const fresh: FitbitTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? tokens.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  await saveTokens(fresh);
  return fresh;
}

export async function fitbitFetch(path: string) {
  let tokens = await getTokens();
  if (!tokens) throw new Error("not_authenticated");
  tokens = await refreshIfNeeded(tokens);

  const res = await fetch(`https://api.fitbit.com${path}`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    await clearTokens();
    throw new Error("not_authenticated");
  }

  if (!res.ok) throw new Error(`Fitbit API ${res.status}: ${path}`);
  return res.json();
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: FITBIT_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "activity heartrate sleep profile weight",
    expires_in: "604800",
    state,
  });
  return `https://www.fitbit.com/oauth2/authorize?${params}`;
}
