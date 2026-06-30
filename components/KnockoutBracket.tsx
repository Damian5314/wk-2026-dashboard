import { KnockoutMatch } from "@/lib/wc2026-data";

function KnockoutCard({ match, flip = false }: { match: KnockoutMatch; flip?: boolean }) {
  const done = match.status === "FINISHED";
  const live = match.status === "LIVE";
  const date = new Date(match.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  const hasPen = done && match.homePenalty !== null && match.awayPenalty !== null;

  const sides = [
    { team: match.homeTeam, score: match.homeScore, pen: match.homePenalty },
    { team: match.awayTeam, score: match.awayScore, pen: match.awayPenalty },
  ];

  let winnerIdx: number | null = null;
  if (done) {
    if (hasPen) {
      winnerIdx = (match.homePenalty ?? 0) > (match.awayPenalty ?? 0) ? 0 : 1;
    } else if (match.homeScore !== null && match.awayScore !== null && match.homeScore !== match.awayScore) {
      winnerIdx = match.homeScore > match.awayScore ? 0 : 1;
    }
  }

  return (
    <div className={`bg-[#112030] rounded border overflow-hidden h-full flex flex-col justify-center
      ${live ? "border-red-500/40" : "border-white/10"}`}>
      {sides.map((side, i) => {
        const isWinner = winnerIdx === i;
        const isLoser  = winnerIdx !== null && winnerIdx !== i;
        return (
          <div key={i} className={`flex items-center px-1.5 py-[3px] border-b border-white/5 last:border-0
            ${isWinner ? "bg-[#00d4aa]/10" : ""} ${flip ? "flex-row-reverse" : ""}`}>
            <span className={`flex items-center gap-1 text-[10px] min-w-0 flex-1 ${flip ? "flex-row-reverse" : ""}`}>
              <span className="shrink-0">{side.team?.flag ?? "🏳️"}</span>
              <span className={`truncate ${flip ? "text-right" : ""}
                ${isWinner ? "text-white font-bold" : isLoser ? "text-white/30" : "text-white/75"}`}>
                {side.team?.name ?? "TBD"}
              </span>
            </span>
            <span className={`font-mono font-bold text-[10px] shrink-0 w-5 text-center
              ${isWinner ? "text-[#00d4aa]" : isLoser ? "text-white/25" : "text-white/50"}`}>
              {done || live ? (side.score ?? "-") : <span className="text-white/20">-</span>}
            </span>
          </div>
        );
      })}
      {hasPen && (
        <div className={`flex items-center justify-between px-1.5 py-[2px] bg-yellow-500/10 border-t border-yellow-500/20 ${flip ? "flex-row-reverse" : ""}`}>
          <span className="text-[8px] text-yellow-400 font-bold uppercase tracking-wider">Pen.</span>
          <span className="text-[8px] font-mono text-yellow-400 font-bold">
            {flip ? `${match.awayPenalty} – ${match.homePenalty}` : `${match.homePenalty} – ${match.awayPenalty}`}
          </span>
        </div>
      )}
      {!done && !live && (
        <div className="text-[8px] text-white/20 text-center pb-[2px]">{date}</div>
      )}
    </div>
  );
}

// Bracket grid: 16 rows, each Laatste-32 match occupies 2 rows.
// Rounds are vertically centred between the two feeder matches.
//
//  R32  row starts: 1,3,5,7,9,11,13,15  (span 2)
//  R16  row starts: 2,6,10,14           (span 4, centred between R32 pair)
//  QF   row starts: 4,12               (span 4)
//  SF   row starts: 8                  (span 4)
//  Final/3rd:       7 / 10             (span 3)
//
// 9 columns: L32 | L16 | LQF | LSF | CENTER | RSF | RQF | RR16 | RR32
// (column gap acts as the visual "connector")

const TOTAL_ROWS = 16;

const POS = {
  r32:    [1, 3, 5, 7, 9, 11, 13, 15],   // span 2
  r16:    [2, 6, 10, 14],                 // span 4
  qf:     [4, 12],                        // span 4
  sf:     [8],                            // span 4
  final:  7,                              // span 3
  third:  11,                             // span 3
};

function Cell({
  match, row, rowSpan, col, flip = false,
}: {
  match: KnockoutMatch; row: number; rowSpan: number; col: number; flip?: boolean;
}) {
  return (
    <div style={{ gridRow: `${row} / span ${rowSpan}`, gridColumn: col }}
      className="flex items-center px-[3px]">
      <KnockoutCard match={match} flip={flip} />
    </div>
  );
}

function ColLabel({ label, col, flip = false }: { label: string; col: number; flip?: boolean }) {
  return (
    <div style={{ gridRow: "1 / 1", gridColumn: col }}
      className={`text-[8px] font-bold uppercase tracking-widest text-white/30 flex items-end pb-1 ${flip ? "justify-end" : "justify-start"}`}>
      {label}
    </div>
  );
}

export default function KnockoutBracket({ matches }: { matches: KnockoutMatch[] }) {
  const r32 = matches.filter((m) => m.round === "Laatste 32");
  const r16 = matches.filter((m) => m.round === "Achtste finale");
  const qf  = matches.filter((m) => m.round === "Kwartfinale");
  const sf  = matches.filter((m) => m.round === "Halve finale");
  const fin = matches.find((m)  => m.round === "Finale");
  const trd = matches.find((m)  => m.round === "Troostfinale");

  // Split each round: left half feeds into left bracket, right into right bracket
  const r32L = r32.slice(0, 8);  const r32R = r32.slice(8);
  const r16L = r16.slice(0, 4);  const r16R = r16.slice(4);
  const qfL  = qf.slice(0, 2);   const qfR  = qf.slice(2);
  const sfL  = sf.slice(0, 1);   const sfR  = sf.slice(1);

  // Column numbers (1-based)
  const C = { l32: 1, l16: 2, lqf: 3, lsf: 4, center: 5, rsf: 6, rqf: 7, rr16: 8, rr32: 9 };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Label row */}
      <div className="grid shrink-0 px-2" style={{
        gridTemplateColumns: "130px 130px 130px 130px 144px 130px 130px 130px 130px",
        columnGap: "6px",
      }}>
        {[
          { label: "Laatste 32",     col: C.l32,    flip: false },
          { label: "Achtste finale", col: C.l16,    flip: false },
          { label: "Kwartfinale",    col: C.lqf,    flip: false },
          { label: "Halve finale",   col: C.lsf,    flip: false },
          { label: "",               col: C.center, flip: false },
          { label: "Halve finale",   col: C.rsf,    flip: true  },
          { label: "Kwartfinale",    col: C.rqf,    flip: true  },
          { label: "Achtste finale", col: C.rr16,   flip: true  },
          { label: "Laatste 32",     col: C.rr32,   flip: true  },
        ].map(({ label, col, flip }) => (
          <div key={col} className={`text-[8px] font-bold uppercase tracking-widest text-white/30 pb-1 ${flip ? "text-right" : "text-left"}`}>
            {label}
          </div>
        ))}
      </div>

      {/* Bracket grid */}
      <div className="flex-1 min-h-0 grid px-2" style={{
        gridTemplateRows: `repeat(${TOTAL_ROWS}, 1fr)`,
        gridTemplateColumns: "130px 130px 130px 130px 144px 130px 130px 130px 130px",
        columnGap: "6px",
        rowGap: "3px",
      }}>
        {/* LEFT side */}
        {r32L.map((m, i) => <Cell key={m.id} match={m} row={POS.r32[i]} rowSpan={2} col={C.l32} />)}
        {r16L.map((m, i) => <Cell key={m.id} match={m} row={POS.r16[i]} rowSpan={4} col={C.l16} />)}
        {qfL.map((m, i)  => <Cell key={m.id} match={m} row={POS.qf[i]}  rowSpan={4} col={C.lqf} />)}
        {sfL.map((m, i)  => <Cell key={m.id} match={m} row={POS.sf[i]}  rowSpan={4} col={C.lsf} />)}

        {/* CENTER */}
        {fin && (
          <div style={{ gridRow: `${POS.final} / span 3`, gridColumn: C.center }}
            className="flex flex-col px-[3px]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#00d4aa] text-center mb-1 shrink-0">⚽ Finale</p>
            <div className="flex-1 min-h-0">
              <KnockoutCard match={fin} />
            </div>
          </div>
        )}
        {trd && (
          <div style={{ gridRow: `${POS.third} / span 3`, gridColumn: C.center }}
            className="flex flex-col px-[3px]">
            <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 text-center mb-1 shrink-0">3e Plek</p>
            <div className="flex-1 min-h-0">
              <KnockoutCard match={trd} />
            </div>
          </div>
        )}

        {/* RIGHT side (mirrored) */}
        {sfR.map((m, i)  => <Cell key={m.id} match={m} row={POS.sf[i]}  rowSpan={4} col={C.rsf}  flip />)}
        {qfR.map((m, i)  => <Cell key={m.id} match={m} row={POS.qf[i]}  rowSpan={4} col={C.rqf}  flip />)}
        {r16R.map((m, i) => <Cell key={m.id} match={m} row={POS.r16[i]} rowSpan={4} col={C.rr16} flip />)}
        {r32R.map((m, i) => <Cell key={m.id} match={m} row={POS.r32[i]} rowSpan={2} col={C.rr32} flip />)}
      </div>
    </div>
  );
}
