import type { FootballProvider, GetMatchesParams } from "./provider";
import type {
  League,
  LeagueCode,
  Standing,
  Team,
  Match,
  StandingsResult,
  MatchesResult,
  TeamResult,
  NewsArticle,
  DataMeta,
} from "./types";
import { LEAGUES } from "./types";

/**
 * MockFootballProvider
 * ---------------------------------------------------------------
 * Deterministic, hardcoded demo dataset. It uses real club names
 * (so the UI reads naturally) but the standings/scores are NOT live
 * statistics — every response is stamped isDemo: true and the UI
 * is required to surface a "Demo data" badge wherever this is used.
 *
 * This is the always-available fallback: it has no network
 * dependency and never fails, per the "gracefully degrade" rule.
 */

const SEASON = "2025/2026";

function meta(note?: string): DataMeta {
  return {
    source: "mock",
    fetchedAt: new Date().toISOString(),
    isDemo: true,
    note: note ?? "Demo data — not live statistics",
  };
}

function team(id: string, name: string, shortName: string, tla: string, leagueCode: LeagueCode): Team {
  return { id, name, shortName, tla, leagueCode };
}

type RawRow = {
  id: string;
  name: string;
  short: string;
  tla: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  gf: number;
  ga: number;
  form: string;
};

function toStanding(row: RawRow, leagueCode: LeagueCode, position: number): Standing {
  return {
    position,
    team: team(row.id, row.name, row.short, row.tla, leagueCode),
    playedGames: row.played,
    won: row.won,
    draw: row.draw,
    lost: row.lost,
    points: row.won * 3 + row.draw,
    goalsFor: row.gf,
    goalsAgainst: row.ga,
    goalDifference: row.gf - row.ga,
    form: row.form,
    homeRecord: {
      won: Math.round(row.won * 0.6),
      draw: Math.round(row.draw * 0.5),
      lost: Math.round(row.lost * 0.4),
    },
    awayRecord: {
      won: row.won - Math.round(row.won * 0.6),
      draw: row.draw - Math.round(row.draw * 0.5),
      lost: row.lost - Math.round(row.lost * 0.4),
    },
  };
}

