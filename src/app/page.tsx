import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Contributors } from "@/components/sections/Contributors";
import { ImpactStats } from "@/components/sections/ImpactStats";
import { ProgramTracks } from "@/components/sections/ProgramTracks";
import { Support } from "@/components/sections/Support";
import { VolunteerExperience } from "@/components/sections/VolunteerExperience";

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <Hero />
      <Contributors />
      <ImpactStats />
      <ProgramTracks />
      <About />
      <Support />
      <VolunteerExperience />
    </main>
  );
}
