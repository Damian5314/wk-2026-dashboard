import { NextResponse } from "next/server";
import { GROUPS, KNOCKOUT_MATCHES, Group, KnockoutMatch, Standing, MatchResult, Team } from "@/lib/wc2026-data";

export const dynamic = "force-dynamic";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

async function apiFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": API_KEY! },
    next: { revalidate: 10800 }, // 3 uur → max ~8 API-calls per dag
  });
  if (!res.ok) throw new Error(`football-data.org ${res.status}: ${path}`);
  return res.json();
}

function mapStatus(s: string): MatchResult["status"] {
  if (s === "FINISHED") return "FINISHED";
  if (s === "IN_PLAY" || s === "PAUSED" || s === "HALFTIME") return "LIVE";
  return "SCHEDULED";
}

// TLA (football-data.org) → ISO 3166-1 alpha-2 for correct flag emoji
const TLA_TO_ALPHA2: Record<string, string> = {
  MEX: "MX", KOR: "KR", CZE: "CZ", RSA: "ZA",
  SUI: "CH", CAN: "CA", QAT: "QA", BIH: "BA",
  SCO: "GB", BRA: "BR", MAR: "MA", HAI: "HT",
  USA: "US", AUS: "AU", TUR: "TR", PAR: "PY",
  GER: "DE", CIV: "CI", ECU: "EC", CUW: "CW",
  SWE: "SE", JPN: "JP", NED: "NL", TUN: "TN",
  POR: "PT", ARG: "AR", CHI: "CL", ALB: "AL",
  ESP: "ES", CMR: "CM", NZL: "NZ", UKR: "UA",
  FRA: "FR", SEN: "SN", COL: "CO", VEN: "VE",
  ENG: "GB", COD: "CD", PAN: "PA", IRN: "IR",
  URU: "UY", NGA: "NG", SVK: "SK", IND: "IN",
  BEL: "BE", SAU: "SA", AUT: "AT", CRC: "CR",
  NOR: "NO", EGY: "EG", JOR: "JO", ALG: "DZ",
  CPV: "CV", UZB: "UZ", GHA: "GH", CRO: "HR",
};

// Dutch team name overrides keyed by TLA
const TLA_TO_NL: Record<string, string> = {
  MEX: "Mexico",       KOR: "Zuid-Korea",    CZE: "Tsjechië",      RSA: "Zuid-Afrika",
  SUI: "Zwitserland",  CAN: "Canada",        QAT: "Qatar",          BIH: "Bosnië-Herz.",
  SCO: "Schotland",    BRA: "Brazilië",      MAR: "Marokko",        HAI: "Haïti",
  USA: "Ver. Staten",  AUS: "Australië",     TUR: "Turkije",        PAR: "Paraguay",
  GER: "Duitsland",    CIV: "Ivoorkust",     ECU: "Ecuador",        CUW: "Curaçao",
  SWE: "Zweden",       JPN: "Japan",         NED: "Nederland",      TUN: "Tunesië",
  POR: "Portugal",     ARG: "Argentinië",    CHI: "Chili",          ALB: "Albanië",
  ESP: "Spanje",       CMR: "Kameroen",      NZL: "Nieuw-Zeeland",  UKR: "Oekraïne",
  FRA: "Frankrijk",    SEN: "Senegal",       COL: "Colombia",       VEN: "Venezuela",
  ENG: "Engeland",     COD: "DR Congo",      PAN: "Panama",         IRN: "Iran",
  URU: "Uruguay",      NGA: "Nigeria",       SVK: "Slowakije",      IND: "India",
  BEL: "België",       SAU: "Saoedi-Arabië", AUT: "Oostenrijk",     CRC: "Costa Rica",
  NOR: "Noorwegen",    EGY: "Egypte",        JOR: "Jordanië",       ALG: "Algerije",
  CPV: "Kaapverdië",   UZB: "Oezbekistan",   GHA: "Ghana",          CRO: "Kroatië",
};