const RAW_DATA: Record<LeagueCode, RawRow[]> = {
  PL: [
    { id: "pl-liv", name: "Liverpool", short: "Liverpool", tla: "LIV", played: 9, won: 7, draw: 1, lost: 1, gf: 21, ga: 9, form: "WWWDW" },
    { id: "pl-ars", name: "Arsenal", short: "Arsenal", tla: "ARS", played: 9, won: 6, draw: 2, lost: 1, gf: 18, ga: 7, form: "WDWWW" },
    { id: "pl-mci", name: "Manchester City", short: "Man City", tla: "MCI", played: 9, won: 6, draw: 1, lost: 2, gf: 20, ga: 11, form: "WLWWD" },
    { id: "pl-che", name: "Chelsea", short: "Chelsea", tla: "CHE", played: 9, won: 5, draw: 3, lost: 1, gf: 17, ga: 10, form: "DWWDW" },
    { id: "pl-tot", name: "Tottenham Hotspur", short: "Tottenham", tla: "TOT", played: 9, won: 5, draw: 2, lost: 2, gf: 16, ga: 12, form: "WWLDW" },
    { id: "pl-avl", name: "Aston Villa", short: "Aston Villa", tla: "AVL", played: 9, won: 4, draw: 3, lost: 2, gf: 14, ga: 11, form: "DWWDL" },
    { id: "pl-new", name: "Newcastle United", short: "Newcastle", tla: "NEW", played: 9, won: 4, draw: 2, lost: 3, gf: 15, ga: 13, form: "LWDWW" },
    { id: "pl-mun", name: "Manchester United", short: "Man United", tla: "MUN", played: 9, won: 4, draw: 1, lost: 4, gf: 13, ga: 14, form: "WLWLD" },
    { id: "pl-bha", name: "Brighton", short: "Brighton", tla: "BHA", played: 9, won: 3, draw: 4, lost: 2, gf: 12, ga: 11, form: "DDWDL" },
    { id: "pl-whu", name: "West Ham United", short: "West Ham", tla: "WHU", played: 9, won: 2, draw: 3, lost: 4, gf: 10, ga: 15, form: "LDLWD" },
  ],
  PD: [
    { id: "pd-rma", name: "Real Madrid", short: "Real Madrid", tla: "RMA", played: 9, won: 8, draw: 0, lost: 1, gf: 24, ga: 8, form: "WWWWL" },
    { id: "pd-fcb", name: "FC Barcelona", short: "Barcelona", tla: "BAR", played: 9, won: 7, draw: 1, lost: 1, gf: 26, ga: 10, form: "WWDWW" },
    { id: "pd-atm", name: "Atlético Madrid", short: "Atlético", tla: "ATM", played: 9, won: 6, draw: 2, lost: 1, gf: 18, ga: 9, form: "DWWWW" },
    { id: "pd-ath", name: "Athletic Bilbao", short: "Athletic Club", tla: "ATH", played: 9, won: 5, draw: 2, lost: 2, gf: 15, ga: 10, form: "WDWLW" },
    { id: "pd-vil", name: "Villarreal", short: "Villarreal", tla: "VIL", played: 9, won: 5, draw: 1, lost: 3, gf: 16, ga: 13, form: "LWWDW" },
    { id: "pd-rso", name: "Real Sociedad", short: "Real Sociedad", tla: "RSO", played: 9, won: 4, draw: 3, lost: 2, gf: 13, ga: 11, form: "DWDWL" },
    { id: "pd-sev", name: "Sevilla", short: "Sevilla", tla: "SEV", played: 9, won: 4, draw: 2, lost: 3, gf: 12, ga: 12, form: "WLDWD" },
    { id: "pd-bet", name: "Real Betis", short: "Real Betis", tla: "BET", played: 9, won: 3, draw: 4, lost: 2, gf: 11, ga: 10, form: "DDWLD" },
    { id: "pd-val", name: "Valencia", short: "Valencia", tla: "VAL", played: 9, won: 3, draw: 3, lost: 3, gf: 10, ga: 12, form: "LDWDL" },
    { id: "pd-cel", name: "Celta Vigo", short: "Celta Vigo", tla: "CEL", played: 9, won: 2, draw: 3, lost: 4, gf: 9, ga: 14, form: "LLDWD" },
  ],
  SA: [
    { id: "sa-int", name: "Inter Milan", short: "Inter", tla: "INT", played: 9, won: 7, draw: 1, lost: 1, gf: 20, ga: 8, form: "WWDWW" },
    { id: "sa-nap", name: "Napoli", short: "Napoli", tla: "NAP", played: 9, won: 6, draw: 2, lost: 1, gf: 17, ga: 9, form: "WDWWL" },
    { id: "sa-mil", name: "AC Milan", short: "Milan", tla: "MIL", played: 9, won: 6, draw: 1, lost: 2, gf: 16, ga: 10, form: "WWLWD" },
    { id: "sa-juv", name: "Juventus", short: "Juventus", tla: "JUV", played: 9, won: 5, draw: 3, lost: 1, gf: 14, ga: 8, form: "DWWDW" },
    { id: "sa-ata", name: "Atalanta", short: "Atalanta", tla: "ATA", played: 9, won: 5, draw: 2, lost: 2, gf: 18, ga: 12, form: "WLWWD" },
    { id: "sa-rom", name: "AS Roma", short: "Roma", tla: "ROM", played: 9, won: 4, draw: 3, lost: 2, gf: 13, ga: 10, form: "DDWLW" },
    { id: "sa-laz", name: "Lazio", short: "Lazio", tla: "LAZ", played: 9, won: 4, draw: 2, lost: 3, gf: 12, ga: 11, form: "WLDWL" },
    { id: "sa-fio", name: "Fiorentina", short: "Fiorentina", tla: "FIO", played: 9, won: 3, draw: 3, lost: 3, gf: 11, ga: 12, form: "LDWDW" },
    { id: "sa-bol", name: "Bologna", short: "Bologna", tla: "BOL", played: 9, won: 3, draw: 2, lost: 4, gf: 10, ga: 13, form: "LWDLD" },
    { id: "sa-tor", name: "Torino", short: "Torino", tla: "TOR", played: 9, won: 2, draw: 4, lost: 3, gf: 9, ga: 12, form: "DDLWD" },
  ],
  BL1: [
    { id: "bl-bay", name: "Bayern Munich", short: "Bayern", tla: "BAY", played: 9, won: 8, draw: 1, lost: 0, gf: 28, ga: 7, form: "WWWWD" },
    { id: "bl-b04", name: "Bayer Leverkusen", short: "Leverkusen", tla: "B04", played: 9, won: 6, draw: 2, lost: 1, gf: 20, ga: 11, form: "WDWWL" },
    { id: "bl-rbl", name: "RB Leipzig", short: "RB Leipzig", tla: "RBL", played: 9, won: 6, draw: 1, lost: 2, gf: 19, ga: 12, form: "WLWWD" },
    { id: "bl-bvb", name: "Borussia Dortmund", short: "Dortmund", tla: "BVB", played: 9, won: 5, draw: 2, lost: 2, gf: 17, ga: 13, form: "DWWLW" },
    { id: "bl-fra", name: "Eintracht Frankfurt", short: "Frankfurt", tla: "SGE", played: 9, won: 5, draw: 1, lost: 3, gf: 16, ga: 14, form: "WLWDW" },
    { id: "bl-svw", name: "Werder Bremen", short: "Werder Bremen", tla: "SVW", played: 9, won: 4, draw: 2, lost: 3, gf: 13, ga: 12, form: "LWDWL" },
    { id: "bl-vfb", name: "VfB Stuttgart", short: "Stuttgart", tla: "VFB", played: 9, won: 4, draw: 1, lost: 4, gf: 14, ga: 15, form: "WLLWD" },
    { id: "bl-wob", name: "Wolfsburg", short: "Wolfsburg", tla: "WOB", played: 9, won: 3, draw: 3, lost: 3, gf: 11, ga: 12, form: "DWDLW" },
    { id: "bl-fcu", name: "Union Berlin", short: "Union Berlin", tla: "FCU", played: 9, won: 3, draw: 2, lost: 4, gf: 10, ga: 14, form: "LDWLD" },
    { id: "bl-m05", name: "Mainz 05", short: "Mainz", tla: "M05", played: 9, won: 2, draw: 3, lost: 4, gf: 9, ga: 13, form: "DLDWL" },
  ],
  FL1: [
    { id: "fl-psg", name: "Paris Saint-Germain", short: "PSG", tla: "PSG", played: 9, won: 8, draw: 0, lost: 1, gf: 25, ga: 8, form: "WWWLW" },
    { id: "fl-mon", name: "AS Monaco", short: "Monaco", tla: "ASM", played: 9, won: 6, draw: 1, lost: 2, gf: 18, ga: 11, form: "WDWWL" },
    { id: "fl-mar", name: "Olympique Marseille", short: "Marseille", tla: "OM", played: 9, won: 6, draw: 0, lost: 3, gf: 17, ga: 12, form: "WLWWW" },
    { id: "fl-lil", name: "Lille", short: "Lille", tla: "LIL", played: 9, won: 5, draw: 2, lost: 2, gf: 15, ga: 10, form: "DWWLD" },
    { id: "fl-lyo", name: "Olympique Lyonnais", short: "Lyon", tla: "OL", played: 9, won: 5, draw: 1, lost: 3, gf: 16, ga: 13, form: "WWLDW" },
    { id: "fl-nic", name: "OGC Nice", short: "Nice", tla: "NIC", played: 9, won: 4, draw: 2, lost: 3, gf: 12, ga: 11, form: "LWDWD" },
    { id: "fl-ren", name: "Stade Rennais", short: "Rennes", tla: "REN", played: 9, won: 4, draw: 1, lost: 4, gf: 13, ga: 14, form: "WLDWL" },
    { id: "fl-lens", name: "RC Lens", short: "Lens", tla: "LEN", played: 9, won: 3, draw: 3, lost: 3, gf: 11, ga: 12, form: "DDWLW" },
    { id: "fl-nan", name: "FC Nantes", short: "Nantes", tla: "NAN", played: 9, won: 2, draw: 3, lost: 4, gf: 9, ga: 13, form: "LDLWD" },
    { id: "fl-str", name: "RC Strasbourg", short: "Strasbourg", tla: "STR", played: 9, won: 2, draw: 2, lost: 5, gf: 8, ga: 15, form: "LLDWL" },
  ],
};

