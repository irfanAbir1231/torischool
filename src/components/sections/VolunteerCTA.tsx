import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function VolunteerCTA() {
  const registrationAvailable = Boolean(site.links.volunteerForm);

  return (
    <Section aria-labelledby="cta-heading" className="py-20 sm:py-28">
      <Container>
        <div className="border-t-2 border-accent pt-8 sm:flex sm:items-end sm:justify-between sm:gap-12">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{site.volunteerCta.eyebrow}</p>
            <h2 id="cta-heading" className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">{site.volunteerCta.heading}</h2>
            <p className="mt-5 text-base leading-8 text-muted">{site.volunteerCta.description}</p>
          </div>
          <div className="mt-8 sm:mt-0 sm:text-right">
            {registrationAvailable ? (
              <a href={site.links.volunteerForm} className="inline-flex min-h-12 items-center justify-center bg-accent px-6 text-sm font-semibold text-cream transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Register as a volunteer →</a>
            ) : (
              <span aria-disabled="true" className="inline-flex min-h-12 cursor-not-allowed items-center justify-center bg-accent/50 px-6 text-sm font-semibold text-cream">Register as a volunteer →</span>
            )}
            {!registrationAvailable ? <p className="mt-3 text-xs text-muted">{site.volunteerCta.unavailableMessage}</p> : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
