import "server-only";
import type { FootballProvider, GetMatchesParams } from "./provider";
import type { StandingsResult, MatchesResult, TeamResult, NewsArticle, LeagueCode } from "./types";
import { mockFootballProvider } from "./mock-provider";
import { footballDataOrgProvider } from "./api-provider";

/**
 * Single entry point for every page/route. Pages must import
 * `getFootballProvider()` from here — never mock-provider.ts or
 * api-provider.ts directly — so the data source stays swappable.
 *
 * Behavior:
 * - No FOOTBALL_DATA_API_KEY set -> mock provider only (clearly labeled demo).
 * - Key set -> try football-data.org per call; on failure, fall back to
 *   mock data for that one call and stamp the response so the UI can show
 *   "Live data temporarily unavailable — showing demo data" instead of
 *   silently pretending stale/fake data is live.
 */

let cached: FootballProvider | null = null;

// The fallbacks below hide failures from the UI, so record why they happened
// (rate limit, bad key, network) where Vercel's runtime logs can show it.
function logFallback(scope: string, err: unknown) {
  console.error(`[football] ${scope} failed, using demo data:`, err instanceof Error ? err.message : err);
}

function withFallback(real: FootballProvider): FootballProvider {
  return {
    sourceName: real.sourceName,
    async getLeagues() {
      try {
        return await real.getLeagues();
      } catch (err) {
        logFallback("getLeagues", err);
        return mockFootballProvider.getLeagues();
      }
    },
    async getStandings(code: LeagueCode): Promise<StandingsResult> {
      try {
        return await real.getStandings(code);
      } catch (err) {
        logFallback(`getStandings(${code})`, err);
        const fallback = await mockFootballProvider.getStandings(code);
        return { ...fallback, meta: { ...fallback.meta, note: "Live data temporarily unavailable — showing demo data" } };
      }
    },
    async getMatches(params: GetMatchesParams): Promise<MatchesResult> {
      try {
        return await real.getMatches(params);
      } catch (err) {
        logFallback("getMatches", err);
        const fallback = await mockFootballProvider.getMatches(params);
        return { ...fallback, meta: { ...fallback.meta, note: "Live data temporarily unavailable — showing demo data" } };
      }
    },
    async getTeam(teamId: string): Promise<TeamResult | null> {
      try {
        const result = await real.getTeam(teamId);
        if (result) return result;
        return mockFootballProvider.getTeam(teamId);
      } catch (err) {
        logFallback(`getTeam(${teamId})`, err);
        return mockFootballProvider.getTeam(teamId);
      }
    },
    async getNews(): Promise<NewsArticle[]> {
      try {
        const news = await real.getNews();
        return news.length ? news : mockFootballProvider.getNews();
      } catch (err) {
        logFallback("getNews", err);
        return mockFootballProvider.getNews();
      }
    },
  };
}

export function getFootballProvider(): FootballProvider {
  if (cached) return cached;

  if (process.env.FOOTBALL_DATA_API_KEY) {
    cached = withFallback(footballDataOrgProvider);
  } else {
    cached = mockFootballProvider;
  }
  return cached;
}

export type { FootballProvider };
export * from "./types";