function buildStandings(code: LeagueCode): Standing[] {
  return RAW_DATA[code]
    .slice()
    .sort((a, b) => b.won * 3 + b.draw - (a.won * 3 + a.draw) || b.gf - b.ga - (a.gf - a.ga))
    .map((row, i) => toStanding(row, code, i + 1));
}

// Generate a spread of matches around "today" so LIVE / TODAY / UPCOMING / RECENT
// all have something to show regardless of when this is run.
function buildMatches(code: LeagueCode): Match[] {
  const rows = RAW_DATA[code];
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const matches: Match[] = [];

  const pair = (i: number, j: number) => [rows[i % rows.length], rows[j % rows.length]] as const;

  const fixtures: Array<{ offsetDays: number; status: Match["status"]; withScore: boolean; a: number; b: number }> = [
    { offsetDays: -7, status: "FINISHED", withScore: true, a: 0, b: 1 },
    { offsetDays: -4, status: "FINISHED", withScore: true, a: 2, b: 3 },
    { offsetDays: -2, status: "FINISHED", withScore: true, a: 4, b: 5 },
    { offsetDays: 0, status: "IN_PLAY", withScore: true, a: 6, b: 7 },
    { offsetDays: 0, status: "SCHEDULED", withScore: false, a: 8, b: 9 },
    { offsetDays: 3, status: "SCHEDULED", withScore: false, a: 1, b: 3 },
    { offsetDays: 6, status: "SCHEDULED", withScore: false, a: 0, b: 5 },
    { offsetDays: 10, status: "SCHEDULED", withScore: false, a: 2, b: 9 },
  ];

  fixtures.forEach((f, idx) => {
    const [home, away] = pair(f.a, f.b);
    const kickoff = new Date(now.getTime() + f.offsetDays * dayMs);
    kickoff.setHours(15, 0, 0, 0);
    matches.push({
      id: `${code}-mock-${idx}`,
      leagueCode: code,
      utcDate: kickoff.toISOString(),
      status: f.status,
      matchday: 10,
      venue: `${home.name} Stadium`,
      homeTeam: team(home.id, home.name, home.short, home.tla, code),
      awayTeam: team(away.id, away.name, away.short, away.tla, code),
      homeScore: f.withScore ? Math.floor((home.gf % 4) + (idx % 2)) : null,
      awayScore: f.withScore ? Math.floor((away.ga % 3) + (idx % 2)) : null,
    });
  });

  return matches;
}

