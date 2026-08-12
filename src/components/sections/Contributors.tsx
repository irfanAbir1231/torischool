import Image from "next/image";

import { Container } from "@/components/ui/Container";

export function Contributors() {
  return (
    <section className="border-b border-line bg-cream py-8 sm:py-10">
      <Container>
        <p className="text-center font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted">With thanks to our contributor</p>
        <div className="mt-6 flex items-center justify-center">
          <div className="rounded-xl border border-line bg-cream px-7 py-4 shadow-[0_8px_22px_-18px_rgba(21,34,56,.55)]">
            <Image src="/images/photo_supporter_01.png" alt="Tori School contributor" width={292} height={42} className="h-8 w-auto object-contain" />
          </div>
        </div>
      </Container>
    </section>
  );
}
