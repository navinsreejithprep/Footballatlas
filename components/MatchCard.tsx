import Link from "next/link";
import type { Match, Team } from "@/lib/football/types";
import { LEAGUES } from "@/lib/football/types";
import { LEAGUE_THEMES } from "@/lib/league-theme";
import { TeamCrest } from "./TeamCrest";

type Tone = "live" | "upcoming" | "finished";

function statusLabel(match: Match): { label: string; tone: Tone } {
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

/** `showLeague={false}` on pages that are already about one league: the label shows the matchday instead. */
export function MatchCard({ match, showLeague = true }: { match: Match; showLeague?: boolean }) {
  const status = statusLabel(match);
  const hasScore = match.homeScore != null && match.awayScore != null;
  const decided = status.tone === "finished" && hasScore && match.homeScore !== match.awayScore;
  const homeWon = decided && match.homeScore! > match.awayScore!;
  const awayWon = decided && match.awayScore! > match.homeScore!;

  return (
    <Link
      href={`/leagues/${match.leagueCode}`}
      className="card-shadow card-hover relative block overflow-hidden rounded-xl border border-border bg-surface p-4 pt-5"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundImage: LEAGUE_THEMES[match.leagueCode].gradient }}
      />
      <div className="mb-3 flex items-center justify-between gap-2 text-xs">
        <span className="truncate font-semibold text-text-muted">
          {showLeague
            ? `${LEAGUES[match.leagueCode].flag} ${LEAGUES[match.leagueCode].name}`
            : match.matchday
              ? `Matchday ${match.matchday}`
              : ""}
        </span>
        <span
          className={[
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 font-bold",
            status.tone === "live" && "bg-negative text-white",
            status.tone === "finished" && "bg-surface-raised text-text-muted",
            status.tone === "upcoming" && "bg-accent-soft text-accent",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {status.tone === "live" && (
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" />
          )}
          {status.label}
        </span>
      </div>
      <TeamRow team={match.homeTeam} score={hasScore ? match.homeScore : undefined} strong={homeWon} dim={awayWon} />
      <div className="mt-2">
        <TeamRow team={match.awayTeam} score={hasScore ? match.awayScore : undefined} strong={awayWon} dim={homeWon} />
      </div>
    </Link>
  );
}

function TeamRow({
  team,
  score,
  strong,
  dim,
}: {
  team: Team;
  score?: number | null;
  strong: boolean;
  dim: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-2.5">
      <TeamCrest team={team} size={26} />
      <span
        className={[
          "min-w-0 flex-1 truncate text-sm",
          strong ? "font-extrabold" : dim ? "font-medium text-text-muted" : "font-semibold",
        ].join(" ")}
      >
        {team.shortName}
      </span>
      {score != null && (
        <span className={["text-lg tabular-nums", strong ? "font-extrabold text-accent" : "font-bold"].join(" ")}>
          {score}
        </span>
      )}
    </div>
  );
}
