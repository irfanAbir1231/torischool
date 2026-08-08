import Link from "next/link";

import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";

export function Header() {
  return (
    <header className="border-b border-line bg-cream">
      <Container className="flex min-h-20 items-center justify-between gap-8">
        <Link href="/" className="group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          <span className="block text-lg font-semibold tracking-[-0.02em] text-ink">{site.identity.name}</span>
          <span className="block text-[0.68rem] uppercase tracking-[0.16em] text-muted">{site.identity.subtitle}</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 sm:flex">
          {site.navigation.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              {item.label}
            </a>
          ))}
        </nav>
      </Container>
    </header>
  );
}
