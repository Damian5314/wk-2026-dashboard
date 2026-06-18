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
    <div className={`bg-[#112030] rounded border border-white/10 overflow-hidden w-full ${live ? "border-red-500/50" : ""}`}>
      {live && (
        <div className="text-[8px] text-red-400 font-bold px-1.5 pt-0.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse inline-block" />LIVE
        </div>
      )}
      {sides.map((side, i) => (
        <div key={i} className={`flex items-center px-1.5 py-[3px] border-b border-white/5 last:border-0 ${flip ? "flex-row-reverse" : ""}`}>
          <span className={`flex items-center gap-1 text-[10px] min-w-0 flex-1 ${flip ? "flex-row-reverse" : ""}`}>
            <span className="shrink-0">{side.team?.flag ?? "🏳️"}</span>
            <span className={`truncate text-white/75 ${flip ? "text-right" : ""}`}>{side.team?.name ?? "TBD"}</span>
          </span>
          <span className="font-mono font-bold text-[11px] shrink-0 w-5 text-center">
            {done || live
              ? <span>{side.score ?? "-"}{side.pen !== null ? <sup className="text-[7px]">{side.pen}</sup> : ""}</span>
              : <span className="text-white/20">-</span>}
          </span>
        </div>
      ))}
      {!done && !live && (
        <div className="text-[8px] text-white/25 px-1.5 pb-1 text-center">{date}</div>
      )}
    </div>
  );
}

function Column({
  label,
  matches,
  flip = false,
  width = "w-[130px]",
}: {
  label: string;
  matches: KnockoutMatch[];
  flip?: boolean;
  width?: string;
}) {
  return (
    <div className={`flex flex-col ${width} shrink-0`}>
      <div className="text-[8px] font-bold uppercase tracking-widest text-white/35 text-center mb-1 shrink-0">
        {label}
      </div>
      <div className="flex flex-col justify-around flex-1 gap-1">
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

  // Split each round evenly: left half and right half
  const half = (arr: KnockoutMatch[]) => ({
    left: arr.slice(0, Math.ceil(arr.length / 2)),
    right: arr.slice(Math.ceil(arr.length / 2)),
  });

  const r32h = half(r32);
  const r16h = half(r16);
  const qfh  = half(qf);
  const sfh  = half(sf);

  return (
    <div className="h-full flex items-stretch gap-2 overflow-x-auto overflow-y-hidden px-1">
      {/* LEFT SIDE — reads left → right toward center */}
      {r32h.left.length > 0  && <Column label="Laatste 32"    matches={r32h.left}  />}
      {r16h.left.length > 0  && <Column label="Achtste finale" matches={r16h.left}  />}
      {qfh.left.length > 0   && <Column label="Kwartfinale"   matches={qfh.left}   />}
      {sfh.left.length > 0   && <Column label="Halve finale"  matches={sfh.left}   />}

      {/* CENTER — finale + troostfinale */}
      <div className="flex flex-col shrink-0 w-[140px] justify-center gap-3">
        {fin.length > 0 && (
          <div className="flex flex-col gap-1">
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#00d4aa] text-center mb-1">⚽ Finale</div>
            {fin.map((m) => <KnockoutCard key={m.id} match={m} />)}
          </div>
        )}
        {trd.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            <div className="text-[8px] font-bold uppercase tracking-widest text-white/35 text-center mb-1">3e plek</div>
            {trd.map((m) => <KnockoutCard key={m.id} match={m} />)}
          </div>
        )}
        {fin.length === 0 && trd.length === 0 && (
          <div className="text-white/20 text-[10px] text-center">Nog niet bepaald</div>
        )}
      </div>

      {/* RIGHT SIDE — reads right → left toward center (mirrored) */}
      {sfh.right.length > 0  && <Column label="Halve finale"  matches={sfh.right}  flip />}
      {qfh.right.length > 0  && <Column label="Kwartfinale"   matches={qfh.right}  flip />}
      {r16h.right.length > 0 && <Column label="Achtste finale" matches={r16h.right} flip />}
      {r32h.right.length > 0 && <Column label="Laatste 32"    matches={r32h.right} flip />}
    </div>
  );
}
