import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <Container className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{site.identity.name} · {site.identity.location}</p>
        <a href={site.links.facebook} target="_blank" rel="noreferrer" className="w-fit underline decoration-line underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          Follow on Facebook
        </a>
      </Container>
    </footer>
  );
}
