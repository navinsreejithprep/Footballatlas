import Link from "next/link";
import { getFootballProvider, LEAGUES, type LeagueCode } from "@/lib/football";
import { DataMetaBadge } from "@/components/DataMetaBadge";

export const revalidate = 60;

export default async function LeaguesPage() {
  const provider = getFootballProvider();
  const codes = Object.keys(LEAGUES) as LeagueCode[];
  const results = await Promise.all(codes.map((code) => provider.getStandings(code)));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leagues</h1>
        <p className="mt-1 text-sm text-text-muted">Europe's top five domestic leagues. More competitions can be added later.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => {
          const leader = result.standings[0];
          return (
            <Link
              key={result.league.code}
              href={`/leagues/${result.league.code}`}
              className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-raised"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{LEAGUES[result.league.code].flag}</span>
                <span className="text-xs text-text-muted">{result.league.season}</span>
              </div>
              <h2 className="mt-2 text-base font-semibold">{result.league.name}</h2>
              <p className="text-xs text-text-muted">{result.league.country}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-text-muted">Leader</span>
                <span className="text-sm font-medium">{leader?.team.shortName ?? "—"}</span>
              </div>
              <div className="mt-2">
                <DataMetaBadge meta={result.meta} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
