"use client";

import { useEffect, useMemo, useState } from "react";
import { LEAGUES } from "@/lib/football/types";
import type { LeagueCode, Standing, StandingsResult } from "@/lib/football/types";
import { SectionCard } from "@/components/SectionCard";
import { StandingsTable } from "@/components/StandingsTable";
import { DataMetaBadge } from "@/components/DataMetaBadge";

type Outcome = "HOME_WIN" | "DRAW" | "AWAY_WIN";

interface ScenarioMatch {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  outcome: Outcome;
}

function applyScenario(base: Standing[], scenarios: ScenarioMatch[]): Standing[] {
  const byId = new Map(base.map((s) => [s.team.id, { ...s }]));

  for (const scenario of scenarios) {
    const home = byId.get(scenario.homeTeamId);
    const away = byId.get(scenario.awayTeamId);
    if (!home || !away) continue;

    home.playedGames += 1;
    away.playedGames += 1;

    if (scenario.outcome === "HOME_WIN") {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
      home.goalsFor += 1;
      away.goalsAgainst += 1;
    } else if (scenario.outcome === "AWAY_WIN") {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
      away.goalsFor += 1;
      home.goalsAgainst += 1;
    } else {
      home.draw += 1;
      away.draw += 1;
      home.points += 1;
      away.points += 1;
    }
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  }

  return Array.from(byId.values())
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
    .map((s, i) => ({ ...s, position: i + 1 }));
}

export default function TableSimulatorPage() {
  const [league, setLeague] = useState<LeagueCode>("PL");
  const [data, setData] = useState<StandingsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioMatch[]>([]);
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("HOME_WIN");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setScenarios([]);
    fetch(`/api/football/standings?league=${league}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load standings");
        return res.json();
      })
      .then((json: StandingsResult) => {
        setData(json);
        if (json.standings.length >= 2) {
          setHomeTeamId(json.standings[0].team.id);
          setAwayTeamId(json.standings[1].team.id);
        }
      })
      .catch(() => setError("Could not load standings for this league."))
      .finally(() => setLoading(false));
  }, [league]);

  const simulatedStandings = useMemo(() => {
    if (!data) return [];
    return applyScenario(data.standings, scenarios);
  }, [data, scenarios]);

  function addScenario() {
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) return;
    setScenarios((prev) => [...prev, { id: crypto.randomUUID(), homeTeamId, awayTeamId, outcome }]);
  }

  function removeScenario(id: string) {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Table Simulator</h1>
        <p className="mt-1 text-sm text-text-muted">
          Scenario simulation — not a prediction. Pick hypothetical results and see the table recalculate.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(LEAGUES) as LeagueCode[]).map((code) => (
          <button
            key={code}
            onClick={() => setLeague(code)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              league === code
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-text-muted hover:bg-surface-raised hover:text-text",
            ].join(" ")}
          >
            {LEAGUES[code].flag} {LEAGUES[code].name}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-text-muted">Loading standings…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {data && !loading && (
        <>
          <DataMetaBadge meta={data.meta} />

          <SectionCard title="Add a hypothetical result">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs text-text-muted">Home team</label>
                <select
                  value={homeTeamId}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  {data.standings.map((s) => (
                    <option key={s.team.id} value={s.team.id}>
                      {s.team.shortName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Result</label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as Outcome)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  <option value="HOME_WIN">Home win</option>
                  <option value="DRAW">Draw</option>
                  <option value="AWAY_WIN">Away win</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-text-muted">Away team</label>
                <select
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  {data.standings.map((s) => (
                    <option key={s.team.id} value={s.team.id}>
                      {s.team.shortName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addScenario}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Add to scenario
              </button>
            </div>

            {scenarios.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {scenarios.map((s) => {
                  const home = data.standings.find((x) => x.team.id === s.homeTeamId)?.team.shortName;
                  const away = data.standings.find((x) => x.team.id === s.awayTeamId)?.team.shortName;
                  const label =
                    s.outcome === "HOME_WIN" ? `${home} win` : s.outcome === "AWAY_WIN" ? `${away} win` : "Draw";
                  return (
                    <li key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                      <span>
                        {home} vs {away} — <span className="font-medium">{label}</span>
                      </span>
                      <button onClick={() => removeScenario(s.id)} className="text-xs text-negative hover:underline">
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Simulated table"
            subtitle={scenarios.length ? `${scenarios.length} hypothetical result(s) applied` : "No scenarios applied yet — showing current table"}
          >
            <StandingsTable standings={simulatedStandings} />
          </SectionCard>
        </>
      )}
    </div>
  );
}
