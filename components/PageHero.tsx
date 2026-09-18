import type { ReactNode } from "react";

/** Gradient banner that opens each page. Defaults to the brand gradient; league pages pass their own. */
export function PageHero({
  title,
  eyebrow,
  gradient,
  lead,
  children,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  gradient?: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section
      className="card-shadow relative overflow-hidden rounded-3xl p-6 text-white sm:p-8"
      style={{ backgroundImage: gradient ?? "var(--atlas-brand-gradient)" }}
    >
      <div aria-hidden className="pitch-lines pointer-events-none absolute inset-0 hidden sm:block" />
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-3">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/90">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {lead && <p className="max-w-2xl text-sm text-white/90 sm:text-base">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
