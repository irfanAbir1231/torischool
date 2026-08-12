import Image from "next/image";

import { Container } from "@/components/ui/Container";

export function Contributors() {
  return (
    <section className="border-b border-line bg-cream py-8 sm:py-10">
      <Container>
        <p className="text-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">With thanks to our contributors</p>
        <div className="mt-6 flex items-center justify-center opacity-70 grayscale">
          <Image src="/images/photo_supporter_01.png" alt="Tori School contributor" width={292} height={42} className="h-7 w-auto object-contain" />
        </div>
      </Container>
    </section>
  );
}
