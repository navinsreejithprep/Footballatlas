import { notFound } from "next/navigation";
import { getFootballProvider, LEAGUES } from "@/lib/football";
import { computeMomentum } from "@/lib/football/momentum";
import { SectionCard } from "@/components/SectionCard";
import { MatchCard } from "@/components/MatchCard";
import { DataMetaBadge } from "@/components/DataMetaBadge";
import { ProprietaryBadge } from "@/components/MomentumList";

export const revalidate = 60;

export default async function TeamPage({ params }: { params: Promise<{ team: string }> }) {
  const { team: teamId } = await params;
  const provider = getFootballProvider();
  let result;
  try {
    result = await provider.getTeam(teamId);
  } catch {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Team data unavailable</h1>
        <p className="text-sm text-text-muted">Live data is temporarily unavailable. Please try again in a minute.</p>
      </div>
    );
  }

  if (!result) notFound();

  const { team, standing, recentMatches, upcomingMatches, meta } = result;
  const momentum = standing ? computeMomentum(standing) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{team.name}</h1>
          <span className="text-sm text-text-muted">
            {LEAGUES[team.leagueCode].flag} {LEAGUES[team.leagueCode].name}
          </span>
        </div>
        <div className="mt-2">
          <DataMetaBadge meta={meta} />
        </div>
      </div>

      {standing && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Position" value={`#${standing.position}`} />
          <Stat label="Points" value={standing.points} />
          <Stat label="Played" value={standing.playedGames} />
          <Stat label="Goal difference" value={standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference} />
        </div>
      )}

      {momentum && (
        <SectionCard title="Momentum">
          <div className="mb-3">
            <ProprietaryBadge tooltip="Momentum Index blends weighted recent form (65%) and goal-difference trend (35%) into a deterministic -100..+100 score. It is Football Atlas' own analysis, not an official statistic." />
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-3xl font-semibold tabular-nums">{momentum.momentumIndex}</p>
              <p className="text-xs text-text-muted">Momentum Index</p>
            </div>
            <div>
              <p className="text-sm font-medium capitalize">{momentum.trend}</p>
              <p className="text-xs text-text-muted">Trend vs. recent average</p>
            </div>
            <div>
              <p className="text-sm font-medium">{momentum.recentForm}</p>
              <p className="text-xs text-text-muted">Recent form</p>
            </div>
          </div>
        </SectionCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Recent matches">
          {recentMatches.length ? (
            <div className="flex flex-col gap-3">
              {recentMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No recent matches available.</p>
          )}
        </SectionCard>

        <SectionCard title="Upcoming fixtures">
          {upcomingMatches.length ? (
            <div className="flex flex-col gap-3">
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No upcoming fixtures available.</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
