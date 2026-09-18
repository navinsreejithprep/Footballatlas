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
    <section className="card-shadow rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span aria-hidden className="bg-brand mt-0.5 h-9 w-1.5 shrink-0 rounded-full" />
          <div>
            <h2 className="text-base font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
          </div>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="whitespace-nowrap rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white"
          >
            View all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
