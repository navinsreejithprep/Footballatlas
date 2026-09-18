import type { Team } from "@/lib/football/types";

/** Club crest from the data source, or the club's initials if it has none. Decorative: the name always sits next to it. */
export function TeamCrest({
  team,
  size = 24,
  className = "",
}: {
  team: Pick<Team, "crest" | "tla" | "shortName">;
  size?: number;
  className?: string;
}) {
  if (team.crest) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.crest}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`shrink-0 object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-bold text-accent ${className}`}
      style={{ width: size, height: size }}
    >
      {(team.tla ?? team.shortName.slice(0, 3)).toUpperCase()}
    </span>
  );
}
