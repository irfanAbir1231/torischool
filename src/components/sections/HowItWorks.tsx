import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";

export function HowItWorks() {
  return (
    <Section aria-labelledby="how-it-works-heading" className="border-y border-line bg-surface">
      <Container>
        <SectionHeading id="how-it-works-heading" eyebrow="The operating philosophy" title="How Tori works" description="Consistency over charity spectacle: the work is built in the ordinary rhythm of returning." />
        <div data-stagger className="mt-14 grid border-t border-line md:grid-cols-3 md:divide-x md:divide-line">
          {site.howItWorks.map((step) => (
            <div key={step.number} className="border-b border-line py-8 last:border-b-0 md:border-b-0 md:px-8 first:md:pl-0 last:md:pr-0">
              <p className="text-4xl font-semibold tracking-[-0.05em] text-accent">{step.number}</p>
              <h3 className="mt-7 text-2xl font-semibold tracking-[-0.02em] text-ink">{step.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-7 text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
