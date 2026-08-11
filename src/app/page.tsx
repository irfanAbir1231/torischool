import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ImpactStats } from "@/components/sections/ImpactStats";
import { ProgramTracks } from "@/components/sections/ProgramTracks";
import { Safeguarding } from "@/components/sections/Safeguarding";
import { Support } from "@/components/sections/Support";
import { VolunteerCTA } from "@/components/sections/VolunteerCTA";
import { VolunteerExperience } from "@/components/sections/VolunteerExperience";
import { VolunteerJourney } from "@/components/sections/VolunteerJourney";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <Hero />
      <ImpactStats />
      <ProgramTracks />
      <HowItWorks />
      <VolunteerExperience />
      <VolunteerJourney />
      <Safeguarding />
      <Support />
      <VolunteerCTA />
    </main>
  );
}
