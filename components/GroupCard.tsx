import { Group, MatchResult } from "@/lib/wc2026-data";

function rowColor(rank: number, played: number) {
  if (played === 0) return "border-l-2 border-transparent";
  if (rank <= 2) return "bg-[#00d4aa]/10 border-l-2 border-[#00d4aa]";
  if (rank === 3) return "bg-yellow-500/10 border-l-2 border-yellow-500";
  return "border-l-2 border-white/10";
}

function MatchRow({ m }: { m: MatchResult }) {
  const done = m.status === "FINISHED";
  const live = m.status === "LIVE";
  const date = new Date(m.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  return (
    <div className={`flex items-center text-[9px] leading-none py-[3px] px-1 rounded ${live ? "bg-red-500/10" : ""}`}>
      <span className="flex items-center gap-0.5 flex-1 min-w-0">
        <span className="text-[10px]">{m.homeTeam.flag}</span>
        <span className="truncate text-white/70">{m.homeTeam.name}</span>
      </span>
      <span className="font-mono font-bold text-[10px] px-1.5 shrink-0 text-center w-12">
        {done || live
          ? <span className={live ? "text-red-400" : ""}>{m.homeScore}–{m.awayScore}</span>
          : <span className="text-white/25">{date}</span>}
      </span>
      <span className="flex items-center gap-0.5 flex-1 min-w-0 justify-end">
        <span className="truncate text-right text-white/70">{m.awayTeam.name}</span>
        <span className="text-[10px]">{m.awayTeam.flag}</span>
      </span>
    </div>
  );
}

export default function GroupCard({ group }: { group: Group }) {
  const maxPlayed = Math.max(...group.standings.map((s) => s.played));
  return (
    <div className="bg-[#112030] rounded-lg border border-white/5 flex flex-col overflow-hidden min-h-0">
      {/* Card header */}
      <div className="px-3 py-1 border-b border-white/10 shrink-0">
        <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">{group.name}</span>
      </div>

      {/* Standings */}
      <div className="px-2 pt-1 shrink-0">
        <div className="grid grid-cols-[14px_1fr_18px_18px_18px_18px_26px_22px] text-[8px] text-white/30 font-semibold uppercase px-1 pb-0.5">
          <span>#</span><span>Team</span>
          <span className="text-center">P</span><span className="text-center">W</span>
          <span className="text-center">G</span><span className="text-center">V</span>
          <span className="text-center">DV</span><span className="text-center">Ptn</span>
        </div>
        {group.standings.map((s, i) => (
          <div key={s.team.code}
            className={`grid grid-cols-[14px_1fr_18px_18px_18px_18px_26px_22px] text-[10px] items-center px-1 py-[3px] mb-px rounded ${rowColor(i + 1, maxPlayed)}`}>
            <span className="text-white/40 text-[9px]">{i + 1}</span>
            <span className="flex items-center gap-1 min-w-0">
              <span className="text-[11px] shrink-0">{s.team.flag}</span>
              <span className="truncate font-medium text-[10px]">{s.team.name}</span>
            </span>
            <span className="text-center text-white/55 text-[9px]">{s.played}</span>
            <span className="text-center text-white/55 text-[9px]">{s.won}</span>
            <span className="text-center text-white/55 text-[9px]">{s.drawn}</span>
            <span className="text-center text-white/55 text-[9px]">{s.lost}</span>
            <span className={`text-center font-mono text-[9px] ${s.gd > 0 ? "text-[#00d4aa]" : s.gd < 0 ? "text-red-400" : "text-white/55"}`}>
              {s.gd > 0 ? `+${s.gd}` : s.gd}
            </span>
            <span className="text-center font-bold text-[10px]">{s.points}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 mx-2 my-1 shrink-0" />

      {/* Matches */}
      <div className="px-2 pb-1 flex-1 min-h-0 overflow-hidden">
        {group.matches.map((m, i) => <MatchRow key={i} m={m} />)}
      </div>
    </div>
  );
}
