import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <Section className="border-b border-line pb-24 pt-24 sm:pb-32 sm:pt-32">
        <Container>
          <div className="max-w-4xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{site.identity.subtitle}</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-ink sm:text-7xl">
              {site.hero.headline}
            </h1>
            <div className="mt-8 max-w-2xl space-y-4 text-base leading-8 text-muted sm:text-lg">
              {site.hero.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Button href="#volunteer">Get involved</Button>
              <Button href="#tracks" variant="text">Explore the tracks</Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section id="tracks">
        <Container>
          <SectionHeading eyebrow="The foundation" title="A clear place to begin." description="This first phase establishes the content and layout primitives for Tori School's future story." />
        </Container>
      </Section>
    </main>
  );
}
