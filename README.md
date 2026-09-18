# Football Atlas

> One dashboard. Europe's football, connected.

A European Football Intelligence dashboard covering the Premier League, La Liga, Serie A, Bundesliga, and Ligue 1: live standings, a match centre, a Momentum Index, and a scenario-based Table Simulator.

Built with Next.js 16 (App Router) + TypeScript + Tailwind CSS.

## Status

This build runs on **demo data by default** (clearly labeled in the UI) and upgrades automatically to **live data** from [football-data.org](https://www.football-data.org) the moment you set `FOOTBALL_DATA_API_KEY`. Nothing else needs to change — the provider abstraction handles the switch.

## Architecture

```
lib/football/
  types.ts          # Normalized models — League, Team, Standing, Match, etc.
                     # The UI only ever consumes these, never raw API responses.
  provider.ts        # FootballProvider interface — the contract both providers implement.
  mock-provider.ts    # Deterministic demo data. Always available, no network calls, no key needed.
  api-provider.ts      # Real data from football-data.org. Server-only — the API key never
                        # reaches the browser. Marked with the `server-only` package so a
                        # client-side import fails the build instead of leaking the key.
  index.ts              # getFootballProvider() — the single entry point pages import.
                          # Chooses mock vs. real based on env, and wraps the real provider
                          # so any single failed call falls back to demo data for just that
                          # call (labeled "Live data temporarily unavailable — showing demo data")
                          # instead of crashing the page.
  momentum.ts            # Momentum Index — a Football Atlas proprietary indicator.
                          # Deterministic function of weighted recent form + goal-difference
                          # trend. Documented inline. Never presented as an official stat.
```

**Why this matters:** no page or component imports `mock-provider.ts` or `api-provider.ts` directly — everything goes through `getFootballProvider()`. If you later add a paid API (Opta, API-Football, etc.), you write one new file implementing `FootballProvider` and swap it in `index.ts`. The UI never changes.

### Routes

```
/                              Dashboard — live/today matches, league overview, momentum, title race, news
/leagues                       All five leagues
/leagues/[league]              Full table + momentum + fixtures/results for one league (PL, PD, SA, BL1, FL1)
/matches                       Match Centre — live / today / upcoming / recent, filterable by league and team
/teams/[team]                  Team intelligence — standing, momentum, recent + upcoming matches
/analytics/table-simulator      Scenario simulation — pick hypothetical results, table recalculates live
/api/football/standings         Server route — powers the simulator's league switcher
/api/football/matches            Server route — general match query endpoint
```

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. It works immediately with no setup — you'll see a "Demo data" badge throughout.

## Connecting real data (football-data.org, free tier)

Your API key is already wired in: `.env.local` at the project root contains `FOOTBALL_DATA_API_KEY`. `npm run dev` / `npm run build` picks it up automatically — no setup needed locally.

**⚠️ Before you push to GitHub:** `.env.local` is listed in `.gitignore`, so the standard `git add . && git commit && git push` flow (the commands below) will correctly skip it. But if you instead use GitHub's **web "Upload files" button** or drag-and-drop the folder into GitHub Desktop's file browser, `.gitignore` does *not* apply the same way — you could accidentally publish your API key in a public commit. To be safe: always push via `git` commands (below), and if you ever do upload manually, delete `.env.local` from what you're uploading first.

For **production on Vercel**, don't rely on `.env.local` at all (it never gets deployed) — add the same key as an Environment Variable in the Vercel dashboard, per step 5 under Deploying below.

**Free-tier limits to know:**
- ~10 requests/minute. The app caches standings for 5 minutes and matches for 1 minute (`next: { revalidate }` in `api-provider.ts`) to stay well under that.
- The free tier does not include a news endpoint — the Newswire section intentionally stays on demo headlines until you wire in a real news source (NewsAPI, RSS, etc.) as a separate provider.
- If a request fails or you hit a rate limit, the app automatically falls back to demo data for that one call rather than showing a broken page.

## Deploying

### 1. Push to GitHub

From inside this folder:

```bash
git init
git add .
git commit -m "Football Atlas: Next.js app with mock/live provider architecture"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Make sure `index.html`-style confusion doesn't apply here: this is a Next.js app, so there's no `index.html` — `app/page.tsx` is the homepage, and Next.js builds it into the deployed output automatically.

### 2. Import into Vercel

1. https://vercel.com/new → import the GitHub repo you just pushed.
2. Framework Preset: Vercel auto-detects **Next.js** — leave it as-is (don't override to "Other").
3. Root Directory: leave as `.` (the repo root) — do **not** set it to a subfolder. If `package.json` sits at the top level of your repo (it does, once you push this folder's contents), the root directory is correct by default.
4. Build Command / Output Directory: leave both on their Next.js defaults (empty).
5. **Environment Variables** → add `FOOTBALL_DATA_API_KEY` with your key. Without it, the deployed site still works fine — it just serves demo data.
6. Deploy.

### If you ever see "This page could not be found" on Vercel again

That error means Vercel couldn't find a matching route for the URL you hit — for a Next.js app (unlike a plain static site) it's almost never a missing `index.html`. Check, in order:

1. Is `package.json` actually at the **root** of the GitHub repo (not nested inside a subfolder)? If it's nested, set Vercel's **Root Directory** (Project Settings → General) to that subfolder.
2. Did the build actually succeed? Check the Vercel deployment's **Build Logs** tab — a failed build serves the *previous* successful deployment or a 404, not this app.
3. Are you hitting a real route? `/leagues/xx` only exists for `PL`, `PD`, `SA`, `BL1`, `FL1` (see `generateStaticParams` in `app/leagues/[league]/page.tsx`) — anything else 404s by design.

## What's next (per the original product spec)

Deliberately not built in this pass, to keep the first deployable version focused:
- Real news provider (Newswire currently shows demo headlines only)
- Full squads / player statistics
- League DNA, European Power Map, Weekend Radar analytical views
- User accounts, favourites, Command Center, saved research
- AI Football Assistant

The provider abstraction and route structure are set up so each of these slots in without restructuring what already works.
