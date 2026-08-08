"use client";

import { useEffect, useState } from "react";

import type { SiteLink } from "@/data/site";

type MobileNavProps = {
  links: SiteLink[];
};

export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        className="inline-flex min-h-11 min-w-11 items-center justify-center border border-line text-ink transition-colors hover:bg-ink hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true" className="flex w-4 flex-col gap-1">
          <span className="block h-px w-full bg-current" />
          <span className="block h-px w-full bg-current" />
          <span className="block h-px w-full bg-current" />
        </span>
      </button>

      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!isOpen}
        className="absolute inset-x-0 top-full border-b border-line bg-cream px-6 py-4 shadow-[0_12px_24px_rgba(23,35,33,0.06)]"
      >
        <ul className="mx-auto max-w-7xl divide-y divide-line">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="block py-4 text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
