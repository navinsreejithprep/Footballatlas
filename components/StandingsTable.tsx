import Link from "next/link";
import type { Standing } from "@/lib/football/types";
import { TeamCrest } from "./TeamCrest";

export function StandingsTable({
  standings,
  highlightTeamId,
  compact = false,
}: {
  standings: Standing[];
  highlightTeamId?: string;
  /** Narrow cards: keep only #, club, played, goal difference and points. */
  compact?: boolean;
}) {
  const extra = compact ? "hidden" : "";
  // The free data tier has no form; an all-dashes column is just noise.
  const showForm = !compact && standings.some((s) => s.form);
  if (!standings.length) {
    return <p className="text-sm text-text-muted">Standings unavailable.</p>;
  }

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-white">
      <table className={`w-full border-collapse text-sm ${compact ? "" : "min-w-[640px]"}`}>
        <thead>
          <tr className="border-b border-border bg-surface-raised text-left text-xs uppercase tracking-wide text-text-muted">
            <th className="px-3 py-2.5 font-medium">#</th>
            <th className="px-3 py-2.5 font-medium">Club</th>
            <th className="px-3 py-2.5 text-center font-medium">P</th>
            <th className={`px-3 py-2.5 text-center font-medium ${extra}`}>W</th>
            <th className={`px-3 py-2.5 text-center font-medium ${extra}`}>D</th>
            <th className={`px-3 py-2.5 text-center font-medium ${extra}`}>L</th>
            <th className={`px-3 py-2.5 text-center font-medium ${extra}`}>GF</th>
            <th className={`px-3 py-2.5 text-center font-medium ${extra}`}>GA</th>
            <th className="px-3 py-2.5 text-center font-medium">GD</th>
            <th className="px-3 py-2.5 text-center font-medium">Pts</th>
            {showForm && <th className="px-3 py-2.5 font-medium">Form</th>}
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const isHighlighted = s.team.id === highlightTeamId;
            const inTopFour = s.position <= 4;
            const inDropZone = s.position >= standings.length - 2;
            const zoneColor = inTopFour ? "border-l-positive" : inDropZone ? "border-l-negative" : "border-l-transparent";
            return (
              <tr
                key={s.team.id}
                className={[
                  "border-b border-border/60 border-l-2 last:border-b-0",
                  zoneColor,
                  isHighlighted ? "bg-accent-soft" : "hover:bg-surface-raised/70",
                ].join(" ")}
              >
                <td className="px-3 py-2.5">
                  <span
                    className={[
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                      inTopFour && "bg-positive text-white",
                      inDropZone && "bg-negative text-white",
                      !inTopFour && !inDropZone && "text-text-muted",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {s.position}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-semibold">
                  <Link href={`/teams/${s.team.id}`} className="flex items-center gap-2.5 hover:text-accent">
                    <TeamCrest team={s.team} size={22} />
                    <span>{s.team.shortName}</span>
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.playedGames}</td>
                <td className={`px-3 py-2.5 text-center tabular-nums ${extra}`}>{s.won}</td>
                <td className={`px-3 py-2.5 text-center tabular-nums ${extra}`}>{s.draw}</td>
                <td className={`px-3 py-2.5 text-center tabular-nums ${extra}`}>{s.lost}</td>
                <td className={`px-3 py-2.5 text-center tabular-nums ${extra}`}>{s.goalsFor}</td>
                <td className={`px-3 py-2.5 text-center tabular-nums ${extra}`}>{s.goalsAgainst}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td className="px-3 py-2.5 text-center text-base font-extrabold tabular-nums text-accent">{s.points}</td>
                {showForm && (
                  <td className="px-3 py-2.5">
                    <FormBadges form={s.form} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FormBadges({ form }: { form?: string }) {
  if (!form) return <span className="text-text-muted">—</span>;
  return (
    <div className="flex gap-1">
      {form
        .slice(-5)
        .split("")
        .map((r, i) => (
          <span
            key={i}
            className={[
              "flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold",
              r === "W" && "bg-positive text-white",
              r === "D" && "bg-border text-text-muted",
              r === "L" && "bg-negative text-white",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {r}
          </span>
        ))}
    </div>
  );
}
