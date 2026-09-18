import Link from "next/link";
import { getFootballProvider, LEAGUES, type LeagueCode } from "@/lib/football";
import { computeMomentumTable } from "@/lib/football/momentum";
import { SectionCard } from "@/components/SectionCard";
import { MatchCard } from "@/components/MatchCard";
import { MomentumList, ProprietaryBadge } from "@/components/MomentumList";
import { DataMetaBadge } from "@/components/DataMetaBadge";
import { StandingsTable } from "@/components/StandingsTable";

export const revalidate = 60;

const ALL_LEAGUES = Object.keys(LEAGUES) as LeagueCode[];

export default async function DashboardPage() {
  const provider = getFootballProvider();

  const [liveMatches, todayMatches, standingsAll] = await Promise.all([
    provider.getMatches({ status: ["IN_PLAY", "LIVE", "PAUSED"] }),
    provider.getMatches({
      dateFrom: new Date().toISOString().slice(0, 10),
      dateTo: new Date().toISOString().slice(0, 10),
    }),
    Promise.all(ALL_LEAGUES.map((code) => provider.getStandings(code))),
  ]);

  const featuredLeague = standingsAll[0];
  const momentum = computeMomentumTable(featuredLeague.standings);
  const biggestMovers = momentum.filter((m) => m.trend !== "flat").slice(0, 6);

  const now = new Date();
  const showcaseMatches = liveMatches.matches.length ? liveMatches.matches : todayMatches.matches;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Europe at a glance</h1>
          <span className="text-xs text-text-muted">
            {now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
        <DataMetaBadge meta={featuredLeague.meta} />
      </div>

      <SectionCard
        title={liveMatches.matches.length ? "Live right now" : "Today's fixtures"}
        subtitle="What's happening now across Europe's top five leagues"
        viewAllHref="/matches"
      >
        {showcaseMatches.length === 0 ? (
          <p className="text-sm text-text-muted">No matches scheduled today.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {showcaseMatches.slice(0, 6).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="European league overview" subtitle="Top of the table, all five leagues" viewAllHref="/leagues">
          <div className="flex flex-col gap-4">
            {standingsAll.map((result) => (
              <div key={result.league.code}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <Link href={`/leagues/${result.league.code}`} className="font-medium hover:text-accent">
                    {LEAGUES[result.league.code].flag} {result.league.name}
                  </Link>
                  <span className="text-xs text-text-muted">Leader: {result.standings[0]?.team.shortName ?? "—"}</span>
                </div>
                <StandingsTable standings={result.standings.slice(0, 3)} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Biggest movers"
          subtitle={featuredLeague.league.name}
          viewAllHref={`/leagues/${featuredLeague.league.code}`}
        >
          <div className="mb-3">
            <ProprietaryBadge tooltip="Momentum Index blends weighted recent form (65%) and goal-difference trend (35%) into a deterministic -100..+100 score. It is Football Atlas' own analysis, not an official statistic." />
          </div>
          <MomentumList entries={biggestMovers.length ? biggestMovers : momentum} />
        </SectionCard>
      </div>

      <SectionCard title="Title race snapshot" subtitle="Current standings only — not a prediction">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {standingsAll.map((result) => {
            const leader = result.standings[0];
            const second = result.standings[1];
            const gap = leader && second ? leader.points - second.points : null;
            return (
              <div key={result.league.code} className="rounded-xl border border-border p-4">
                <p className="text-xs text-text-muted">{LEAGUES[result.league.code].name}</p>
                <p className="mt-1 text-lg font-semibold">{leader?.team.shortName ?? "—"}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {leader?.points ?? "—"} pts · {gap != null ? `${gap} pt gap to 2nd` : "—"} · {leader?.playedGames ?? "—"} played
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Newswire" subtitle="Headlines and summaries — links go to original sources">
        <NewsPreview />
      </SectionCard>
    </div>
  );
}

async function NewsPreview() {
  const provider = getFootballProvider();
  const news = await provider.getNews();
  if (!news.length) return <p className="text-sm text-text-muted">No news available.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {news.slice(0, 4).map((n) => (
        <li key={n.id} className="border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
          <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-accent hover:underline">
            {n.headline}
          </a>
          <p className="mt-0.5 text-xs text-text-muted">
            {n.source} · {new Date(n.publishedAt).toLocaleDateString()} · {n.category}
          </p>
        </li>
      ))}
    </ul>
  );
}
