import Link from "next/link";
import type { Match } from "@/lib/football/types";
import { LEAGUES } from "@/lib/football/types";

function statusLabel(match: Match): { label: string; tone: "live" | "upcoming" | "finished" } {
  if (match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED") {
    return { label: "LIVE", tone: "live" };
  }
  if (match.status === "FINISHED") return { label: "FT", tone: "finished" };
  if (match.status === "POSTPONED") return { label: "Postponed", tone: "upcoming" };
  if (match.status === "CANCELLED") return { label: "Cancelled", tone: "upcoming" };

  const kickoff = new Date(match.utcDate);
  return {
    label: kickoff.toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" }),
    tone: "upcoming",
  };
}

export function MatchCard({ match }: { match: Match }) {
  const status = statusLabel(match);
  const hasScore = match.homeScore != null && match.awayScore != null;

  return (
    <Link
      href={`/leagues/${match.leagueCode}`}
      className="block rounded-xl border border-border bg-surface p-4 transition hover:border-accent/40 hover:bg-surface-raised"
    >
      <div className="mb-3 flex items-center justify-between text-xs text-text-muted">
        <span>
          {LEAGUES[match.leagueCode].flag} {LEAGUES[match.leagueCode].name}
        </span>
        <span
          className={[
            "rounded-full px-2 py-0.5 font-semibold",
            status.tone === "live" && "bg-negative/15 text-negative",
            status.tone === "finished" && "bg-text-muted/15 text-text-muted",
            status.tone === "upcoming" && "bg-accent/15 text-accent",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {status.label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <TeamRow name={match.homeTeam.shortName} score={hasScore ? match.homeScore : undefined} />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <TeamRow name={match.awayTeam.shortName} score={hasScore ? match.awayScore : undefined} />
      </div>
    </Link>
  );
}

function TeamRow({ name, score }: { name: string; score?: number | null }) {
  return (
    <div className="flex w-full items-center justify-between">
      <span className="truncate text-sm font-medium">{name}</span>
      {score != null && <span className="tabular-nums font-semibold">{score}</span>}
    </div>
  );
}
