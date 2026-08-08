import { Container } from "@/components/ui/Container";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";

export function Organization() {
  return (
    <Section id="team" aria-labelledby="team-heading">
      <Container>
        <SectionHeading id="team-heading" eyebrow="A student-led initiative" title="The people behind Tori School" description={site.organization.introduction} />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 sm:gap-10 lg:max-w-3xl">
          {site.leadership.map((person) => (
            <article key={person.role}>
              <PlaceholderMedia label={`${person.role} portrait — details coming soon`} image={person.image} />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{person.role}</p>
              <p className="mt-2 text-lg font-medium text-ink">{person.name}</p>
            </article>
          ))}
        </div>
        <figure className="mt-16 sm:mt-24">
          <PlaceholderMedia label="Full team group photo — details coming soon" image={site.organization.teamPhoto} aspectClass="aspect-[16/8]" className="w-full" />
          <figcaption className="mt-4 text-sm text-muted">{site.organization.teamPhotoCaption}</figcaption>
        </figure>
      </Container>
    </Section>
  );
}
