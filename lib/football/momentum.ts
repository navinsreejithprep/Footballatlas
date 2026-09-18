import type { Standing, MomentumEntry } from "./types";

/**
 * Football Atlas Momentum Index
 * ---------------------------------------------------------------
 * This is a FOOTBALL ATLAS PROPRIETARY INDICATOR.
 * It is NOT an official UEFA, FIFA, Opta, or league statistic.
 *
 * Methodology (deterministic, explainable — no randomness):
 *
 *   1. Form score: last 5 results (from `standing.form`, e.g. "WWDLW"),
 *      weighted so more recent matches count more.
 *        W = +3, D = +1, L = 0
 *        weights (oldest -> newest): 0.6, 0.8, 1.0, 1.2, 1.4
 *      formScore = weighted sum, normalized to 0-100.
 *
 *   2. Goal trend: goal difference per game played, normalized to 0-100
 *      against a -2..+2 GD/game range.
 *
 *   3. Momentum Index = round(0.65 * formScore + 0.35 * goalTrendScore),
 *      then re-centered to a -100..+100 scale where 0 = perfectly average.
 *
 * Trend is derived by comparing the most recent result in `form` against
 * the average of the previous four: "up" if the latest result out-performs
 * the recent average, "down" if it under-performs, else "flat".
 *
 * Every place this is displayed must show the
 * "Football Atlas proprietary indicator" label plus this explanation.
 */

const RESULT_POINTS: Record<string, number> = { W: 3, D: 1, L: 0 };
const RECENCY_WEIGHTS = [0.6, 0.8, 1.0, 1.2, 1.4];

function formScore(form: string | undefined): number {
  if (!form) return 50; // neutral if unknown
  const results = form.toUpperCase().slice(-5).split("");
  const weights = RECENCY_WEIGHTS.slice(RECENCY_WEIGHTS.length - results.length);
  const maxPossible = weights.reduce((sum, w) => sum + w * 3, 0);
  const achieved = results.reduce((sum, r, i) => sum + (RESULT_POINTS[r] ?? 0) * weights[i], 0);
  return maxPossible === 0 ? 50 : (achieved / maxPossible) * 100;
}

function goalTrendScore(standing: Standing): number {
  if (standing.playedGames === 0) return 50;
  const gdPerGame = standing.goalDifference / standing.playedGames;
  const clamped = Math.max(-2, Math.min(2, gdPerGame));
  return ((clamped + 2) / 4) * 100; // maps -2..+2 -> 0..100
}

function trendFromForm(form: string | undefined): { trend: "up" | "down" | "flat"; changeFromPrevious: number } {
  if (!form || form.length < 2) return { trend: "flat", changeFromPrevious: 0 };
  const results = form.toUpperCase().slice(-5).split("");
  const latest = RESULT_POINTS[results[results.length - 1]] ?? 0;
  const previous = results.slice(0, -1);
  const avgPrevious =
    previous.reduce((sum, r) => sum + (RESULT_POINTS[r] ?? 0), 0) / (previous.length || 1);
  const diff = latest - avgPrevious;
  const changeFromPrevious = Math.round(diff * 10) / 10;
  if (diff > 0.3) return { trend: "up", changeFromPrevious };
  if (diff < -0.3) return { trend: "down", changeFromPrevious };
  return { trend: "flat", changeFromPrevious };
}

export function computeMomentum(standing: Standing): MomentumEntry {
  const fScore = formScore(standing.form);
  const gScore = goalTrendScore(standing);
  const blended = 0.65 * fScore + 0.35 * gScore; // 0..100
  const momentumIndex = Math.round(blended * 2 - 100); // recenter to -100..+100

  const { trend, changeFromPrevious } = trendFromForm(standing.form);

  return {
    team: standing.team,
    momentumIndex,
    trend,
    recentForm: standing.form ?? "N/A",
    changeFromPrevious,
  };
}

export function computeMomentumTable(standings: Standing[]): MomentumEntry[] {
  return standings
    .map(computeMomentum)
    .sort((a, b) => b.momentumIndex - a.momentumIndex);
}
