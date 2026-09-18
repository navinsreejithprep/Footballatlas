import type { LeagueCode } from "./football/types";

/** Presentation-only colors so each league has its own identity across the UI. */
export interface LeagueTheme {
  /** Solid accent for stripes and dots. */
  solid: string;
  /** Banner gradient; dark enough on the left to carry white text. */
  gradient: string;
}

export const LEAGUE_THEMES: Record<LeagueCode, LeagueTheme> = {
  PL: { solid: "#8a22b5", gradient: "linear-gradient(120deg, #38003c 0%, #7a1fa2 55%, #d6106a 100%)" },
  PD: { solid: "#e8481c", gradient: "linear-gradient(120deg, #b3141f 0%, #e03a1e 55%, #f07a12 100%)" },
  SA: { solid: "#0a6fd6", gradient: "linear-gradient(120deg, #0a2470 0%, #0a63c9 55%, #14a0e6 100%)" },
  BL1: { solid: "#d20515", gradient: "linear-gradient(120deg, #6e000c 0%, #c0061a 55%, #ee4b2b 100%)" },
  FL1: { solid: "#0f8f8a", gradient: "linear-gradient(120deg, #0a2270 0%, #0d6f86 55%, #18b487 100%)" },
};
