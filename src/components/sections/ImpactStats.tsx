import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatCounter } from "@/components/ui/StatCounter";
import { site } from "@/data/site";

export function ImpactStats() {
  return (
    <Section aria-labelledby="impact-heading" className="border-y border-line bg-surface py-16 sm:py-20">
      <Container>
        <SectionHeading id="impact-heading" eyebrow="A starting point" title="Current pilot snapshot" description="A small initiative, measured by the people who keep showing up." />
        <div className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line sm:border-t-0 sm:pt-0">
          {site.stats.map((stat) => (
            <div key={stat.label} className="sm:px-8 first:sm:pl-0 last:sm:pr-0">
              <p className="text-5xl font-semibold tracking-[-0.05em] text-ink sm:text-6xl"><StatCounter value={stat.value} /></p>
              <p className="mt-3 max-w-[14rem] text-sm leading-6 text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
