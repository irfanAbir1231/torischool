"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { site } from "@/data/site";

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = site.hero.slides;

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeSlide];

  return (
    <section aria-labelledby="hero-heading" className="hero-stage relative isolate flex min-h-[min(760px,calc(100svh-5rem))] items-end overflow-hidden bg-ink text-cream">
      {slides.map((item, index) => (
        <div key={item.label} className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={index !== activeSlide}>
          <Image src={item.image} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,34,56,.15)_0%,rgba(21,34,56,.22)_36%,rgba(21,34,56,.92)_100%)]" />
        </div>
      ))}
      <div className="absolute left-6 right-6 top-7 z-10 flex items-center justify-between sm:left-10 sm:right-10 sm:top-10">
        <span className="rounded-full border border-cream/40 bg-ink/30 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cream backdrop-blur-sm">{slide.label}</span>
        <div className="flex items-center gap-2" aria-label="Hero slides">
          {slides.map((item, index) => <button key={item.label} type="button" aria-label={`Show ${item.label}`} aria-current={index === activeSlide} onClick={() => setActiveSlide(index)} className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-8 bg-cream" : "w-2 bg-cream/50 hover:bg-cream/80"}`} />)}
        </div>
      </div>
      <div className="relative z-10 w-full px-6 pb-12 sm:px-10 sm:pb-16 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div key={slide.label} className="max-w-3xl animate-[hero-copy-in_.7s_cubic-bezier(.22,1,.36,1)]">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent-soft">{site.identity.subtitle}</p>
            <h1 id="hero-heading" className="max-w-3xl text-pretty text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-cream sm:text-6xl lg:text-7xl">{slide.headline}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-cream/80 sm:text-lg">{slide.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#volunteer" className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-ink shadow-[0_4px_0_#c97f1e] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Get involved ↗</a>
              <a href="#tracks" className="inline-flex min-h-12 items-center justify-center rounded-full border border-cream/50 bg-ink/20 px-6 text-sm font-semibold text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream">Explore programs</a>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute bottom-5 right-6 z-10 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-cream/60 sm:right-10">0{activeSlide + 1} / 0{slides.length}</span>
    </section>
  );
}
