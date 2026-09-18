import type { DataMeta } from "@/lib/football/types";

export function DataMetaBadge({ meta }: { meta: DataMeta }) {
  const isLive = !meta.note;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={[
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
          isLive
            ? "border-positive/30 bg-positive/10 text-positive"
            : "border-gold/30 bg-gold/10 text-gold",
        ].join(" ")}
      >
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            isLive ? "bg-positive" : "bg-gold",
          ].join(" ")}
        />
        {isLive ? "Live data · football-data.org" : "Live data unavailable"}
      </span>
      {meta.note && <span className="text-text-muted">{meta.note}</span>}
      <span className="text-text-muted">
        Updated {new Date(meta.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
