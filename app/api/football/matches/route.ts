import { NextRequest, NextResponse } from "next/server";
import { getFootballProvider, LEAGUES, type LeagueCode, type MatchStatus } from "@/lib/football";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const leagueParam = params.get("league") as LeagueCode | null;
  const statusParam = params.get("status"); // comma-separated
  const dateFrom = params.get("dateFrom") ?? undefined;
  const dateTo = params.get("dateTo") ?? undefined;
  const teamId = params.get("teamId") ?? undefined;

  if (leagueParam && !(leagueParam in LEAGUES)) {
    return NextResponse.json(
      { error: "Invalid 'league' query param. Expected one of: " + Object.keys(LEAGUES).join(", ") },
      { status: 400 }
    );
  }

  try {
    const provider = getFootballProvider();
    const result = await provider.getMatches({
      leagueCode: leagueParam ?? undefined,
      status: statusParam ? (statusParam.split(",") as MatchStatus[]) : undefined,
      dateFrom,
      dateTo,
      teamId,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load matches." }, { status: 502 });
  }
}
