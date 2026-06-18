import { Group, MatchResult, Standing } from "@/lib/wc2026-data";

function rowColor(rank: number, totalPlayed: number) {
  if (totalPlayed === 0) return "";
  if (rank <= 2) return "bg-[#00d4aa]/10 border-l-2 border-[#00d4aa]";
  if (rank === 3) return "bg-yellow-500/10 border-l-2 border-yellow-500";
  return "border-l-2 border-white/10";
}

function MatchRow({ match }: { match: MatchResult }) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const date = new Date(match.date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className={`flex items-center justify-between text-xs py-1.5 px-2 rounded ${isLive ? "bg-red-500/10" : ""}`}>
      <span className="flex items-center gap-1 w-28 truncate">
        <span>{match.homeTeam.flag}</span>
        <span className="truncate text-white/80">{match.homeTeam.name}</span>
      </span>
      <span className="font-mono font-bold text-sm min-w-[48px] text-center">
        {isFinished || isLive ? (
          <span className={isLive ? "text-red-400" : "text-white"}>
            {match.homeScore} – {match.awayScore}
          </span>
        ) : (
          <span className="text-white/30">{date}</span>
        )}
      </span>
      <span className="flex items-center gap-1 w-28 truncate justify-end">
        <span className="truncate text-right text-white/80">{match.awayTeam.name}</span>
        <span>{match.awayTeam.flag}</span>
      </span>
    </div>
  );
}

export default function GroupCard({ group }: { group: Group }) {
  const maxPlayed = Math.max(...group.standings.map((s) => s.played));

  return (
    <div className="bg-[#132236] rounded-xl border border-white/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-white/70">
          {group.name}
        </h2>
      </div>

      {/* Standings table */}
      <div className="px-2 pt-2">
        <div className="grid grid-cols-[20px_1fr_28px_28px_28px_28px_36px_32px] gap-x-1 text-[10px] text-white/40 font-semibold uppercase px-2 pb-1">
          <span>#</span>
          <span>Team</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">G</span>
          <span className="text-center">V</span>
          <span className="text-center">DV</span>
          <span className="text-center">Ptn</span>
        </div>
        {group.standings.map((s, i) => (
          <div
            key={s.team.code}
            className={`grid grid-cols-[20px_1fr_28px_28px_28px_28px_36px_32px] gap-x-1 text-xs items-center px-2 py-1.5 mb-0.5 rounded ${rowColor(i + 1, maxPlayed)}`}
          >
            <span className="text-white/50 text-[11px]">{i + 1}</span>
            <span className="flex items-center gap-1.5">
              <span>{s.team.flag}</span>
              <span className="truncate font-medium">{s.team.name}</span>
            </span>
            <span className="text-center text-white/60">{s.played}</span>
            <span className="text-center text-white/60">{s.won}</span>
            <span className="text-center text-white/60">{s.drawn}</span>
            <span className="text-center text-white/60">{s.lost}</span>
            <span className={`text-center font-mono ${s.gd > 0 ? "text-[#00d4aa]" : s.gd < 0 ? "text-red-400" : "text-white/60"}`}>
              {s.gd > 0 ? `+${s.gd}` : s.gd}
            </span>
            <span className="text-center font-bold">{s.points}</span>
          </div>
        ))}
      </div>

      {/* Matches */}
      <div className="px-2 pb-3 pt-2 border-t border-white/5 mt-2">
        <p className="text-[10px] text-white/30 uppercase font-semibold px-2 mb-1">Wedstrijden</p>
        {group.matches.map((m, i) => (
          <MatchRow key={i} match={m} />
        ))}
      </div>
    </div>
  );
}
