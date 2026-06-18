import { NextResponse } from "next/server";
import { GROUPS, KNOCKOUT_MATCHES, Group, KnockoutMatch, Standing, MatchResult, Team } from "@/lib/wc2026-data";

export const dynamic = "force-dynamic";

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = "https://api.football-data.org/v4";

async function apiFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": API_KEY! },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`football-data.org ${res.status}: ${path}`);
  return res.json();
}

function mapStatus(s: string): MatchResult["status"] {
  if (s === "FINISHED") return "FINISHED";
  if (s === "IN_PLAY" || s === "PAUSED" || s === "HALFTIME") return "LIVE";
  return "SCHEDULED";
}

function flagEmoji(cca2: string): string {
  // Convert 2-letter country code to flag emoji
  const offset = 0x1F1E6 - 65;
  return [...cca2.toUpperCase()].map((c) => String.fromCodePoint(c.charCodeAt(0) + offset)).join("");
}

function mapTeam(t: { name: string; shortName: string; tla: string; crest?: string }): Team {
  return {
    name: t.shortName || t.name,
    flag: flagEmoji(t.tla.slice(0, 2)),
    code: t.tla,
  };
}

function buildGroups(standingsData: any, matchesData: any): Group[] {
  const groups: Group[] = [];

  for (const standing of standingsData.standings) {
    if (standing.type !== "TOTAL") continue;

    const groupLetter = standing.group?.replace("GROUP_", "") ?? "?";
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