const DEMO_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    headline: "Title race tightens as leaders drop points",
    source: "Demo Wire",
    url: "#",
    publishedAt: new Date().toISOString(),
    summary: "Sample headline placeholder — connect a real news provider to replace this feed.",
    category: "League news",
  },
  {
    id: "news-2",
    headline: "Injury update ahead of the weekend fixtures",
    source: "Demo Wire",
    url: "#",
    publishedAt: new Date().toISOString(),
    summary: "Sample headline placeholder — connect a real news provider to replace this feed.",
    category: "Injuries",
  },
];

export const mockFootballProvider: FootballProvider = {
  sourceName: "mock",

  async getLeagues(): Promise<League[]> {
    return (Object.keys(LEAGUES) as LeagueCode[]).map((code) => ({
      code,
      name: LEAGUES[code].name,
      country: LEAGUES[code].country,
      season: SEASON,
    }));
  },

  async getStandings(code: LeagueCode): Promise<StandingsResult> {
    return {
      league: { code, name: LEAGUES[code].name, country: LEAGUES[code].country, season: SEASON },
      standings: buildStandings(code),
      meta: meta(),
    };
  },

  async getMatches(params: GetMatchesParams): Promise<MatchesResult> {
    const codes: LeagueCode[] = params.leagueCode
      ? [params.leagueCode]
      : (Object.keys(LEAGUES) as LeagueCode[]);

    let matches = codes.flatMap((c) => buildMatches(c));

    if (params.status?.length) {
      matches = matches.filter((m) => params.status!.includes(m.status));
    }
    if (params.teamId) {
      matches = matches.filter((m) => m.homeTeam.id === params.teamId || m.awayTeam.id === params.teamId);
    }
    if (params.dateFrom) {
      const from = new Date(params.dateFrom).getTime();
      matches = matches.filter((m) => new Date(m.utcDate).getTime() >= from);
    }
    if (params.dateTo) {
      const to = new Date(params.dateTo).getTime();
      matches = matches.filter((m) => new Date(m.utcDate).getTime() <= to);
    }

    matches.sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

    return { matches, meta: meta() };
  },

  async getTeam(teamId: string): Promise<TeamResult | null> {
    for (const code of Object.keys(RAW_DATA) as LeagueCode[]) {
      const standings = buildStandings(code);
      const standing = standings.find((s) => s.team.id === teamId);
      if (standing) {
        const allMatches = buildMatches(code).filter(
          (m) => m.homeTeam.id === teamId || m.awayTeam.id === teamId
        );
        return {
          team: standing.team,
          standing,
          recentMatches: allMatches.filter((m) => m.status === "FINISHED"),
          upcomingMatches: allMatches.filter((m) => m.status === "SCHEDULED" || m.status === "IN_PLAY"),
          meta: meta(),
        };
      }
    }
    return null;
  },

  async getNews(): Promise<NewsArticle[]> {
    return DEMO_NEWS;
  },
};
