import type {
  LeagueCode,
  League,
  StandingsResult,
  MatchesResult,
  MatchStatus,
  TeamResult,
  NewsArticle,
} from "./types";

export interface GetMatchesParams {
  leagueCode?: LeagueCode;
  status?: MatchStatus[];
  dateFrom?: string; // ISO date, inclusive
  dateTo?: string; // ISO date, inclusive
  teamId?: string;
}

/**
 * Everything the UI is allowed to talk to for football data.
 * Never import FootballDataOrgProvider directly
 * from a page/component — go through getFootballProvider() in index.ts,
 * so swapping the underlying source never touches the UI layer.
 */
export interface FootballProvider {
  readonly sourceName: "football-data.org";
  getLeagues(): Promise<League[]>;
  getStandings(code: LeagueCode): Promise<StandingsResult>;
  getMatches(params: GetMatchesParams): Promise<MatchesResult>;
  getTeam(teamId: string): Promise<TeamResult | null>;
  getNews(): Promise<NewsArticle[]>;
}
