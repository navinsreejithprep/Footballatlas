import "server-only";
import type { FootballProvider, GetMatchesParams } from "./provider";
import type {
  League,
  LeagueCode,
  Standing,
  Team,
  Match,
  MatchStatus,
  StandingsResult,
  MatchesResult,
  TeamResult,
  NewsArticle,
  DataMeta,
} from "./types";
import { LEAGUES } from "./types";

/**
 * FootballDataOrgProvider
 * ---------------------------------------------------------------
 * Talks to https://www.football-data.org/ (v4 REST API).
 * IMPORTANT: this file is marked "server-only" and must never be
 * imported from a client component. The API key is read from
 * process.env.FOOTBALL_DATA_API_KEY and is never sent to the browser.
 *
 * Free-tier notes:
 * - Rate limit is low (roughly 10 requests/minute) — callers should
 *   cache aggressively (see `next: { revalidate }` below) rather than
 *   fan out many requests per page load.
 * - News is NOT covered by this API — getNews() intentionally returns
 *   an empty array here; the app falls back to demo news for that section.
 */

const BASE_URL = "https://api.football-data.org/v4";

function apiKey(): string | undefined {
  return process.env.FOOTBALL_DATA_API_KEY;
}

async function fdFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  const key = apiKey();
  if (!key) {
    throw new Error("FOOTBALL_DATA_API_KEY is not set");
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": key },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) {
    throw new Error(`football-data.org request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

function meta(note?: string): DataMeta {
  return {
    source: "football-data.org",
    fetchedAt: new Date().toISOString(),
    isDemo: false,
    note,
  };
}

// ---- football-data.org raw response shapes (only the fields we use) ----

interface FdTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface FdStandingTableRow {
  position: number;
  team: FdTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  form: string | null;
}

interface FdStandingsResponse {
  competition: { name: string; code: string; area: { name: string } };
  season: { startDate: string; endDate: string };
  standings: Array<{ type: string; table: FdStandingTableRow[] }>;
}

interface FdMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  venue: string | null;
  homeTeam: FdTeam;
  awayTeam: FdTeam;
  score: { fullTime: { home: number | null; away: number | null } };
}

interface FdMatchesResponse {
  matches: FdMatch[];
}

function toTeam(t: FdTeam, leagueCode: LeagueCode): Team {
  return {
    id: String(t.id),
    name: t.name,
    shortName: t.shortName || t.name,
    tla: t.tla,
    crest: t.crest,
    leagueCode,
  };
}

function toStanding(row: FdStandingTableRow, leagueCode: LeagueCode): Standing {
  return {
    position: row.position,
    team: toTeam(row.team, leagueCode),
    playedGames: row.playedGames,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    points: row.points,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    form: row.form ?? undefined,
  };
}

function toStatus(s: string): MatchStatus {
  const known: MatchStatus[] = [
    "SCHEDULED", "TIMED", "LIVE", "IN_PLAY", "PAUSED", "FINISHED", "POSTPONED", "SUSPENDED", "CANCELLED",
  ];
  return (known.includes(s as MatchStatus) ? s : "SCHEDULED") as MatchStatus;
}

function toMatch(m: FdMatch, leagueCode: LeagueCode): Match {
  return {
    id: String(m.id),
    leagueCode,
    utcDate: m.utcDate,
    status: toStatus(m.status),
    matchday: m.matchday ?? undefined,
    venue: m.venue,
    homeTeam: toTeam(m.homeTeam, leagueCode),
    awayTeam: toTeam(m.awayTeam, leagueCode),
    homeScore: m.score?.fullTime?.home ?? null,
    awayScore: m.score?.fullTime?.away ?? null,
  };
}

export const footballDataOrgProvider: FootballProvider = {
  sourceName: "football-data.org",

  async getLeagues(): Promise<League[]> {
    return (Object.keys(LEAGUES) as LeagueCode[]).map((code) => ({
      code,
      name: LEAGUES[code].name,
      country: LEAGUES[code].country,
      season: "current",
    }));
  },

  async getStandings(code: LeagueCode): Promise<StandingsResult> {
    // Standings change slowly relative to a page load; cache for 5 minutes.
    const data = await fdFetch<FdStandingsResponse>(`/competitions/${code}/standings`, 300);
    const table = data.standings.find((s) => s.type === "TOTAL")?.table ?? [];
    return {
      league: {
        code,
        name: data.competition.name,
        country: data.competition.area.name,
        season: `${data.season.startDate.slice(0, 4)}/${data.season.endDate.slice(0, 4)}`,
      },
      standings: table.map((row) => toStanding(row, code)),
      meta: meta(),
    };
  },

  async getMatches(params: GetMatchesParams): Promise<MatchesResult> {
    const codes: LeagueCode[] = params.leagueCode
      ? [params.leagueCode]
      : (Object.keys(LEAGUES) as LeagueCode[]);

    const query = new URLSearchParams();
    if (params.dateFrom) query.set("dateFrom", params.dateFrom.slice(0, 10));
    if (params.dateTo) query.set("dateTo", params.dateTo.slice(0, 10));

    // Live/today data should be much fresher than standings.
    const revalidate = 60;

    const results = await Promise.all(
      codes.map((code) =>
        fdFetch<FdMatchesResponse>(`/competitions/${code}/matches?${query.toString()}`, revalidate).then(
          (data) => data.matches.map((m) => toMatch(m, code))
        )
      )
    );

    let matches = results.flat();
    if (params.status?.length) {
      matches = matches.filter((m) => params.status!.includes(m.status));
    }
    if (params.teamId) {
      matches = matches.filter((m) => m.homeTeam.id === params.teamId || m.awayTeam.id === params.teamId);
    }
    matches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    return { matches, meta: meta() };
  },

  async getTeam(teamId: string): Promise<TeamResult | null> {
    try {
      const teamData = await fdFetch<{ id: number; name: string; shortName: string; tla: string; crest: string; runningCompetitions: Array<{ code: string }> }>(
        `/teams/${teamId}`,
        300
      );
      const leagueCode = (teamData.runningCompetitions.map((c) => c.code).find((c) => c in LEAGUES) as LeagueCode) ?? "PL";
      const team = toTeam(teamData, leagueCode);

      const [standingsResult, matchesData] = await Promise.all([
        this.getStandings(leagueCode).catch(() => null),
        fdFetch<FdMatchesResponse>(`/teams/${teamId}/matches?limit=10`, 120),
      ]);

      const standing = standingsResult?.standings.find((s) => s.team.id === String(teamId)) ?? null;
      const allMatches = matchesData.matches.map((m) => toMatch(m, leagueCode));

      return {
        team,
        standing,
        recentMatches: allMatches.filter((m) => m.status === "FINISHED"),
        upcomingMatches: allMatches.filter((m) => m.status === "SCHEDULED" || m.status === "TIMED"),
        meta: meta(),
      };
    } catch {
      return null;
    }
  },

  async getNews(): Promise<NewsArticle[]> {
    // football-data.org has no news endpoint. Wire a dedicated news
    // provider here later; for now the resilient wrapper falls back
    // to demo news for this one method.
    return [];
  },
};
