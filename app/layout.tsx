import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-lg font-semibold tracking-tight">Football Atlas</span>
              <span className="hidden text-xs text-text-muted sm:inline">
                Europe&rsquo;s football, connected.
              </span>
            </Link>
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-text-muted transition hover:bg-surface-raised hover:text-text"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">{children}</main>

        <footer className="border-t border-border">
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
