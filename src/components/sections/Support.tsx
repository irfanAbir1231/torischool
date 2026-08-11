"use client";

import { useState } from "react";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function Support() {
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(site.support.bkashNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Section id="support" aria-labelledby="support-heading" className="bg-accent py-16 text-cream sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">Support Tori School</p>
            <h2 id="support-heading" className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{site.support.heading}</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-cream/80">{site.support.description}</p>
          </div>
          <div className="min-w-0 border border-cream/30 bg-ink p-6 sm:min-w-[22rem] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-soft">Send Money via bKash</p>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-cream sm:text-3xl">{site.support.bkashNumber}</p>
            <p className="mt-3 text-sm leading-6 text-cream/70">Open your bKash app, choose Send Money, and use this number.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={copyNumber} className="inline-flex min-h-11 items-center justify-center border border-cream/50 px-4 text-sm font-semibold text-cream transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream">
                {copied ? "Number copied" : "Copy number"}
              </button>
              <a href="https://www.bkash.com/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center bg-cream px-4 text-sm font-semibold text-ink transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream">Open bKash ↗</a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
