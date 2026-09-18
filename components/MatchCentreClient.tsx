"use client";

import { useMemo, useState } from "react";
import type { Match, LeagueCode } from "@/lib/football/types";
import { LEAGUES } from "@/lib/football/types";
import { MatchCard } from "./MatchCard";
import { SectionCard } from "./SectionCard";

type Bucket = "live" | "today" | "upcoming" | "recent";

function bucketOf(match: Match): Bucket {
  if (match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED") return "live";
  if (match.status === "FINISHED") return "recent";

  const now = new Date();
  const kickoff = new Date(match.utcDate);
  const isSameDay = kickoff.toDateString() === now.toDateString();
  return isSameDay ? "today" : "upcoming";
}

const LEAGUE_FILTERS: Array<{ code: LeagueCode | "ALL"; label: string }> = [
  { code: "ALL", label: "All leagues" },
  ...(Object.keys(LEAGUES) as LeagueCode[]).map((code) => ({ code, label: LEAGUES[code].name })),
];

export function MatchCentreClient({ matches }: { matches: Match[] }) {
  const [leagueFilter, setLeagueFilter] = useState<LeagueCode | "ALL">("ALL");
  const [teamQuery, setTeamQuery] = useState("");

  const filtered = useMemo(() => {
    return matches.filter((m) => {
      const matchesLeague = leagueFilter === "ALL" || m.leagueCode === leagueFilter;
      const query = teamQuery.trim().toLowerCase();
      const matchesTeam =
        !query ||
        m.homeTeam.name.toLowerCase().includes(query) ||
        m.awayTeam.name.toLowerCase().includes(query);
      return matchesLeague && matchesTeam;
    });
  }, [matches, leagueFilter, teamQuery]);

  const grouped = useMemo(() => {
    const buckets: Record<Bucket, Match[]> = { live: [], today: [], upcoming: [], recent: [] };
    for (const m of filtered) buckets[bucketOf(m)].push(m);
    buckets.recent.reverse();
    return buckets;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {LEAGUE_FILTERS.map((f) => (
            <button
              key={f.code}
              onClick={() => setLeagueFilter(f.code)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                leagueFilter === f.code
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-text-muted hover:bg-surface-raised hover:text-text",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={teamQuery}
          onChange={(e) => setTeamQuery(e.target.value)}
          placeholder="Filter by team…"
          className="w-full rounded-full border border-border bg-surface px-4 py-1.5 text-sm outline-none placeholder:text-text-muted focus:border-accent sm:w-56"
        />
      </div>

      <MatchBucket title="Live" matches={grouped.live} emptyText="Nothing live right now." />
      <MatchBucket title="Today" matches={grouped.today} emptyText="No matches scheduled today." />
      <MatchBucket title="Upcoming" matches={grouped.upcoming} emptyText="No upcoming fixtures in this window." />
      <MatchBucket title="Recent results" matches={grouped.recent} emptyText="No recent results in this window." />
    </div>
  );
}

function MatchBucket({ title, matches, emptyText }: { title: string; matches: Match[]; emptyText: string }) {
  return (
    <SectionCard title={title} subtitle={`${matches.length} match${matches.length === 1 ? "" : "es"}`}>
      {matches.length ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">{emptyText}</p>
      )}
    </SectionCard>
  );
}
