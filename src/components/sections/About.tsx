import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function About() {
  return (
    <Section id="about" aria-labelledby="about-heading" className="bg-cream">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
          <div>
            <p className="eyebrow mb-4">About</p>
            <h2 id="about-heading" className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.045em] text-ink sm:text-5xl">A student-led initiative built around showing up.</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted">{site.organization.introduction}</p>
            <div className="mt-8 grid max-w-lg grid-cols-2 gap-4 border-t border-line pt-5 text-sm text-muted sm:grid-cols-3">
              <div><p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">Where</p><p className="mt-2 text-ink">University of Dhaka</p></div>
              <div><p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">Format</p><p className="mt-2 text-ink">Student-led</p></div>
              <div><p className="font-mono text-xs uppercase tracking-[0.12em] text-accent">Focus</p><p className="mt-2 text-ink">Consistent support</p></div>
            </div>
          </div>
          <div data-parallax="0.05" className="relative overflow-hidden rounded-2xl bg-surface shadow-[0_18px_40px_-20px_rgba(21,34,56,.4)]">
            <Image src={site.organization.teamPhoto} alt={site.organization.teamPhotoCaption} width={1080} height={608} className="aspect-[16/9] w-full object-cover" />
            <p className="absolute bottom-4 left-4 rounded-full bg-ink/75 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-cream backdrop-blur-sm">The Tori School community</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
