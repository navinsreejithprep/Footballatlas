import "server-only";
import type { FootballProvider, GetMatchesParams } from "./provider";
import { LEAGUES } from "./types";
import type { DataMeta, LeagueCode, MatchesResult, StandingsResult, TeamResult } from "./types";
import { footballDataOrgProvider } from "./api-provider";

/**
 * Single entry point for every page/route. Pages must import
 * `getFootballProvider()` from here — never api-provider.ts directly —
 * so the data source stays swappable.
 *
 * Behavior: every call goes to the live source. No demo or placeholder data
 * is ever substituted. If a call fails (rate limit, missing key, network) the
 * result is empty and `meta.note` says live data is unavailable, so the UI
 * shows an honest empty state instead of crashing or showing invented numbers.
 */

const UNAVAILABLE_NOTE = "Live data temporarily unavailable";

function unavailableMeta(): DataMeta {
  return { source: "football-data.org", fetchedAt: new Date().toISOString(), note: UNAVAILABLE_NOTE };
}

// The UI only sees an empty result, so record why it failed where Vercel's
// runtime logs can show it (rate limit, bad key, network).
function logFailure(scope: string, err: unknown) {
  console.error(`[football] ${scope} failed:`, err instanceof Error ? err.message : err);
}

const provider: FootballProvider = {
  sourceName: footballDataOrgProvider.sourceName,

  getLeagues: () => footballDataOrgProvider.getLeagues(),

  async getStandings(code: LeagueCode): Promise<StandingsResult> {
    try {
      return await footballDataOrgProvider.getStandings(code);
    } catch (err) {
      logFailure(`getStandings(${code})`, err);
      const { name, country } = LEAGUES[code];
      return { league: { code, name, country, season: "" }, standings: [], meta: unavailableMeta() };
    }
  },

  async getMatches(params: GetMatchesParams): Promise<MatchesResult> {
    try {
      return await footballDataOrgProvider.getMatches(params);
    } catch (err) {
      logFailure("getMatches", err);
      return { matches: [], meta: unavailableMeta() };
    }
  },

  // Null means the team doesn't exist. A failed call throws so the page can
  // say data is unavailable instead of claiming the team wasn't found.
  async getTeam(teamId: string): Promise<TeamResult | null> {
    try {
      return await footballDataOrgProvider.getTeam(teamId);
    } catch (err) {
      logFailure(`getTeam(${teamId})`, err);
      throw err;
    }
  },

  async getNews() {
    try {
      return await footballDataOrgProvider.getNews();
    } catch (err) {
      logFailure("getNews", err);
      return [];
    }
  },
};

export function getFootballProvider(): FootballProvider {
  return provider;
}

export type { FootballProvider };
export * from "./types";
