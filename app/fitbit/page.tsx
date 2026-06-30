"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (r.status === 401) return { error: "not_authenticated" };
    if (!r.ok) return { error: "fetch_failed" };
    return r.json();
  });

function ring(pct: number, color: string, size = 80, stroke = 8) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * Math.min(pct / 100, 1);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatCard({
  label, value, unit, goal, color, icon,
}: {
  label: string; value: number | null; unit: string; goal?: number; color: string; icon: string;
}) {
  const pct = goal && value != null ? (value / goal) * 100 : null;
  return (
    <div className="bg-white/5 rounded-xl p-4 flex items-center gap-4">
      <div className="relative flex items-center justify-center shrink-0">
        {pct !== null ? ring(pct, color) : <div className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center" />}
        <span className="absolute text-xl">{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-xs text-white/40 uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-2xl font-bold" style={{ color }}>
          {value != null ? value.toLocaleString("nl-NL") : "–"}
          <span className="text-sm font-normal text-white/50 ml-1">{unit}</span>
        </div>
        {goal != null && (
          <div className="text-xs text-white/30 mt-0.5">doel: {goal.toLocaleString("nl-NL")} {unit}</div>
        )}
      </div>
    </div>
  );
}

function HRZoneBar({ zone }: { zone: { name: string; minutes: number; min: number; max: number; caloriesOut: number } }) {
  const colors: Record<string, string> = {
    "Out of Range": "#6b7280",
    "Fat Burn": "#f59e0b",
    "Cardio": "#f97316",
    "Peak": "#ef4444",
  };
  const color = colors[zone.name] ?? "#6b7280";
  const pct = Math.min((zone.minutes / 60) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs text-white/50 text-right shrink-0">{zone.name}</div>
      <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="w-16 text-xs text-white/60 text-right shrink-0">
        {zone.minutes} min
      </div>
    </div>
  );
}

function SleepStage({ label, minutes, color }: { label: string; minutes: number | null; color: string }) {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (
    <div className="flex flex-col items-center">
      <div className="text-lg font-bold" style={{ color }}>{h > 0 ? `${h}u ${m}m` : `${m}m`}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

function FitbitDashboard() {
  const params = useSearchParams();
  const authError = params.get("error");

  const { data, isLoading, isValidating, mutate } = useSWR("/api/fitbit/data", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: true,
  });

  const notAuth = data?.error === "not_authenticated" || authError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        Fitbit data laden…
      </div>
    );
  }

  if (notAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
        <div className="text-4xl">⌚</div>
        <div>
          <div className="font-bold text-lg mb-1">Koppel je Fitbit</div>
          <div className="text-white/50 text-sm max-w-sm">
            Log eenmalig in met je Fitbit-account om je gezondheidsdata op dit scherm te zien.
          </div>
        </div>
        {authError && (
          <div className="text-red-400 text-xs bg-red-400/10 rounded px-3 py-1.5">
            Koppeling mislukt ({authError}). Probeer opnieuw.
          </div>
        )}
        <a
          href="/api/fitbit/auth"
          className="bg-[#00b0b9] hover:bg-[#00c8d2] text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Verbinden met Fitbit
        </a>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
        <div className="text-white/40 text-sm">Data ophalen mislukt.</div>
        <button onClick={() => mutate()} className="text-[#00d4aa] text-sm hover:underline">Opnieuw proberen</button>
      </div>
    );
  }

  const totalSleepH = data?.sleep?.hours ?? 0;
  const totalSleepM = data?.sleep?.mins ?? 0;
  const sleepPct = data?.sleep?.totalMinutes ? (data.sleep.totalMinutes / 480) * 100 : 0;

  return (
    <div className="h-full overflow-y-auto px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {data?.profile?.avatar && (
            <img src={data.profile.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
          )}
          <div>
            <div className="font-bold text-sm">{data?.profile?.name}</div>
            <div className="text-xs text-white/30">{new Date(data?.date ?? "").toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isValidating && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />}
          <a href="/api/fitbit/logout" className="text-xs text-white/25 hover:text-white/50 transition-colors">afmelden</a>
        </div>
      </div>

      {/* Activity stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Stappen" value={data?.steps} unit="stappen" goal={data?.stepsGoal} color="#00d4aa" icon="👣" />
        <StatCard label="Calorieën" value={data?.calories} unit="kcal" goal={data?.caloriesGoal} color="#f97316" icon="🔥" />
        <StatCard label="Afstand" value={data?.distance} unit="km" color="#3b82f6" icon="📍" />
        <StatCard label="Actieve min." value={data?.activeMinutes} unit="min" goal={data?.activeMinutesGoal} color="#a855f7" icon="⚡" />
      </div>

      {/* Heart rate */}
      {(data?.restingHR || (data?.hrZones?.length ?? 0) > 0) && (
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/40 uppercase tracking-wider">Hartslag</div>
            {data?.restingHR && (
              <div className="text-sm font-bold text-red-400">
                ❤️ {data.restingHR} bpm <span className="font-normal text-white/30 text-xs">in rust</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {(data?.hrZones ?? []).map((z: any) => (
              <HRZoneBar key={z.name} zone={z} />
            ))}
          </div>
        </div>
      )}

      {/* Sleep */}
      {data?.sleep?.totalMinutes > 0 && (
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="text-xs text-white/40 uppercase tracking-wider">Slaap</div>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {ring(sleepPct, "#818cf8", 80, 8)}
              <span className="absolute inset-0 flex items-center justify-center text-base">😴</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-400">
                {totalSleepH}u {totalSleepM}m
              </div>
              {data.sleep.efficiency && (
                <div className="text-xs text-white/30 mt-0.5">efficiëntie {data.sleep.efficiency}%</div>
              )}
            </div>
          </div>
          {data.sleep.deep != null && (
            <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/5">
              <SleepStage label="Diep" minutes={data.sleep.deep} color="#818cf8" />
              <SleepStage label="Licht" minutes={data.sleep.light} color="#60a5fa" />
              <SleepStage label="REM" minutes={data.sleep.rem} color="#a78bfa" />
              <SleepStage label="Wakker" minutes={data.sleep.wake} color="#6b7280" />
            </div>
          )}
        </div>
      )}

      {data?.floors > 0 && (
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">🏢</span>
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider">Verdiepingen</div>
            <div className="font-bold text-yellow-400">{data.floors}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FitbitPage() {
  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0d1b2a] text-white select-none">
      <header className="shrink-0 flex items-center justify-between border-b border-white/10 px-5" style={{ height: 44 }}>
        <div className="flex items-center gap-4">
          <a href="/" className="text-white/40 hover:text-white text-xs transition-colors">← WK 2026</a>
          <div className="flex items-center gap-2">
            <span className="text-lg">⌚</span>
            <span className="font-bold text-sm tracking-widest uppercase">Fitbit Dashboard</span>
          </div>
        </div>
      </header>
      <main className="flex-1 min-h-0">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-white/30 text-sm">Laden…</div>}>
          <FitbitDashboard />
        </Suspense>
      </main>
    </div>
  );
}
