import { KnockoutMatch } from "@/lib/wc2026-data";

function KnockoutCard({ match }: { match: KnockoutMatch }) {
  const done = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const date = new Date(match.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

  return (
    <div className={`bg-[#112030] rounded border border-white/10 overflow-hidden ${live ? "border-red-500/50" : ""}`}>
      {live && (
        <div className="text-[8px] text-red-400 font-bold px-1.5 pt-0.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse inline-block" />LIVE
        </div>
      )}
      {[
        { team: match.homeTeam, score: match.homeScore, pen: match.homePenalty },
        { team: match.awayTeam, score: match.awayScore, pen: match.awayPenalty },
      ].map((side, i) => (
        <div key={i} className="flex items-center justify-between px-1.5 py-1 border-b border-white/5 last:border-0">
          <span className="flex items-center gap-1 text-[10px] min-w-0">
            <span>{side.team?.flag ?? "🏳️"}</span>
            <span className="truncate text-white/75">{side.team?.name ?? "TBD"}</span>
          </span>
          <span className="font-mono font-bold text-[11px] ml-1 shrink-0">
            {done || live ? `${side.score ?? "-"}${side.pen !== null ? `(${side.pen})` : ""}` : <span className="text-white/20">-</span>}
          </span>
        </div>
      ))}
      {!done && !live && (
        <div className="text-[8px] text-white/25 px-1.5 pb-1 text-center">{date}</div>
      )}
    </div>
  );
}

export default function KnockoutBracket({ matches }: { matches: KnockoutMatch[] }) {
  const rounds = [
    { key: "Laatste 32", label: "Laatste 32" },
    { key: "Achtste finale", label: "1/8 finale" },
    { key: "Kwartfinale", label: "Kwartfinale" },
    { key: "Halve finale", label: "Halve finale" },
    { key: "Finale", label: "Finale" },
  ];
  const third = matches.filter((m) => m.round === "Troostfinale");

  return (
    <div className="h-full flex flex-col gap-2 overflow-hidden">
      <div className="flex gap-3 flex-1 min-h-0 overflow-x-auto">
        {rounds.map((r) => {
          const ms = matches.filter((m) => m.round === r.key);
          if (!ms.length) return null;
          return (
            <div key={r.key} className="flex flex-col gap-1 min-w-[140px]">
              <div className="text-[9px] font-bold uppercase tracking-widest text-white/35 text-center shrink-0">{r.label}</div>
              <div className="flex flex-col gap-1.5 justify-around flex-1">
                {ms.map((m) => <KnockoutCard key={m.id} match={m} />)}
              </div>
            </div>
          );
        })}
        {third.length > 0 && (
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/35 text-center shrink-0">3e plek</div>
            <div className="flex flex-col gap-1.5 justify-around flex-1">
              {third.map((m) => <KnockoutCard key={m.id} match={m} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
