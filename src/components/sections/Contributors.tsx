import Image from "next/image";

import { Container } from "@/components/ui/Container";

export function Contributors() {
  return (
    <section className="border-b border-line bg-cream py-8 sm:py-10">
      <Container>
        <p className="text-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">With thanks to our contributors</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-8 opacity-70 grayscale sm:gap-12">
          <div className="flex h-8 items-center rounded border border-dashed border-line px-4 font-mono text-xs text-muted">Logo One</div>
          <Image src="/images/photo_supporter_01.png" alt="Tori School contributor" width={292} height={42} className="h-7 w-auto object-contain" />
          <div className="flex h-8 items-center rounded border border-dashed border-line px-4 font-mono text-xs text-muted">Logo Three</div>
        </div>
      </Container>
    </section>
  );
}
