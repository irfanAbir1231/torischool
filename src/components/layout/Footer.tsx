import { Container } from "@/components/ui/Container";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em] text-ink">{site.identity.name}</p>
            <p className="mt-2 text-sm text-muted">{site.identity.location}</p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-ink">
            <a href={`mailto:${site.links.email}`} className="underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">{site.links.email}</a>
            <a href={site.links.facebook} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Facebook</a>
            <a href={site.links.youtube} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">YouTube</a>
            <a href={site.links.linkedin} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">LinkedIn</a>
            <a href="/safeguarding-policy.html" target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">Safeguarding Policy ↗</a>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-5 text-xs text-muted">© {new Date().getFullYear()} {site.identity.name}</div>
      </Container>
    </footer>
  );
}