function flagEmoji(alpha2: string): string {
  const offset = 0x1F1E6 - 65;
  return [...alpha2.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join("");
}

function mapTeam(t: { name: string; shortName: string; tla: string }): Team {
  const tla = t.tla?.toUpperCase() ?? "";
  const alpha2 = TLA_TO_ALPHA2[tla] ?? tla.slice(0, 2);
  return {
    name: TLA_TO_NL[tla] ?? t.shortName ?? t.name,
    flag: flagEmoji(alpha2),
    code: tla,
  };
}

function buildGroups(standingsData: any, matchesData: any): Group[] {
  const groups: Group[] = [];

  for (const standing of standingsData.standings) {
    if (standing.type !== "TOTAL") continue;

    // API returns "GROUP_A" or "Group A" — extract single letter
    const raw = standing.group ?? "";
    const groupLetter = raw.replace(/^GROUP_/i, "").replace(/^Group\s*/i, "").trim() || "?";
    const groupName = `Groep ${groupLetter}`;

    const standings: Standing[] = standing.table.map((row: any) => ({
      team: mapTeam(row.team),
      played: row.playedGames,
      won: row.won,
      drawn: row.draw,
      lost: row.lost,
      gf: row.goalsFor,
      ga: row.goalsAgainst,
      gd: row.goalDifference,
      points: row.points,
    }));

    const groupMatches: MatchResult[] = matchesData.matches
      .filter((m: any) => m.group === standing.group)
      .map((m: any) => ({
        homeTeam: mapTeam(m.homeTeam),
        awayTeam: mapTeam(m.awayTeam),
        homeScore: m.score?.fullTime?.home ?? null,
        awayScore: m.score?.fullTime?.away ?? null,
        date: m.utcDate.slice(0, 10),
        status: mapStatus(m.status),
        group: groupLetter,
        matchday: m.matchday,
      }));

    groups.push({ name: groupName, standings, matches: groupMatches });
  }

  return groups;
}

function buildKnockout(matchesData: any): KnockoutMatch[] {
  const ROUND_MAP: Record<string, string> = {
    LAST_32: "Laatste 32",
    ROUND_OF_16: "Achtste finale",
    QUARTER_FINALS: "Kwartfinale",
    SEMI_FINALS: "Halve finale",
    THIRD_PLACE: "Troostfinale",
    FINAL: "Finale",
  };

  return matchesData.matches
    .filter((m: any) => m.stage !== "GROUP_STAGE")
    .map((m: any, i: number) => ({
      id: String(m.id ?? `ko-${i}`),
      round: ROUND_MAP[m.stage] ?? m.stage,
      homeTeam: m.homeTeam?.name ? mapTeam(m.homeTeam) : null,
      awayTeam: m.awayTeam?.name ? mapTeam(m.awayTeam) : null,
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      homePenalty: m.score?.penalties?.home ?? null,
      awayPenalty: m.score?.penalties?.away ?? null,
      status: mapStatus(m.status),
      date: m.utcDate.slice(0, 10),
    }));
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({
      groups: GROUPS,
      knockout: KNOCKOUT_MATCHES,
      lastUpdated: new Date().toISOString(),
      source: "static",
    });
  }

  try {
    const [standingsData, matchesData] = await Promise.all([
      apiFetch("/competitions/WC/standings"),
      apiFetch("/competitions/WC/matches"),
    ]);

    const groups = buildGroups(standingsData, matchesData);
    const knockout = buildKnockout(matchesData);

    return NextResponse.json({
      groups: groups.length > 0 ? groups : GROUPS,
      knockout: knockout.length > 0 ? knockout : KNOCKOUT_MATCHES,
      lastUpdated: new Date().toISOString(),
      source: "live",
    });
  } catch (err) {
    console.error("football-data.org fetch failed:", err);
    return NextResponse.json({
      groups: GROUPS,
      knockout: KNOCKOUT_MATCHES,
      lastUpdated: new Date().toISOString(),
      source: "static-fallback",
    });
  }
}
