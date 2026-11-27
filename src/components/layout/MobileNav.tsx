"use client";

import { useEffect, useRef, useState } from "react";

import type { SiteLink } from "@/data/site";
import Link from "next/link";

type MobileNavProps = {
  links: SiteLink[];
};

export function MobileNav({ links }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;
     const triggerElement = triggerRef.current;

    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements =
        navRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("nav-open");

    return () => {
  document.removeEventListener("keydown", handleKeyDown);
  document.body.classList.remove("nav-open");
  triggerElement?.focus();
};
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
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

      <div
        inert={!isOpen}
        className={
          isOpen
            ? "pointer-events-auto fixed inset-0 z-50"
            : "pointer-events-none fixed inset-0 z-50"
        }
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={-1}
          className={
            isOpen
              ? "absolute inset-0 bg-ink/30 opacity-100 backdrop-blur-[2px] transition-opacity duration-300"
              : "absolute inset-0 bg-ink/30 opacity-0 transition-opacity duration-300"
          }
          onClick={() => setIsOpen(false)}
        />

        <nav
          ref={navRef}
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className={
            isOpen
              ? "absolute right-0 top-0 flex h-full w-[min(86vw,22rem)] translate-x-0 flex-col bg-cream px-7 pb-8 pt-6 shadow-[-24px_0_60px_rgba(23,35,33,0.16)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              : "absolute right-0 top-0 flex h-full w-[min(86vw,22rem)] translate-x-full flex-col bg-cream px-7 pb-8 pt-6 shadow-[-24px_0_60px_rgba(23,35,33,0.16)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          }
        >
          <div className="flex items-center justify-between border-b border-line pb-5">
            <span className="text-lg font-semibold tracking-[-0.02em] text-ink">
              Tori School
            </span>

            <button
              ref={closeRef}
              type="button"
              aria-label="Close navigation"
              className="inline-flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors hover:bg-ink hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={() => setIsOpen(false)}
            >
              <span aria-hidden="true" className="relative block h-4 w-4">
                <span className="absolute left-1/2 top-1/2 block h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                <span className="absolute left-1/2 top-1/2 block h-px w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <ul className="mt-8 divide-y divide-line">
            {links.map((link, index) => (
              <li key={link.href} className="overflow-hidden">
                <a
                  href={link.href}
                  className={
                    isOpen
                      ? "mobile-nav-link mobile-nav-link-open"
                      : "mobile-nav-link"
                  }
                  style={{
                    transitionDelay: isOpen
                      ? `${120 + index * 55}ms`
                      : "0ms",
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true" className="text-accent">
                    &#8599;
                  </span>
                </a>
              </li>
            ))}
          </ul>
                     <Link
            href="/login"
            className="mt-6 inline-flex min-h-12 items-center justify-center bg-ink px-5 text-sm font-medium text-cream transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>

          <div className="mt-auto border-t border-line pt-6 text-sm leading-6 text-muted">
            Learning support for children in University of Dhaka campus
            communities.
          </div>
        </nav>
      </div>
    </div>
  );
}