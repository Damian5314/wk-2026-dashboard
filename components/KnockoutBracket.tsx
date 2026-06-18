import { KnockoutMatch } from "@/lib/wc2026-data";

function KnockoutCard({ match }: { match: KnockoutMatch }) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const date = new Date(match.date).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className={`bg-[#132236] rounded-lg border border-white/10 overflow-hidden w-44 ${isLive ? "border-red-500/50" : ""}`}>
      {isLive && (
        <div className="text-[10px] text-red-400 font-bold px-2 pt-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
          LIVE
        </div>
      )}
      {[
        { team: match.homeTeam, score: match.homeScore, pen: match.homePenalty },
        { team: match.awayTeam, score: match.awayScore, pen: match.awayPenalty },
      ].map((side, i) => (
        <div key={i} className="flex items-center justify-between px-2 py-1.5 border-b border-white/5 last:border-0">
          <span className="flex items-center gap-1.5 text-xs">
            <span>{side.team?.flag ?? "🏳️"}</span>
            <span className="truncate max-w-[90px] text-white/80">
              {side.team?.name ?? "TBD"}
            </span>
          </span>
          <span className="font-mono font-bold text-sm min-w-[20px] text-right">
            {isFinished || isLive ? (
              <span>{side.score ?? "-"}{side.pen !== null ? ` (${side.pen})` : ""}</span>
            ) : (
              <span className="text-white/20">-</span>
            )}
          </span>
        </div>
      ))}
      {!isFinished && !isLive && (
        <div className="text-[10px] text-white/30 px-2 pb-1.5 text-center">{date}</div>
      )}
    </div>
  );
}

function RoundColumn({ title, matches }: { title: string; matches: KnockoutMatch[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 text-center">
        {title}
      </h3>
      <div className="flex flex-col gap-3 justify-around flex-1">
        {matches.map((m) => (
          <KnockoutCard key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}

export default function KnockoutBracket({ matches }: { matches: KnockoutMatch[] }) {
  const rounds = [
    { title: "Laatste 32", key: "Laatste 32" },
    { title: "Achtste finale", key: "Achtste finale" },
    { title: "Kwartfinale", key: "Kwartfinale" },
    { title: "Halve finale", key: "Halve finale" },
    { title: "Finale", key: "Finale" },
  ];

  const byRound = (key: string) => matches.filter((m) => m.round === key);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Knock-out fase</h2>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {rounds.map((r) => {
            const roundMatches = byRound(r.key);
            if (roundMatches.length === 0) return null;
            return (
              <RoundColumn key={r.key} title={r.title} matches={roundMatches} />
            );
          })}
        </div>
      </div>

      {/* 3rd place */}
      {byRound("Troostfinale").length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-3">
            Troostfinale (3e plek)
          </h3>
          <div className="flex gap-3">
            {byRound("Troostfinale").map((m) => (
              <KnockoutCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
