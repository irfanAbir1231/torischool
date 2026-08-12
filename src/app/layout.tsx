import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollMotion } from "@/components/motion/ScrollMotion";

import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteTitle = "Tori School | Volunteer-led learning support in Dhaka";
const siteDescription = "Volunteer-led academic and life-skills support for children in Dhaka, started by University of Dhaka students.";
const siteUrl = "https://www.torischool.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Tori School",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: "Tori School",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tori School — volunteer-led learning support for children in Dhaka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream font-sans text-ink">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Header />
        <ScrollMotion />
        {children}
        <Footer />
      </body>
    </html>
  );
}
