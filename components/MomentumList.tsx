import Link from "next/link";
import type { MomentumEntry } from "@/lib/football/types";

export function ProprietaryBadge({ tooltip }: { tooltip: string }) {
  return (
    <span
      title={tooltip}
      className="inline-flex cursor-help items-center gap-1 rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold"
    >
      Football Atlas proprietary indicator
    </span>
  );
}

export function MomentumList({ entries, limit = 6 }: { entries: MomentumEntry[]; limit?: number }) {
  const rows = entries.slice(0, limit);
  if (!rows.length) return <p className="text-sm text-text-muted">No data available.</p>;

  return (
    <ul className="divide-y divide-border/60">
      {rows.map((entry) => (
        <li key={entry.team.id} className="flex items-center justify-between gap-3 py-2.5">
          <Link href={`/teams/${entry.team.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">
            {entry.team.shortName}
          </Link>
          <span className="text-xs text-text-muted">{entry.recentForm}</span>
          <TrendPill trend={entry.trend} value={entry.momentumIndex} />
        </li>
      ))}
    </ul>
  );
}

function TrendPill({ trend, value }: { trend: "up" | "down" | "flat"; value: number }) {
  const arrow = trend === "up" ? "▲" : trend === "down" ? "▼" : "▬";
  const tone =
    trend === "up" ? "text-positive bg-positive/10" : trend === "down" ? "text-negative bg-negative/10" : "text-text-muted bg-text-muted/10";
  return (
    <span className={`flex w-16 items-center justify-end gap-1 rounded-full px-2 py-1 text-xs font-semibold tabular-nums ${tone}`}>
      {arrow} {value}
    </span>
  );
}
