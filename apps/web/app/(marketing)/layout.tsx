import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SkipLink } from "@/components/ui/SkipLink";
import { ScrollAnimatedBackground } from "@/components/ui/ScrollAnimatedBackground";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col text-ink dark:text-paper antialiased transition-colors">
      {/* Master Scroll-Driven Animated Background Layer with Looping Telemetry */}
      <ScrollAnimatedBackground />

      <SkipLink />
      <Navbar />
      <main id="main-content" className="relative z-10 flex-1 focus:outline-none" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
