"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollMotion } from "@/components/motion/ScrollMotion";

type SiteChromeProps = {
  children: React.ReactNode;
};

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();

  const isPortal =
    pathname.startsWith("/admin") ||
    pathname === "/volunteer/dashboard" ||
    pathname === "/volunteer/attendance" ||
    pathname === "/volunteer/justifications" ||
    pathname === "/volunteer/evaluations" ||
    pathname === "/volunteer/leaves";

  if (isPortal) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <ScrollMotion />
      {children}
      <Footer />
    </>
  );
}
