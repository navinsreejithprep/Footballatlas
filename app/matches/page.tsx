import { getFootballProvider } from "@/lib/football";
import { DataMetaBadge } from "@/components/DataMetaBadge";
import { MatchCentreClient } from "@/components/MatchCentreClient";

export const revalidate = 60;

export default async function MatchesPage() {
  const provider = getFootballProvider();
  const now = new Date();
  const dateFrom = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const dateTo = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const result = await provider.getMatches({ dateFrom, dateTo });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Match Centre</h1>
        <p className="mt-1 text-sm text-text-muted">Live, today's, upcoming and recent matches across Europe's top five leagues.</p>
        <div className="mt-2">
          <DataMetaBadge meta={result.meta} />
        </div>
      </div>

      <MatchCentreClient matches={result.matches} />
    </div>
  );
}
