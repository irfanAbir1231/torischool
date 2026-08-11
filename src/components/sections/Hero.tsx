import { Container } from "@/components/ui/Container";
import { ResponsiveVideo } from "@/components/ui/ResponsiveVideo";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function Hero() {
  return (
    <Section id="about" aria-labelledby="hero-heading" className="pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-28">
      <Container>
        <div className="max-w-4xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{site.identity.subtitle}</p>
          <h1 id="hero-heading" className="max-w-4xl text-pretty text-5xl font-semibold leading-[1.04] tracking-[-0.05em] text-ink sm:text-6xl lg:text-7xl">
            {site.hero.headline}
          </h1>
          <div className="mt-7 max-w-2xl space-y-3 text-base leading-8 text-muted sm:mt-8 sm:text-lg">
            {site.hero.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <div className="mt-14 sm:mt-18 lg:mt-20">
          <ResponsiveVideo source={site.links.heroVideo} poster={site.hero.image} parallax title={site.videoContent.hero.title} status={site.videoContent.hero.status} className="mx-auto" />
        </div>
      </Container>
    </Section>
  );
}
