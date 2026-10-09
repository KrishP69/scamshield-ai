"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Button } from "./Button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "24x7 Radar", href: "/radar", badge: "LIVE" },
    { label: "Modules", href: "/modules" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Docs", href: "/docs" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 dark:border-paper/10 bg-paper/95 dark:bg-ink-800/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 flex-nowrap">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-ink dark:text-paper group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-md mr-4"
          >
            <div className="w-9 h-9 rounded-lg bg-ultramarine text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight tracking-tight">
                ScamShield AI
              </span>
              <span className="text-[10px] text-ink/60 dark:text-paper/60 leading-none">
                Explainable Threat Defense
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 flex-nowrap" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink/75 dark:text-paper/75 hover:text-ink dark:hover:text-paper hover:bg-paper-200 dark:hover:bg-ink-700 rounded-lg transition-colors whitespace-nowrap"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      link.badge === "LIVE"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/scan">
              <Button size="sm" className="gap-1.5 font-semibold shadow-sm hover:shadow-md transition-all">
                <span>Threat Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-1 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-ink/70 dark:text-paper/70 hover:text-ink dark:hover:text-paper rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-800 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-ink/80 dark:text-paper/80 hover:bg-paper-200 dark:hover:bg-ink-700"
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="pt-4 border-t border-ink/10 dark:border-paper/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink/60 dark:text-paper/60">Language</span>
              <LanguageSwitcher />
            </div>
            <Link href="/radar" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>24x7 Live Threat Radar</span>
              </Button>
            </Link>
            <Link href="/scan" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center gap-2">
                <span>Threat Scanner</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
