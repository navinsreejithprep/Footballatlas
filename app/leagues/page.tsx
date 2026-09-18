import Link from "next/link";
import { getFootballProvider, LEAGUES, type LeagueCode } from "@/lib/football";
import { DataMetaBadge } from "@/components/DataMetaBadge";
import { PageHero } from "@/components/PageHero";
import { TeamCrest } from "@/components/TeamCrest";
import { LEAGUE_THEMES } from "@/lib/league-theme";

export const revalidate = 60;

export default async function LeaguesPage() {
  const provider = getFootballProvider();
  const codes = Object.keys(LEAGUES) as LeagueCode[];
  const results = await Promise.all(codes.map((code) => provider.getStandings(code)));

  return (
    <div className="flex flex-col gap-6">
      <PageHero
        eyebrow="Europe’s top five"
        title="Leagues"
        lead="Pick a league to see the full table, momentum and fixtures."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => {
          const leader = result.standings[0];
          return (
            <Link
              key={result.league.code}
              href={`/leagues/${result.league.code}`}
              className="card-shadow card-hover overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div
                className="flex items-center justify-between px-5 py-4 text-white"
                style={{ backgroundImage: LEAGUE_THEMES[result.league.code].gradient }}
              >
                <span className="text-3xl">{LEAGUES[result.league.code].flag}</span>
                {result.league.season && (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold ring-1 ring-white/30">
                    {result.league.season}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h2 className="text-lg font-extrabold tracking-tight">{result.league.name}</h2>
                <p className="text-xs text-text-muted">{result.league.country}</p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Leader</span>
                  <span className="flex items-center gap-2 text-sm font-bold">
                    {leader && <TeamCrest team={leader.team} size={22} />}
                    {leader?.team.shortName ?? "—"}
                  </span>
                </div>
                <div className="mt-3">
                  <DataMetaBadge meta={result.meta} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
