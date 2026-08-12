import { Container } from "@/components/ui/Container";
import { ResponsiveVideo } from "@/components/ui/ResponsiveVideo";
import { Section } from "@/components/ui/Section";
import { site } from "@/data/site";

export function ProgramTracks() {
  const videoContent = [site.videoContent.academicRescueAcademy, site.videoContent.popUpWelfareCamps];
  const videoSources = [site.links.academicRescueAcademyVideo, site.links.popUpWelfareCampsVideo];

  return (
    <Section id="tracks" aria-labelledby="tracks-heading" className="bg-surface">
      <Container>
        <div className="mb-10 max-w-2xl sm:mb-12">
          <p className="eyebrow mb-4">Our programs</p>
          <h2 id="tracks-heading" className="text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Two programs, one shared mission</h2>
        </div>
        <div data-stagger className="grid gap-6 lg:grid-cols-2">
          {site.tracks.map((track, index) => (
            <article key={track.title} className="overflow-hidden rounded-2xl border border-line bg-cream shadow-[0_18px_35px_-28px_rgba(21,34,56,.55)] transition-transform duration-500 hover:-translate-y-1">
              <div className="relative overflow-hidden bg-ink">
                <ResponsiveVideo source={videoSources[index]} poster={track.image} title={videoContent[index].title} status={videoContent[index].status} className="max-w-none rounded-none border-0" />
                <span className="absolute left-4 top-4 z-10 rounded-full border border-cream/40 bg-ink/40 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-cream backdrop-blur-sm">{index === 0 ? "Stationary" : "Mobile"}</span>
              </div>
              <div className="p-6 sm:p-7">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">0{index + 1}</p>
                <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">{track.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{track.description}</p>
                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-xs text-muted">
                  <div><dt className="font-mono uppercase tracking-[0.12em] text-accent">Where</dt><dd className="mt-1 font-medium text-ink">{track.where}</dd></div>
                  <div><dt className="font-mono uppercase tracking-[0.12em] text-accent">When</dt><dd className="mt-1 font-medium text-ink">{track.when}</dd></div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
