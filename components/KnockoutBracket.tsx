import { KnockoutMatch } from "@/lib/wc2026-data";

function KnockoutCard({ match, flip = false }: { match: KnockoutMatch; flip?: boolean }) {
  const done = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const date = new Date(match.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

  const sides = [
    { team: match.homeTeam, score: match.homeScore, pen: match.homePenalty },
    { team: match.awayTeam, score: match.awayScore, pen: match.awayPenalty },
  ];

  return (
    <div className={`bg-[#112030] rounded border border-white/10 overflow-hidden ${live ? "border-red-500/40" : ""}`}>
      {sides.map((side, i) => (
        <div key={i} className={`flex items-center px-1.5 py-[3px] border-b border-white/5 last:border-0 ${flip ? "flex-row-reverse" : ""}`}>
          <span className={`flex items-center gap-1 text-[10px] min-w-0 flex-1 ${flip ? "flex-row-reverse" : ""}`}>
            <span className="shrink-0">{side.team?.flag ?? "🏳️"}</span>
            <span className={`truncate text-white/75 ${flip ? "text-right" : ""}`}>{side.team?.name ?? "TBD"}</span>
          </span>
          <span className="font-mono font-bold text-[10px] shrink-0 w-5 text-center text-white/50">
            {done || live ? (side.score ?? "-") : <span className="text-white/20">-</span>}
          </span>
        </div>
      ))}
      {!done && !live && (
        <div className="text-[8px] text-white/20 text-center pb-[2px]">{date}</div>
      )}
    </div>
  );
}

function RoundCol({
  label,
  matches,
  flip = false,
}: {
  label: string;
  matches: KnockoutMatch[];
  flip?: boolean;
}) {
  return (
    <div className="flex flex-col h-full w-[130px] shrink-0">
      <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 text-center mb-1 shrink-0">
        {label}
      </p>
      {/* evenly distribute cards using flex gap trick */}
      <div className="flex flex-col flex-1 justify-around gap-1">
        {matches.map((m) => (
          <KnockoutCard key={m.id} match={m} flip={flip} />
        ))}
      </div>
    </div>
  );
}

export default function KnockoutBracket({ matches }: { matches: KnockoutMatch[] }) {
  const r32 = matches.filter((m) => m.round === "Laatste 32");
  const r16 = matches.filter((m) => m.round === "Achtste finale");
  const qf  = matches.filter((m) => m.round === "Kwartfinale");
  const sf  = matches.filter((m) => m.round === "Halve finale");
  const fin = matches.filter((m) => m.round === "Finale");
  const trd = matches.filter((m) => m.round === "Troostfinale");

  const half = (arr: KnockoutMatch[]) => [
    arr.slice(0, Math.ceil(arr.length / 2)),
    arr.slice(Math.ceil(arr.length / 2)),
  ] as const;

  const [r32L, r32R] = half(r32);
  const [r16L, r16R] = half(r16);
  const [qfL,  qfR ] = half(qf);
  const [sfL,  sfR ] = half(sf);

  const leftCols  = [r32L, r16L, qfL, sfL].filter((c) => c.length > 0);
  const rightCols = [sfR,  qfR,  r16R, r32R].filter((c) => c.length > 0);

  const leftLabels  = ["Laatste 32", "Achtste finale", "Kwartfinale", "Halve finale"].slice(0, leftCols.length);
  const rightLabels = ["Halve finale", "Kwartfinale", "Achtste finale", "Laatste 32"].slice(0, rightCols.length);

  return (
    <div className="h-full flex items-center justify-center gap-2 overflow-hidden px-2">
      {/* LEFT — outermost to innermost */}
      {leftCols.map((col, i) => (
        <RoundCol key={`l-${i}`} label={leftLabels[i]} matches={col} />
      ))}

      {/* CENTER */}
      <div className="flex flex-col items-center justify-center gap-4 w-[144px] shrink-0 h-full">
        {fin.length > 0 && (
          <div className="w-full">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#00d4aa] text-center mb-1">⚽ Finale</p>
            {fin.map((m) => <KnockoutCard key={m.id} match={m} />)}
          </div>
        )}
        {trd.length > 0 && (
          <div className="w-full">
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 text-center mb-1">3e Plek</p>
            {trd.map((m) => <KnockoutCard key={m.id} match={m} />)}
          </div>
        )}
        {fin.length === 0 && trd.length === 0 && (
          <p className="text-[10px] text-white/20 text-center">Nog niet bepaald</p>
        )}
      </div>

      {/* RIGHT — innermost to outermost */}
      {rightCols.map((col, i) => (
        <RoundCol key={`r-${i}`} label={rightLabels[i]} matches={col} flip />
      ))}
    </div>
  );
}
