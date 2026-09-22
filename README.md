# Football Atlas

**A live football intelligence dashboard for Europe's top five leagues** — Premier League, La Liga, Serie A, Bundesliga, and Ligue 1. Real standings, a match centre, a proprietary form-momentum index, and a what-if table simulator, all built on real-time data with zero placeholder numbers.

**[Live demo →](https://footballatlas-mauve.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

---

## What it does

- **Live standings and fixtures** across five leagues, sourced from [football-data.org](https://www.football-data.org).
- **Match Centre**: live, today's, upcoming, and recent results, filterable by league and team.
- **Momentum Index** — a custom-built, deterministic form indicator (weighted recent results + goal-difference trend), clearly labeled as a proprietary stat rather than an official one.
- **Table Simulator**: pick hypothetical results for remaining fixtures and watch the league table recalculate live.
- **Football newswire** from BBC Sport and Guardian RSS feeds.

## Engineering highlights

- **Never fakes data.** If a live API call fails or hits a rate limit, the affected section renders "Live data unavailable" and logs the reason — it never falls back to invented or stale-looking placeholder numbers. That's a deliberate product decision, enforced in code at the data-provider layer.
- **A real abstraction, not just a fetch call.** Every page imports from a single `getFootballProvider()` entry point; no component ever touches the API client directly. Swapping in a paid provider (Opta, API-Football) later means writing one new file — the UI doesn't change. This is the same interface-first pattern used to keep large codebases maintainable as data sources evolve.
- **Server-side secrets stay server-side.** The API-key-holding module is marked with the `server-only` package, so an accidental client-side import fails the *build*, not just a code review — the key can't leak into the browser bundle by mistake.
- **A documented, explainable scoring algorithm.** The Momentum Index isn't a black box: it's a weighted blend of recent-form points (recency-weighted, more recent matches count more) and goal-difference trend, normalized to a -100..+100 scale, with the exact formula commented in-source. Every place it's displayed is labeled as a proprietary indicator — it's never presented as an official league statistic.
- **Respects third-party rate limits by design.** Standings are cached 5 minutes, matches 1 minute, matching the free-tier API's ~10 requests/minute ceiling — not discovered by trial and error in production.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 4 |
| Live data | [football-data.org](https://www.football-data.org) API |
| News | BBC Sport + Guardian RSS feeds |
| Hosting | Vercel |

## Architecture

```
lib/football/
  types.ts          Normalized models (League, Team, Standing, Match) — the UI only
                     ever consumes these, never raw API responses.
  provider.ts        The FootballProvider interface every data source implements.
  api-provider.ts    Real data from football-data.org. Server-only.
  news-provider.ts   Headlines from BBC Sport + The Guardian RSS.
  index.ts           getFootballProvider() — the single entry point pages import.
  momentum.ts        The Momentum Index algorithm (see above).
```

```
/                              Dashboard — live/today matches, standings, momentum, news
/leagues, /leagues/[league]    All five leagues, or one league's full table + fixtures
/matches                       Match Centre
/teams/[team]                  Team intelligence page
/analytics/table-simulator     Scenario-based table simulator
```

## Run it locally

```bash
git clone https://github.com/navinsreejithprep/Footballatlas.git
cd Footballatlas
npm install
npm run dev
```

Open http://localhost:3000. Add `FOOTBALL_DATA_API_KEY` to `.env.local` (a free key from [football-data.org](https://www.football-data.org)) to enable live scores and standings — the newswire works without any key.

## Roadmap

Deliberately out of scope for this pass, to keep it focused: full squads/player stats, additional analytical views (League DNA, European Power Map), user accounts and saved research, and an AI assistant. The provider abstraction is built so each of these slots in without restructuring what already works.
