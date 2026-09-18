import type { DataMeta } from "@/lib/football/types";

/** `onBrand`: sits on the gradient hero, so the surrounding text switches to white. */
export function DataMetaBadge({ meta, onBrand = false }: { meta: DataMeta; onBrand?: boolean }) {
  const isLive = !meta.note;
  const mutedText = onBrand ? "text-white/90" : "text-text-muted";
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={[
          "inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 font-semibold shadow-sm",
          isLive ? "border-positive/30 text-positive" : "border-gold/40 text-gold",
        ].join(" ")}
      >
        <span
          className={[
            "h-1.5 w-1.5 rounded-full",
            isLive ? "bg-positive motion-safe:animate-pulse" : "bg-gold",
          ].join(" ")}
        />
        {isLive ? "Live data · football-data.org" : "Live data unavailable"}
      </span>
      {meta.note && <span className={mutedText}>{meta.note}</span>}
      <span className={mutedText}>
        Updated {new Date(meta.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
