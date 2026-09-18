import { notFound } from "next/navigation";
import { getFootballProvider, LEAGUES, type LeagueCode } from "@/lib/football";
import { computeMomentumTable } from "@/lib/football/momentum";
import { StandingsTable } from "@/components/StandingsTable";
import { DataMetaBadge } from "@/components/DataMetaBadge";
import { SectionCard } from "@/components/SectionCard";
import { MomentumList, ProprietaryBadge } from "@/components/MomentumList";
import { MatchCard } from "@/components/MatchCard";

export const revalidate = 60;

export function generateStaticParams() {
  return (Object.keys(LEAGUES) as LeagueCode[]).map((league) => ({ league }));
}

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ league: string }>;
}) {
  const { league } = await params;
  const code = league.toUpperCase() as LeagueCode;

  if (!(code in LEAGUES)) {
    notFound();
  }

  const provider = getFootballProvider();
  const [standingsResult, matchesResult] = await Promise.all([
    provider.getStandings(code),
    provider.getMatches({ leagueCode: code }),
  ]);

  const momentum = computeMomentumTable(standingsResult.standings);
  const upcoming = matchesResult.matches.filter((m) => m.status === "SCHEDULED" || m.status === "TIMED").slice(0, 4);
  const recent = matchesResult.matches.filter((m) => m.status === "FINISHED").slice(-4).reverse();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl">{LEAGUES[code].flag}</span>
          <h1 className="text-2xl font-semibold tracking-tight">{standingsResult.league.name}</h1>
          <span className="text-sm text-text-muted">{standingsResult.league.season}</span>
        </div>
        <div className="mt-2">
          <DataMetaBadge meta={standingsResult.meta} />
        </div>
      </div>

      <SectionCard title="Table">
        <StandingsTable standings={standingsResult.standings} />
        <p className="mt-3 text-xs text-text-muted">
          Green edge: European qualification zone (top 4). Red edge: relegation zone (bottom 3).
        </p>
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Recent results">
          {recent.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recent.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No recent results.</p>
          )}
        </SectionCard>

        <SectionCard title="Upcoming fixtures">
          {upcoming.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {upcoming.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No upcoming fixtures.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Momentum Index" subtitle="Every club in the league, ranked by momentum">
        <div className="mb-3">
          <ProprietaryBadge tooltip="Momentum Index blends weighted recent form (65%) and goal-difference trend (35%) into a deterministic -100..+100 score. It is Football Atlas' own analysis, not an official statistic." />
        </div>
        <MomentumList entries={momentum} limit={momentum.length} />
      </SectionCard>
    </div>
  );
}
