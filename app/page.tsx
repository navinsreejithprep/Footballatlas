import Link from "next/link";
import { getFootballProvider, LEAGUES, type LeagueCode } from "@/lib/football";
import { computeMomentumTable } from "@/lib/football/momentum";
import { SectionCard } from "@/components/SectionCard";
import { MatchCard } from "@/components/MatchCard";
import { MomentumList, ProprietaryBadge } from "@/components/MomentumList";
import { DataMetaBadge } from "@/components/DataMetaBadge";
import { StandingsTable } from "@/components/StandingsTable";
import { PageHero } from "@/components/PageHero";
import { TeamCrest } from "@/components/TeamCrest";
import { LEAGUE_THEMES } from "@/lib/league-theme";

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
      <PageHero
        eyebrow={now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        title="Europe at a glance"
        lead="Live scores, tables and momentum across the Premier League, La Liga, Serie A, Bundesliga and Ligue 1."
      >
        <div className="mt-1 flex flex-wrap items-stretch gap-3">
          <HeroStat label="Live now" value={liveMatches.meta.note ? "—" : liveMatches.matches.length} pulse={liveMatches.matches.length > 0} />
          <HeroStat label="Fixtures today" value={todayMatches.meta.note ? "—" : todayMatches.matches.length} />
          <HeroStat label="Leagues" value={ALL_LEAGUES.length} />
        </div>
        <div className="mt-1">
          <DataMetaBadge meta={featuredLeague.meta} onBrand />
        </div>
      </PageHero>

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
                  <Link href={`/leagues/${result.league.code}`} className="flex items-center gap-2 font-bold hover:text-accent">
                    <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: LEAGUE_THEMES[result.league.code].solid }} />
                    {LEAGUES[result.league.code].flag} {result.league.name}
                  </Link>
                  <span className="text-xs text-text-muted">Leader: {result.standings[0]?.team.shortName ?? "—"}</span>
                </div>
                <StandingsTable standings={result.standings.slice(0, 3)} compact />
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
              <div key={result.league.code} className="relative overflow-hidden rounded-xl border border-border bg-white p-4 pt-5">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundImage: LEAGUE_THEMES[result.league.code].gradient }} />
                <p className="text-xs font-bold uppercase tracking-wide text-text-muted">
                  {LEAGUES[result.league.code].flag} {LEAGUES[result.league.code].name}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  {leader && <TeamCrest team={leader.team} size={36} />}
                  <div className="min-w-0">
                    <p className="truncate text-lg font-extrabold">{leader?.team.shortName ?? "—"}</p>
                    <p className="text-xs text-text-muted">
                      <span className="font-bold text-accent">{leader?.points ?? "—"} pts</span> · {gap != null ? `${gap} pt gap to 2nd` : "—"} · {leader?.playedGames ?? "—"} played
                    </p>
                  </div>
                </div>
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
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {news.slice(0, 6).map((n) => (
        <li key={n.id}>
          <a
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-hover flex h-full flex-col gap-2 rounded-xl border border-border bg-white p-4"
          >
            <span className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-0.5 font-bold ${SOURCE_STYLES[n.source] ?? "bg-accent-soft text-accent"}`}>
                {n.source}
              </span>
              <span className="text-text-muted">
                {new Date(n.publishedAt).toLocaleDateString([], { day: "numeric", month: "short" })} · {n.category}
              </span>
            </span>
            <span className="text-sm font-bold leading-snug">{n.headline}</span>
            {n.summary && <span className="line-clamp-2 text-xs text-text-muted">{n.summary}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

const SOURCE_STYLES: Record<string, string> = {
  "BBC Sport": "bg-[#ffe680] text-[#4a3800]",
  "The Guardian": "bg-[#dbe8ff] text-[#052962]",
};

function HeroStat({ label, value, pulse = false }: { label: string; value: string | number; pulse?: boolean }) {
  return (
    <div className="min-w-28 rounded-2xl bg-white/15 px-4 py-2.5 ring-1 ring-white/25 backdrop-blur">
      <p className="flex items-center gap-2 text-2xl font-extrabold tabular-nums">
        {pulse && <span aria-hidden className="h-2 w-2 rounded-full bg-white motion-safe:animate-pulse" />}
        {value}
      </p>
      <p className="text-xs font-semibold text-white/90">{label}</p>
    </div>
  );
}
