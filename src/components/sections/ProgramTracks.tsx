import { Container } from "@/components/ui/Container";
import { ResponsiveVideo } from "@/components/ui/ResponsiveVideo";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/data/site";

export function ProgramTracks() {
  const videoContent = [site.videoContent.academicRescueAcademy, site.videoContent.popUpWelfareCamps];
  const videoSources = [site.links.academicRescueAcademyVideo, site.links.popUpWelfareCampsVideo];

  return (
    <Section id="tracks" aria-labelledby="tracks-heading">
      <Container>
        <SectionHeading id="tracks-heading" eyebrow="Two ways we show up" title="What we do" description="The pilot has two complementary tracks, shaped around the different rhythms of the children we meet." />
        <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
          {site.tracks.map((track, index) => {
            const isFirst = index === 0;
            return (
              <article key={track.title} className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
                <div className={isFirst ? "lg:col-start-2 lg:row-start-1" : "lg:col-start-1 lg:row-start-1"}>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">0{index + 1}</p>
                  <h3 className="text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">{track.title}</h3>
                  <p className="mt-5 max-w-xl text-base leading-8 text-muted">{track.description}</p>
                  <dl className="mt-8 grid max-w-md grid-cols-2 gap-6 border-t border-line pt-5">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Where</dt>
                      <dd className="mt-2 text-sm leading-6 text-ink">{track.where}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">When</dt>
                      <dd className="mt-2 text-sm leading-6 text-ink">{track.when}</dd>
                    </div>
                  </dl>
                </div>
                <div className={isFirst ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-start-1"}>
                  <ResponsiveVideo source={videoSources[index]} title={videoContent[index].title} status={videoContent[index].status} />
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
