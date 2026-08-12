import { Container } from "@/components/ui/Container";
import { ResponsiveVideo } from "@/components/ui/ResponsiveVideo";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function VolunteerExperience() {
  return (
    <Section id="volunteer" aria-labelledby="volunteer-heading" className="bg-surface py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center mb-4">Get involved</p>
          <h2 id="volunteer-heading" className="text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Why volunteer with Tori School</h2>
        </div>
        <div className="mx-auto mt-10 max-w-4xl">
          <ResponsiveVideo source={site.links.volunteerVideo} title="Why volunteer with Tori School" status="Volunteering at Tori School — promo video" className="mx-auto shadow-[0_24px_45px_-24px_rgba(21,34,56,.5)]" />
        </div>
        <div data-stagger className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm text-muted sm:text-base">
          {site.volunteerJourney.map((step, index) => <span key={step.number} className="flex items-center gap-3"><strong className="text-ink">{index + 1}. {step.title}</strong>{index < site.volunteerJourney.length - 1 ? <span className="text-accent">→</span> : null}</span>)}
        </div>
        <div className="mt-9 text-center">
          <a href={site.links.volunteerForm} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-ink shadow-[0_4px_0_#c97f1e] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Register as a volunteer ↗</a>
        </div>
      </Container>
    </Section>
  );
}
