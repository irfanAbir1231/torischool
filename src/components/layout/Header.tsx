import Link from "next/link";
import Image from "next/image";

import { MobileNav } from "@/components/layout/MobileNav";
import { site } from "@/data/site";
import { Container } from "@/components/ui/Container";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream">
      <Container className="flex min-h-20 items-center justify-between gap-8">
        <Link href="/" className="group flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          {site.identity.logo ? (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-cream shadow-[0_5px_14px_-10px_rgba(21,34,56,.5)]">
              <Image src={site.identity.logo} alt="" fill sizes="48px" className="object-cover object-[center_28%] mix-blend-multiply" />
            </span>
          ) : null}
          <span>
            <span className="block text-lg font-semibold tracking-[-0.02em] text-ink">{site.identity.name}</span>
            <span className="block text-[0.68rem] uppercase tracking-[0.16em] text-muted">{site.identity.subtitle}</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {site.navigation.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              {item.label}
            </a>
          ))}
        </nav>
        <MobileNav links={site.navigation} />
      </Container>
    </header>
  );
}
