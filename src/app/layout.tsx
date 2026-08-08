import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tori School | Volunteer-led learning support in Dhaka",
  description: "Volunteer-led academic and life-skills support for children in Dhaka, started by University of Dhaka students.",
  openGraph: {
    title: "Tori School | Volunteer-led learning support in Dhaka",
    description: "Volunteer-led academic and life-skills support for children in Dhaka, started by University of Dhaka students.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream font-sans text-ink">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
