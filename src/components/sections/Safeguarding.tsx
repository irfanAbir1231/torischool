import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function Safeguarding() {
  return (
    <Section aria-labelledby="safeguarding-heading" className="border-y border-line bg-surface py-12 sm:py-16">
      <Container>
        <div className="grid gap-5 sm:grid-cols-[0.7fr_1.3fr] sm:gap-12">
          <h2 id="safeguarding-heading" className="text-xl font-semibold tracking-[-0.02em] text-ink">{site.safeguarding.heading}</h2>
          <p className="max-w-2xl text-base leading-8 text-muted">{site.safeguarding.copy}</p>
        </div>
      </Container>
    </Section>
  );
}
