import Link from "next/link";
import type { Standing } from "@/lib/football/types";

export function StandingsTable({
  standings,
  highlightTeamId,
}: {
  standings: Standing[];
  highlightTeamId?: string;
}) {
  if (!standings.length) {
    return <p className="text-sm text-text-muted">Standings unavailable.</p>;
  }

  return (
    <div className="scrollbar-thin overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
            <th className="px-3 py-2.5 font-medium">#</th>
            <th className="px-3 py-2.5 font-medium">Club</th>
            <th className="px-3 py-2.5 text-center font-medium">P</th>
            <th className="px-3 py-2.5 text-center font-medium">W</th>
            <th className="px-3 py-2.5 text-center font-medium">D</th>
            <th className="px-3 py-2.5 text-center font-medium">L</th>
            <th className="px-3 py-2.5 text-center font-medium">GF</th>
            <th className="px-3 py-2.5 text-center font-medium">GA</th>
            <th className="px-3 py-2.5 text-center font-medium">GD</th>
            <th className="px-3 py-2.5 text-center font-medium">Pts</th>
            <th className="px-3 py-2.5 font-medium">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const isHighlighted = s.team.id === highlightTeamId;
            const zoneColor =
              s.position <= 4
                ? "border-l-positive"
                : s.position >= standings.length - 2
                ? "border-l-negative"
                : "border-l-transparent";
            return (
              <tr
                key={s.team.id}
                className={[
                  "border-b border-border/60 border-l-2 last:border-b-0",
                  zoneColor,
                  isHighlighted ? "bg-accent-soft" : "hover:bg-surface-raised",
                ].join(" ")}
              >
                <td className="px-3 py-2.5 tabular-nums text-text-muted">{s.position}</td>
                <td className="px-3 py-2.5 font-medium">
                  <Link href={`/teams/${s.team.id}`} className="hover:text-accent">
                    {s.team.shortName}
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.playedGames}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.won}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.draw}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.lost}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.goalsFor}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{s.goalsAgainst}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">
                  {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
                </td>
                <td className="px-3 py-2.5 text-center font-semibold tabular-nums">{s.points}</td>
                <td className="px-3 py-2.5">
                  <FormBadges form={s.form} />
                </td>
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
              "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
              r === "W" && "bg-positive/20 text-positive",
              r === "D" && "bg-text-muted/20 text-text-muted",
              r === "L" && "bg-negative/20 text-negative",
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
