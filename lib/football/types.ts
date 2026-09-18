// Normalized application models.
// The UI must only ever consume these types — never raw provider/API responses.
// This is what makes the data provider swappable (mock <-> football-data.org <-> anything else later).

export type LeagueCode = "PL" | "PD" | "SA" | "BL1" | "FL1";

export const LEAGUES: Record<LeagueCode, { name: string; country: string; flag: string }> = {
  PL: { name: "Premier League", country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  PD: { name: "La Liga", country: "Spain", flag: "🇪🇸" },
  SA: { name: "Serie A", country: "Italy", flag: "🇮🇹" },
  BL1: { name: "Bundesliga", country: "Germany", flag: "🇩🇪" },
  FL1: { name: "Ligue 1", country: "France", flag: "🇫🇷" },
};

export interface League {
  code: LeagueCode;
  name: string;
  country: string;
  season: string; // e.g. "2025/2026"
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tla?: string; // three-letter abbreviation
  crest?: string;
  leagueCode: LeagueCode;
}

export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form?: string; // e.g. "WWDLW", most recent last
  homeRecord?: { won: number; draw: number; lost: number };
  awayRecord?: { won: number; draw: number; lost: number };
}

export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "LIVE"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED";

export interface Match {
  id: string;
  leagueCode: LeagueCode;
  utcDate: string; // ISO 8601
  status: MatchStatus;
  matchday?: number;
  venue?: string | null;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number | null;
  awayScore?: number | null;
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  summary: string;
  leagueCode?: LeagueCode;
  category: string;
}

/**
 * Every payload returned from a provider carries this so the UI can honestly
 * label what the user is looking at, per the "no silent fake data" rule.
 */
export interface DataMeta {
  source: "mock" | "football-data.org";
  fetchedAt: string; // ISO timestamp of when this response was produced
  isDemo: boolean;
  note?: string; // e.g. "Live data temporarily unavailable — showing demo data"
}

export interface StandingsResult {
  league: League;
  standings: Standing[];
  meta: DataMeta;
}

export interface MatchesResult {
  matches: Match[];
  meta: DataMeta;
}

export interface TeamResult {
  team: Team;
  standing: Standing | null;
  recentMatches: Match[];
  upcomingMatches: Match[];
  meta: DataMeta;
}

/**
 * Football Atlas proprietary indicator — NOT an official UEFA/FIFA/league metric.
 * Deterministic function of recent form + goal trend. See lib/football/momentum.ts.
 */
export interface MomentumEntry {
  team: Team;
  momentumIndex: number; // -100..100, deterministic, explainable
  trend: "up" | "down" | "flat";
  recentForm: string;
  changeFromPrevious: number;
}
