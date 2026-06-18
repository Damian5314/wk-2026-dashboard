export interface Team {
  name: string;
  flag: string;
  code: string;
}

export interface Standing {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface MatchResult {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  group: string;
  matchday: number;
}

export interface Group {
  name: string;
  standings: Standing[];
  matches: MatchResult[];
}

export interface KnockoutMatch {
  id: string;
  round: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalty: number | null;
  awayPenalty: number | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  date: string;
}

// All 48 WC 2026 teams with flags
const TEAMS: Record<string, Team> = {
  MEX: { name: "Mexico", flag: "🇲🇽", code: "MEX" },
  KOR: { name: "Zuid-Korea", flag: "🇰🇷", code: "KOR" },
  CZE: { name: "Tsjechië", flag: "🇨🇿", code: "CZE" },
  RSA: { name: "Zuid-Afrika", flag: "🇿🇦", code: "RSA" },
  SUI: { name: "Zwitserland", flag: "🇨🇭", code: "SUI" },
  CAN: { name: "Canada", flag: "🇨🇦", code: "CAN" },
  QAT: { name: "Qatar", flag: "🇶🇦", code: "QAT" },
  BIH: { name: "Bosnië-Herz.", flag: "🇧🇦", code: "BIH" },
  SCO: { name: "Schotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", code: "SCO" },
  BRA: { name: "Brazilië", flag: "🇧🇷", code: "BRA" },
  MAR: { name: "Marokko", flag: "🇲🇦", code: "MAR" },
  HAI: { name: "Haïti", flag: "🇭🇹", code: "HAI" },
  USA: { name: "Verenigde Staten", flag: "🇺🇸", code: "USA" },
  AUS: { name: "Australië", flag: "🇦🇺", code: "AUS" },
  TUR: { name: "Turkije", flag: "🇹🇷", code: "TUR" },
  PAR: { name: "Paraguay", flag: "🇵🇾", code: "PAR" },
  GER: { name: "Duitsland", flag: "🇩🇪", code: "GER" },
  CIV: { name: "Ivoorkust", flag: "🇨🇮", code: "CIV" },
  ECU: { name: "Ecuador", flag: "🇪🇨", code: "ECU" },
  CUW: { name: "Curaçao", flag: "🇨🇼", code: "CUW" },
  SWE: { name: "Zweden", flag: "🇸🇪", code: "SWE" },
  JPN: { name: "Japan", flag: "🇯🇵", code: "JPN" },
  NED: { name: "Nederland", flag: "🇳🇱", code: "NED" },
  TUN: { name: "Tunesië", flag: "🇹🇳", code: "TUN" },
  POR: { name: "Portugal", flag: "🇵🇹", code: "POR" },
  ARG: { name: "Argentinië", flag: "🇦🇷", code: "ARG" },
  CHI: { name: "Chili", flag: "🇨🇱", code: "CHI" },
  ALB: { name: "Albanië", flag: "🇦🇱", code: "ALB" },
  ESP: { name: "Spanje", flag: "🇪🇸", code: "ESP" },
  CMR: { name: "Kameroen", flag: "🇨🇲", code: "CMR" },
  NZL: { name: "Nieuw-Zeeland", flag: "🇳🇿", code: "NZL" },
  UKR: { name: "Oekraïne", flag: "🇺🇦", code: "UKR" },
  FRA: { name: "Frankrijk", flag: "🇫🇷", code: "FRA" },
  SEN: { name: "Senegal", flag: "🇸🇳", code: "SEN" },
  COL: { name: "Colombia", flag: "🇨🇴", code: "COL" },
  VEN: { name: "Venezuela", flag: "🇻🇪", code: "VEN" },
  ENG: { name: "Engeland", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", code: "ENG" },
  COD: { name: "DR Congo", flag: "🇨🇩", code: "COD" },
  PAN: { name: "Panama", flag: "🇵🇦", code: "PAN" },
  IRN: { name: "Iran", flag: "🇮🇷", code: "IRN" },
  URU: { name: "Uruguay", flag: "🇺🇾", code: "URU" },
  NGA: { name: "Nigeria", flag: "🇳🇬", code: "NGA" },
  SVK: { name: "Slowakije", flag: "🇸🇰", code: "SVK" },
  IND: { name: "India", flag: "🇮🇳", code: "IND" },
  BEL: { name: "België", flag: "🇧🇪", code: "BEL" },
  SAU: { name: "Saoedi-Arabië", flag: "🇸🇦", code: "SAU" },
  AUT: { name: "Oostenrijk", flag: "🇦🇹", code: "AUT" },
  CRC: { name: "Costa Rica", flag: "🇨🇷", code: "CRC" },
};

function makeStanding(team: Team, p: number, w: number, d: number, l: number, gf: number, ga: number): Standing {
  return { team, played: p, won: w, drawn: d, lost: l, gf, ga, gd: gf - ga, points: w * 3 + d };
}

function makeMatch(home: string, away: string, hs: number | null, as_: number | null, date: string, group: string, md: number, status: MatchResult["status"] = "SCHEDULED"): MatchResult {
  return {
    homeTeam: TEAMS[home],
    awayTeam: TEAMS[away],
    homeScore: hs,
    awayScore: as_,
    date,
    group,
    matchday: md,
    status,
  };
}

export const GROUPS: Group[] = [
  {
    name: "Groep A",
    standings: [
      makeStanding(TEAMS.MEX, 1, 1, 0, 0, 2, 0, ),
      makeStanding(TEAMS.KOR, 1, 1, 0, 0, 1, 0, ),
      makeStanding(TEAMS.CZE, 1, 0, 0, 1, 0, 1, ),
      makeStanding(TEAMS.RSA, 1, 0, 0, 1, 0, 2, ),
    ],
    matches: [
      makeMatch("MEX", "RSA", 2, 0, "2026-06-12", "A", 1, "FINISHED"),
      makeMatch("KOR", "CZE", 1, 0, "2026-06-12", "A", 1, "FINISHED"),
      makeMatch("MEX", "KOR", null, null, "2026-06-17", "A", 2),
      makeMatch("CZE", "RSA", null, null, "2026-06-17", "A", 2),
      makeMatch("MEX", "CZE", null, null, "2026-06-22", "A", 3),
      makeMatch("KOR", "RSA", null, null, "2026-06-22", "A", 3),
    ],
  },
  {
    name: "Groep B",
    standings: [
      makeStanding(TEAMS.SUI, 1, 0, 1, 0, 0, 0, ),
      makeStanding(TEAMS.CAN, 1, 0, 1, 0, 0, 0, ),
      makeStanding(TEAMS.QAT, 1, 0, 1, 0, 0, 0, ),
      makeStanding(TEAMS.BIH, 1, 0, 1, 0, 0, 0, ),
    ],
    matches: [
      makeMatch("SUI", "CAN", 0, 0, "2026-06-13", "B", 1, "FINISHED"),
      makeMatch("QAT", "BIH", 0, 0, "2026-06-13", "B", 1, "FINISHED"),
      makeMatch("SUI", "QAT", null, null, "2026-06-18", "B", 2),
      makeMatch("CAN", "BIH", null, null, "2026-06-18", "B", 2),
      makeMatch("SUI", "BIH", null, null, "2026-06-23", "B", 3),
      makeMatch("CAN", "QAT", null, null, "2026-06-23", "B", 3),
    ],
  },
  {
    name: "Groep C",
    standings: [
      makeStanding(TEAMS.SCO, 1, 1, 0, 0, 1, 0, ),
      makeStanding(TEAMS.BRA, 1, 0, 1, 0, 0, 0, ),
      makeStanding(TEAMS.MAR, 1, 0, 1, 0, 0, 0, ),
      makeStanding(TEAMS.HAI, 1, 0, 0, 1, 0, 1, ),
    ],
    matches: [
      makeMatch("SCO", "HAI", 1, 0, "2026-06-13", "C", 1, "FINISHED"),
      makeMatch("BRA", "MAR", 0, 0, "2026-06-14", "C", 1, "FINISHED"),
      makeMatch("SCO", "BRA", null, null, "2026-06-18", "C", 2),
      makeMatch("MAR", "HAI", null, null, "2026-06-18", "C", 2),
      makeMatch("SCO", "MAR", null, null, "2026-06-23", "C", 3),
      makeMatch("BRA", "HAI", null, null, "2026-06-23", "C", 3),
    ],
  },
  {
    name: "Groep D",
    standings: [
      makeStanding(TEAMS.USA, 1, 1, 0, 0, 3, 0, ),
      makeStanding(TEAMS.AUS, 1, 1, 0, 0, 2, 0, ),
      makeStanding(TEAMS.TUR, 1, 0, 0, 1, 0, 1, ),
      makeStanding(TEAMS.PAR, 1, 0, 0, 1, 0, 3, ),
    ],
    matches: [
      makeMatch("USA", "PAR", 3, 0, "2026-06-14", "D", 1, "FINISHED"),
      makeMatch("AUS", "TUR", 2, 1, "2026-06-14", "D", 1, "FINISHED"),
      makeMatch("USA", "AUS", null, null, "2026-06-19", "D", 2),
      makeMatch("TUR", "PAR", null, null, "2026-06-19", "D", 2),
      makeMatch("USA", "TUR", null, null, "2026-06-24", "D", 3),
      makeMatch("AUS", "PAR", null, null, "2026-06-24", "D", 3),
    ],
  },
  {
    name: "Groep E",
    standings: [
      makeStanding(TEAMS.GER, 1, 1, 0, 0, 6, 0, ),
      makeStanding(TEAMS.CIV, 1, 1, 0, 0, 1, 0, ),
      makeStanding(TEAMS.ECU, 1, 0, 0, 1, 0, 1, ),
      makeStanding(TEAMS.CUW, 1, 0, 0, 1, 0, 6, ),
    ],
    matches: [
      makeMatch("GER", "CUW", 6, 0, "2026-06-15", "E", 1, "FINISHED"),
      makeMatch("CIV", "ECU", 1, 0, "2026-06-15", "E", 1, "FINISHED"),
      makeMatch("GER", "CIV", null, null, "2026-06-20", "E", 2),
      makeMatch("ECU", "CUW", null, null, "2026-06-20", "E", 2),
      makeMatch("GER", "ECU", null, null, "2026-06-25", "E", 3),
      makeMatch("CIV", "CUW", null, null, "2026-06-25", "E", 3),
    ],
  },
  {
    name: "Groep F",
    standings: [
      makeStanding(TEAMS.SWE, 1, 1, 0, 0, 4, 0, ),
      makeStanding(TEAMS.JPN, 1, 0, 1, 0, 0, 0, ),
      makeStanding(TEAMS.NED, 1, 0, 1, 0, 0, 0, ),
      makeStanding(TEAMS.TUN, 1, 0, 0, 1, 0, 4, ),
    ],
    matches: [
      makeMatch("SWE", "TUN", 4, 0, "2026-06-15", "F", 1, "FINISHED"),
      makeMatch("JPN", "NED", 0, 0, "2026-06-16", "F", 1, "FINISHED"),
      makeMatch("SWE", "JPN", null, null, "2026-06-20", "F", 2),
      makeMatch("NED", "TUN", null, null, "2026-06-20", "F", 2),
      makeMatch("SWE", "NED", null, null, "2026-06-25", "F", 3),
      makeMatch("JPN", "TUN", null, null, "2026-06-25", "F", 3),
    ],
  },
  {
    name: "Groep G",
    standings: [
      makeStanding(TEAMS.POR, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.ARG, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.CHI, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.ALB, 0, 0, 0, 0, 0, 0, ),
    ],
    matches: [
      makeMatch("POR", "ALB", null, null, "2026-06-16", "G", 1),
      makeMatch("ARG", "CHI", null, null, "2026-06-16", "G", 1),
      makeMatch("POR", "ARG", null, null, "2026-06-21", "G", 2),
      makeMatch("CHI", "ALB", null, null, "2026-06-21", "G", 2),
      makeMatch("POR", "CHI", null, null, "2026-06-26", "G", 3),
      makeMatch("ARG", "ALB", null, null, "2026-06-26", "G", 3),
    ],
  },
  {
    name: "Groep H",
    standings: [
      makeStanding(TEAMS.ESP, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.CMR, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.NZL, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.UKR, 0, 0, 0, 0, 0, 0, ),
    ],
    matches: [
      makeMatch("ESP", "CMR", null, null, "2026-06-17", "H", 1),
      makeMatch("NZL", "UKR", null, null, "2026-06-17", "H", 1),
      makeMatch("ESP", "NZL", null, null, "2026-06-22", "H", 2),
      makeMatch("CMR", "UKR", null, null, "2026-06-22", "H", 2),
      makeMatch("ESP", "UKR", null, null, "2026-06-27", "H", 3),
      makeMatch("CMR", "NZL", null, null, "2026-06-27", "H", 3),
    ],
  },
  {
    name: "Groep I",
    standings: [
      makeStanding(TEAMS.FRA, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.SEN, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.COL, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.VEN, 0, 0, 0, 0, 0, 0, ),
    ],
    matches: [
      makeMatch("FRA", "VEN", null, null, "2026-06-17", "I", 1),
      makeMatch("SEN", "COL", null, null, "2026-06-17", "I", 1),
      makeMatch("FRA", "SEN", null, null, "2026-06-22", "I", 2),
      makeMatch("COL", "VEN", null, null, "2026-06-22", "I", 2),
      makeMatch("FRA", "COL", null, null, "2026-06-27", "I", 3),
      makeMatch("SEN", "VEN", null, null, "2026-06-27", "I", 3),
    ],
  },
  {
    name: "Groep J",
    standings: [
      makeStanding(TEAMS.ENG, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.COD, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.PAN, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.IRN, 0, 0, 0, 0, 0, 0, ),
    ],
    matches: [
      makeMatch("ENG", "IRN", null, null, "2026-06-18", "J", 1),
      makeMatch("COD", "PAN", null, null, "2026-06-18", "J", 1),
      makeMatch("ENG", "COD", null, null, "2026-06-23", "J", 2),
      makeMatch("PAN", "IRN", null, null, "2026-06-23", "J", 2),
      makeMatch("ENG", "PAN", null, null, "2026-06-28", "J", 3),
      makeMatch("COD", "IRN", null, null, "2026-06-28", "J", 3),
    ],
  },
  {
    name: "Groep K",
    standings: [
      makeStanding(TEAMS.URU, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.NGA, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.SVK, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.IND, 0, 0, 0, 0, 0, 0, ),
    ],
    matches: [
      makeMatch("URU", "IND", null, null, "2026-06-19", "K", 1),
      makeMatch("NGA", "SVK", null, null, "2026-06-19", "K", 1),
      makeMatch("URU", "NGA", null, null, "2026-06-24", "K", 2),
      makeMatch("SVK", "IND", null, null, "2026-06-24", "K", 2),
      makeMatch("URU", "SVK", null, null, "2026-06-29", "K", 3),
      makeMatch("NGA", "IND", null, null, "2026-06-29", "K", 3),
    ],
  },
  {
    name: "Groep L",
    standings: [
      makeStanding(TEAMS.BEL, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.SAU, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.AUT, 0, 0, 0, 0, 0, 0, ),
      makeStanding(TEAMS.CRC, 0, 0, 0, 0, 0, 0, ),
    ],
    matches: [
      makeMatch("BEL", "CRC", null, null, "2026-06-19", "L", 1),
      makeMatch("SAU", "AUT", null, null, "2026-06-19", "L", 1),
      makeMatch("BEL", "SAU", null, null, "2026-06-24", "L", 2),
      makeMatch("AUT", "CRC", null, null, "2026-06-24", "L", 2),
      makeMatch("BEL", "AUT", null, null, "2026-06-29", "L", 3),
      makeMatch("SAU", "CRC", null, null, "2026-06-29", "L", 3),
    ],
  },
];

export const KNOCKOUT_MATCHES: KnockoutMatch[] = [
  // Round of 32 (Laatste 32)
  { id: "r32-1", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-04" },
  { id: "r32-2", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-04" },
  { id: "r32-3", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-05" },
  { id: "r32-4", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-05" },
  { id: "r32-5", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-06" },
  { id: "r32-6", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-06" },
  { id: "r32-7", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-07" },
  { id: "r32-8", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-07" },
  { id: "r32-9", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-08" },
  { id: "r32-10", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-08" },
  { id: "r32-11", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-09" },
  { id: "r32-12", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-09" },
  { id: "r32-13", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-10" },
  { id: "r32-14", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-10" },
  { id: "r32-15", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-11" },
  { id: "r32-16", round: "Laatste 32", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-11" },
  // Round of 16
  { id: "r16-1", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-15" },
  { id: "r16-2", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-15" },
  { id: "r16-3", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-16" },
  { id: "r16-4", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-16" },
  { id: "r16-5", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-17" },
  { id: "r16-6", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-17" },
  { id: "r16-7", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-18" },
  { id: "r16-8", round: "Achtste finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-18" },
  // Quarter finals
  { id: "qf-1", round: "Kwartfinale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-22" },
  { id: "qf-2", round: "Kwartfinale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-22" },
  { id: "qf-3", round: "Kwartfinale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-23" },
  { id: "qf-4", round: "Kwartfinale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-23" },
  // Semi finals
  { id: "sf-1", round: "Halve finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-26" },
  { id: "sf-2", round: "Halve finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-27" },
  // Third place
  { id: "3rd", round: "Troostfinale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-30" },
  // Final
  { id: "final", round: "Finale", homeTeam: null, awayTeam: null, homeScore: null, awayScore: null, homePenalty: null, awayPenalty: null, status: "SCHEDULED", date: "2026-07-30" },
];
