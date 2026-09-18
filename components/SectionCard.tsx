import Link from "next/link";
import type { ReactNode } from "react";

export function SectionCard({
  title,
  subtitle,
  viewAllHref,
  children,
}: {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="whitespace-nowrap text-xs font-medium text-accent hover:underline">
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
