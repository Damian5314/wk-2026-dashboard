"use client";

import useSWR from "swr";
import { useState } from "react";
import GroupCard from "@/components/GroupCard";
import KnockoutBracket from "@/components/KnockoutBracket";
import { Group, KnockoutMatch } from "@/lib/wc2026-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [tab, setTab] = useState<"groups" | "knockout">("knockout");

  const { data, isLoading, isValidating } = useSWR<{
    groups: Group[];
    knockout: KnockoutMatch[];
    lastUpdated: string;
  }>("/api/standings", fetcher, {
    refreshInterval: 300000, // 5 min — server serveert gecachete data, geen extra API-calls
    revalidateOnFocus: true,
  });

  const lastUpdated = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleTimeString("nl-NL")
    : null;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0d1b2a] text-white select-none">
      {/* Slim header */}
      <header className="shrink-0 flex items-center justify-between border-b border-white/10 px-5 py-0" style={{ height: 44 }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚽</span>
            <span className="font-bold text-sm tracking-widest uppercase">FIFA World Cup 26™</span>
          </div>
          <div className="flex gap-4 ml-4">
            {(["groups", "knockout"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-bold uppercase tracking-wider py-0.5 border-b-2 transition-colors ${
                  tab === t ? "border-[#00d4aa] text-[#00d4aa]" : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                {t === "groups" ? "Groepsfase" : "Knock-out"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#00d4aa] inline-block" />1–2: door
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-yellow-500 inline-block" />3e: beste 8
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-white/20 inline-block" />uit
          </span>
          {isValidating && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />}
          {lastUpdated && <span>↻ {lastUpdated}</span>}
          <a href="/fitbit" className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors ml-2 border-l border-white/10 pl-3">
            <span>⌚</span><span>Fitbit</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 min-h-0 px-3 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">Laden…</div>
        ) : tab === "groups" ? (
          <div className="grid grid-cols-4 grid-rows-3 gap-2 h-full">
            {(data?.groups ?? []).map((group) => (
              <GroupCard key={group.name} group={group} />
            ))}
          </div>
        ) : (
          <KnockoutBracket matches={data?.knockout ?? []} />
        )}
      </main>
    </div>
  );
}
