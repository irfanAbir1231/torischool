import Link from "next/link";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

const sections = [
  ["intro", "Introduction & core objective"],
  ["identity", "Neutrality & non-commercialization"],
  ["campus-safety", "Volunteer & campus safety"],
  ["childcare", "Affectionate childcare & abuse prevention"],
  ["privacy", "Student privacy, media & data"],
  ["reporting", "Reporting & incident handling"],
  ["agreement", "Acknowledgment & agreement"],
  ["ratification", "Authorization & ratification"],
] as const;

function RuleList({ items }: { items: Array<{ title: string; copy: string }> }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.title} className="flex gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
          <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
          <div>
            <p className="font-semibold text-ink">{item.title}</p>
            <p className="mt-1 text-sm leading-7 text-muted">{item.copy}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Callout({ children, danger = false }: { children: ReactNode; danger?: boolean }) {
  return <div className={`my-5 border-l-4 px-5 py-4 text-sm leading-7 ${danger ? "border-accent-strong bg-[#f5e3dd] text-ink" : "border-accent bg-surface text-muted"}`}>{children}</div>;
}

export default function SafeguardingPolicyPage() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header />
      <main>
        <section className="border-b border-line bg-surface py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <Link href="/" className="inline-flex text-sm font-semibold text-muted underline decoration-line underline-offset-4 hover:text-ink">← Back to Tori School</Link>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Pilot Phase · Policy Document</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">Child Safeguarding &amp; Volunteer Privacy Policy</h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted">This policy sets out the mandatory rules every Tori School volunteer follows to keep our students and volunteers safe, respected, and protected — in sessions, online, and in how we handle personal data.</p>
            <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.08em]">
              <span className="rounded-full bg-accent px-4 py-2 text-cream">Mandatory for all volunteers</span>
              <span className="rounded-full border border-line bg-cream px-4 py-2 text-muted">Pilot phase</span>
              <span className="rounded-full border border-line bg-cream px-4 py-2 text-muted">University of Dhaka</span>
            </div>
            <p className="mt-5 text-xs text-muted">Ratified by the Core Coordinator Team · Tori School, University of Dhaka</p>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 sm:px-8 sm:py-20 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <aside className="h-fit rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">On this page</p>
            <ol className="mt-4 space-y-1">
              {sections.map(([id, label], index) => (
                <li key={id}>
                  <a href={`#${id}`} className="flex gap-3 rounded-lg px-2 py-2 text-sm leading-5 text-muted hover:bg-cream hover:text-ink"><span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>{label}</a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="max-w-3xl space-y-12">
            <section id="intro" className="scroll-mt-28 border-b border-line pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 1</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Introduction &amp; core objective</h2>
              <p className="mt-5 leading-8 text-muted">Tori School is a fully voluntary, non-profit social organization run by undergraduates at the University of Dhaka. We are dedicated to providing a safe, respectful, and nurturing environment for our students and volunteers alike. This policy establishes mandatory operational protocols to protect the safety, privacy, and well-being of everyone involved.</p>
            </section>

            <section id="identity" className="scroll-mt-28 border-b border-line pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 2</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Neutrality, identity &amp; non-commercialization of volunteering</h2>
              <RuleList items={[
                { title: "The single identity rule", copy: "Tori School welcomes volunteers from diverse backgrounds, beliefs, ideologies, and social groups. However, upon entering Tori School, all participants must function strictly as volunteers. No external political, religious, or group identities may be promoted or exercised during service." },
                { title: "No commercial or personal benefit", copy: "This volunteering platform must not be used for any personal, commercial, academic, or professional promotional benefit outside the organization's official scope, regardless of perspective. Serving the children is purely an act of social welfare." },
              ]} />
            </section>

            <section id="campus-safety" className="scroll-mt-28 border-b border-line pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 3</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Volunteer &amp; campus safety</h2>
              <p className="mt-5 leading-8 text-muted">To ensure a safe, inclusive, and professional workspace for all male and female undergraduate volunteers, the following rules apply:</p>
              <div className="mt-5"><RuleList items={[
                { title: "Respectful relations & strict boundaries", copy: "Male and female volunteers must maintain a strictly professional, supportive, and respectful working relationship. Any behavior beyond a formal and respectful peer dynamic is unacceptable within the Tori School ecosystem." },
                { title: "Strict rule of non-isolation", copy: "Under no circumstances shall a single volunteer be left alone with a single student in an enclosed or isolated space. During weather contingencies in campus corridors, a minimum of two volunteers must always remain present." },
                { title: "Daytime operation & safe commuting", copy: "All regular and pop-up sessions must be conducted and wrapped up during daylight hours. If unexpected operational delays occur, Field Squad leaders must ensure female volunteers are grouped or escorted safely across or from campus." },
              ]} /></div>
              <Callout danger><b>Zero tolerance for abuse.</b> Tori School operates a zero-tolerance policy regarding the harassment, exploitation, or abuse of female volunteers. Any breach will result in immediate termination from the organization.</Callout>
            </section>

            <section id="childcare" className="scroll-mt-28 border-b border-line pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 4</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Affectionate childcare &amp; absolute abuse prevention</h2>
              <p className="mt-5 leading-8 text-muted"><b className="text-ink">Affectionate care.</b> Every child attending Tori School, whether from our stationary or mobile tracks, must be treated with the utmost affection, warmth, patience, and dignity.</p>
              <Callout danger><b>Absolute prohibition of child abuse.</b> Regardless of the context, student behavior, or external pressures, no volunteer is permitted to abuse a child in any format (physical, verbal, psychological, or emotional). Corporal punishment or harsh reprimands are strictly prohibited.</Callout>
            </section>

            <section id="privacy" className="scroll-mt-28 border-b border-line pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 5</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Student privacy, media &amp; data protection</h2>
              <div className="mt-5"><RuleList items={[
                { title: "Media and photography restrictions", copy: "No volunteer may take photos or videos of the children using personal devices without prior authorization from the Core Team. Explicit guardian consent must be obtained before a child's face is clearly shown in promotional materials. If consent is unobtainable, identities must be protected using filters or blurring techniques." },
                { title: "Data handling and security", copy: "All student records (attendance logs, background profiles) must be stored in a centralized, secure digital drive. Access is restricted solely to the 5-person Core Coordinator Team." },
                { title: "Off-campus communication boundaries", copy: "Tori School maintains a flexible approach to community building; however, volunteers must use high discretion if sharing personal contact details with students. Interactions outside official hours must remain strictly mentorship-focused." },
              ]} /></div>
            </section>

            <section id="reporting" className="scroll-mt-28 border-b border-line pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 6</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Reporting structure &amp; incident handling</h2>
              <p className="mt-5 leading-8 text-muted"><b className="text-ink">Designated Safeguarding Lead (DSL).</b> One member of the 5-person core team will be appointed as the DSL to act as the primary contact for safety or privacy concerns.</p>
              <h3 className="mt-7 text-lg font-semibold text-ink">Reporting workflow</h3>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted"><span className="rounded-full border border-line bg-surface px-3 py-2">Volunteer witnesses concern</span><span className="text-accent">→</span><span className="rounded-full border border-line bg-surface px-3 py-2">Reports to DSL</span><span className="text-accent">→</span><span className="rounded-full border border-line bg-surface px-3 py-2">Escalated to Chief Coordinator</span><span className="text-accent">→</span><span className="rounded-full border border-line bg-surface px-3 py-2">Final intervention</span></div>
              <p className="mt-5 leading-8 text-muted">If a volunteer witnesses grooming behavior, physical/verbal abuse, or a breach of privacy during a session, they must report it immediately to the DSL, who will escalate it directly to the Chief Coordinator for final intervention.</p>
              <Callout><b className="text-ink">Scope during pilot phase.</b> Because Tori School is in its pilot phase and awaiting formal registration, the program cannot formally intervene in systemic abuse occurring outside school hours (e.g., domestic issues or external street exploitation). Volunteers must not attempt personal interventions in a student&apos;s private home or family matters.</Callout>
            </section>

            <section id="agreement" className="scroll-mt-28 border-b border-line pb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 7</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Mandatory acknowledgment &amp; binding agreement</h2>
              <div className="mt-5 border border-dashed border-line bg-cream p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Binding on all volunteers</p>
                <p className="mt-4 leading-8 text-muted"><b className="text-ink">Mandatory reading.</b> Upon enrollment and before joining any active Field Squad, every volunteer is required to read this safeguard guideline completely.</p>
                <p className="mt-3 leading-8 text-muted"><b className="text-ink">Implied and continuous consent.</b> Remaining a part of Tori School explicitly means that the volunteer has accepted, understood, and agreed to fully follow these rules. Non-compliance will result in immediate removal from the organization.</p>
              </div>
            </section>

            <section id="ratification" className="scroll-mt-28">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Section 8</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">Policy authorization &amp; ratification</h2>
              <p className="mt-5 leading-8 text-muted">This policy is formally approved and enacted for the Tori School pilot phase operations. Any amendments to these guidelines must be reviewed and authorized by the Core Coordinator Team.</p>
              <div className="mt-6 rounded-2xl bg-ink p-7 text-cream sm:p-9">
                <h3 className="text-xl font-semibold">Questions or concerns about this policy?</h3>
                <p className="mt-3 text-sm leading-7 text-cream/70">Reach the Core Coordinator Team directly — every report is treated seriously and confidentially.</p>
                <a href="mailto:torischooldu@gmail.com" className="mt-5 inline-block font-mono text-sm text-accent-soft underline underline-offset-4">torischooldu@gmail.com</a>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
