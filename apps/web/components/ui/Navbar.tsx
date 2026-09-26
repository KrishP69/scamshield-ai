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
    { label: "Product", href: "/product" },
    { label: "Modules", href: "/modules" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Research", href: "/research" },
    { label: "Learn", href: "/learn" },
    { label: "Safety", href: "/safety" },
    { label: "Docs", href: "/docs" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink/10 dark:border-paper/10 bg-paper/90 dark:bg-ink-800/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-ink dark:text-paper group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-md"
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
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-ink/75 dark:text-paper/75 hover:text-ink dark:hover:text-paper hover:bg-paper-200 dark:hover:bg-ink-700 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/scan">
              <Button size="sm" className="gap-1.5 font-medium">
                <span>Check a Message</span>
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
              className="block px-3 py-2 rounded-md text-sm font-medium text-ink/80 dark:text-paper/80 hover:bg-paper-200 dark:hover:bg-ink-700"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-ink/10 dark:border-paper/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink/60 dark:text-paper/60">Language</span>
              <LanguageSwitcher />
            </div>
            <Link href="/scan" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center gap-2">
                <span>Check a Message</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
