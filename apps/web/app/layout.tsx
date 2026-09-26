import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ScamShield AI — Know If It's A Scam Before You Reply",
  description:
    "Multi-layered AI threat detection and explainable risk-scoring for Facebook and Telegram. Check messages, screenshots, links, profiles, crypto wallets, and APKs.",
  keywords: [
    "Scam detection",
    "AI scam shield",
    "Facebook marketplace scam",
    "Telegram crypto fraud",
    "Explainable risk score",
    "Trust Passport",
  ],
  authors: [{ name: "Shrushti Dayma & Chanchal Jadhav" }],
  openGraph: {
    title: "ScamShield AI — Explainable Threat Intelligence",
    description: "Scan suspicious messages, links, and files. Uncover why it's risky with our 3D Trust Passport.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-paper text-ink dark:bg-[#090D1F] dark:text-paper selection:bg-ultramarine selection:text-white">
        {children}
      </body>
    </html>
  );
}
