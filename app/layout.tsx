import type { Metadata } from "next";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football Atlas — European Football Intelligence",
  description: "One dashboard. Europe's football, connected.",
};

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/leagues", label: "Leagues" },
  { href: "/matches", label: "Match Centre" },
  { href: "/analytics/table-simulator", label: "Table Simulator" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-bg text-text antialiased">
        <header className="sticky top-0 z-20 bg-brand shadow-[0_10px_28px_-14px_rgba(69,39,232,0.7)]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
            <Link href="/" className="flex items-center gap-2.5 text-white focus-visible:outline-white">
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                ⚽
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-lg font-extrabold tracking-tight">Football Atlas</span>
                <span className="hidden text-[11px] font-medium text-white/85 sm:block">
                  Europe&rsquo;s football, connected.
                </span>
              </span>
            </Link>
            <NavLinks links={NAV_LINKS} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">{children}</main>

        <footer className="border-t border-border bg-white/70">
          <div className="mx-auto max-w-6xl px-5 py-6 text-xs text-text-muted">
            Football Atlas is an independent project. Scores and standings are provided by{" "}
            <a
              href="https://www.football-data.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-border underline-offset-2 hover:text-text"
            >
              football-data.org
            </a>
            ; headlines are from BBC Sport and The Guardian and link to the original articles. Proprietary
            indicators (Momentum Index, League DNA, etc.) are Football Atlas&rsquo; own analysis, not official
            league or federation statistics.
          </div>
        </footer>
      </body>
    </html>
  );
}
