"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ links }: { links: Array<{ href: string; label: string }> }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="scrollbar-thin flex items-center gap-1 overflow-x-auto py-0.5">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={[
              "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline-white",
              active ? "bg-white text-accent shadow-sm" : "text-white/90 hover:bg-white/15 hover:text-white",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
