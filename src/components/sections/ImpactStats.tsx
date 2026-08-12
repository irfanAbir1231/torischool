import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function ImpactStats() {
  return (
    <Section aria-labelledby="impact-heading" className="border-y border-line bg-cream py-20 sm:py-28">
      <Container>
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow mb-4">Snapshot</p>
          <h2 id="impact-heading" className="text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Our journey so far</h2>
        </div>
        <div data-stagger className="grid gap-5 sm:grid-cols-2">
          {[site.stats[0], site.stats[1]].map((stat, index) => (
            <article key={stat.label} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
              <Image src={index === 0 ? "/images/photo_volunteers_group.jpg" : "/images/photo_children_session.jpg"} alt={index === 0 ? "Tori School volunteers and children" : "Children in a Tori School session"} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />
              <div className="absolute left-5 top-5 rounded-full bg-ink/35 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-cream/80 backdrop-blur-sm">{index === 0 ? "Our community" : "In session"}</div>
              <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-cream p-4 shadow-lg"><p className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">{stat.value}</p><p className="mt-1 text-sm font-medium text-muted">{stat.label}</p></div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
