import { Container } from "@/components/ui/Container";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function VolunteerExperience() {
  return (
    <Section id="volunteer" aria-labelledby="volunteer-heading" className="bg-ink text-cream">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">The volunteer experience</p>
            <h2 id="volunteer-heading" className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-cream sm:text-5xl">{site.volunteerExperience.heading}</h2>
          </div>
          <div>
            <p className="max-w-2xl text-xl leading-9 text-cream/80 sm:text-2xl">{site.volunteerExperience.introduction}</p>
            <ul className="mt-10 divide-y divide-cream/20 border-y border-cream/20">
              {site.volunteerExperience.points.map((point) => <li key={point} className="py-5 text-base leading-7 text-cream/75">{point}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12">
          {site.volunteerGallery.map((item, index) => (
            <div key={item.subject} className={index === 0 ? "lg:col-span-6" : "lg:col-span-2"}>
              <PlaceholderMedia label={item.subject} image={item.image} labelClassName="text-cream/75" aspectClass={index === 0 ? "aspect-[4/3]" : "aspect-square"} className="border-cream/20 bg-ink text-cream" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
