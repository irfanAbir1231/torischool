import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";

export function VolunteerJourney() {
  return (
    <Section aria-labelledby="journey-heading">
      <Container>
        <SectionHeading id="journey-heading" eyebrow="Before your first session" title="Your volunteer journey" description="A simple first step, a chance to meet the people involved, and then a session with the field team." />
        <ol className="mt-14 grid border-t border-line md:grid-cols-3 md:divide-x md:divide-line">
          {site.volunteerJourney.map((step) => (
            <li key={step.number} className="border-b border-line py-8 last:border-b-0 md:border-b-0 md:px-8 first:md:pl-0 last:md:pr-0">
              <p className="text-sm font-semibold text-accent">{step.number}</p>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
