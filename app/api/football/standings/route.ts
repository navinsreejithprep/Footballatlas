import { NextRequest, NextResponse } from "next/server";
import { getFootballProvider, LEAGUES, type LeagueCode } from "@/lib/football";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("league") as LeagueCode | null;

  if (!code || !(code in LEAGUES)) {
    return NextResponse.json(
      { error: "Missing or invalid 'league' query param. Expected one of: " + Object.keys(LEAGUES).join(", ") },
      { status: 400 }
    );
  }

  try {
    const provider = getFootballProvider();
    const result = await provider.getStandings(code);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load standings." }, { status: 502 });
  }
}
