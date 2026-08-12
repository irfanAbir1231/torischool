import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function Support() {
  return (
    <Section id="support" aria-labelledby="support-heading" className="bg-cream py-20 sm:py-28">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-ink px-6 py-10 text-cream sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full border border-accent/30 bg-accent/10 blur-sm" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 h-80 w-80 rounded-full border border-cream/10" />
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">Support Tori School</p>
              <h2 id="support-heading" className="mt-5 max-w-xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-cream sm:text-5xl">{site.support.heading}</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-cream/70 sm:text-lg">{site.support.description}</p>
            </div>
            <div className="max-w-sm rounded-2xl border border-cream/15 bg-cream/[0.06] p-6 backdrop-blur-sm sm:p-7">
              <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent-soft">Want to contribute?</p>
              <p className="mt-4 text-sm leading-7 text-cream/70">Share your donation details through our form and our team will follow up with the next steps.</p>
              <a href={site.links.donationForm} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-ink shadow-[0_4px_0_#c97f1e] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Share donation details ↗</a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
