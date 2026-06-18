"use client";

import useSWR from "swr";
import { useState } from "react";
import GroupCard from "@/components/GroupCard";
import KnockoutBracket from "@/components/KnockoutBracket";
import { Group, KnockoutMatch } from "@/lib/wc2026-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const [tab, setTab] = useState<"groups" | "knockout">("groups");

  const { data, isLoading, isValidating } = useSWR<{
    groups: Group[];
    knockout: KnockoutMatch[];
    lastUpdated: string;
  }>("/api/standings", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  const lastUpdated = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleTimeString("nl-NL")
    : null;

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚽</span>
            <span className="font-bold text-lg tracking-wide uppercase">
              FIFA World Cup 26™
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            {isValidating && (
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
            {lastUpdated && <span>Bijgewerkt: {lastUpdated}</span>}
          </div>
        </div>
        <div className="max-w-screen-xl mx-auto mt-3 flex gap-6">
          {(["groups", "knockout"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                tab === t
                  ? "border-[#00d4aa] text-[#00d4aa]"
                  : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {t === "groups" ? "Groepsfase" : "Knock-out fase"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-white/40">
            Laden…
          </div>
        ) : tab === "groups" ? (
          <>
            <div className="flex flex-wrap gap-4 mb-6 text-xs text-white/60">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#00d4aa] inline-block" />
                1–2: directe plaatsing Laatste 32
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" />
                3e plek: beste 8 gaan door
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-white/20 inline-block" />
                uitgeschakeld
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(data?.groups ?? []).map((group) => (
                <GroupCard key={group.name} group={group} />
              ))}
            </div>
          </>
        ) : (
          <KnockoutBracket matches={data?.knockout ?? []} />
        )}
      </main>
    </div>
  );
}
