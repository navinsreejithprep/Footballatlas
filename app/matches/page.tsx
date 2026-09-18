import { getFootballProvider } from "@/lib/football";
import { DataMetaBadge } from "@/components/DataMetaBadge";
import { PageHero } from "@/components/PageHero";
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
      <PageHero
        eyebrow="Live · Today · Upcoming · Results"
        title="Match Centre"
        lead="Every match across Europe’s top five leagues, filterable by league and club."
      >
        <DataMetaBadge meta={result.meta} onBrand />
      </PageHero>

      <MatchCentreClient matches={result.matches} />
    </div>
  );
}
