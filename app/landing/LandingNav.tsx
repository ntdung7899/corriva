"use client";

import { useState, useEffect } from "react";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[#0ea5e9] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-[var(--fg-primary)] tracking-tight">
            Corriva
          </span>
        </a>

        {/* Nav Links — hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Features", href: "#features" },
            { label: "Demo", href: "#demo" },
            { label: "How It Works", href: "#how-it-works" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#cta"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium
            bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] text-white
            hover:shadow-[0_0_24px_rgba(56,189,248,0.3)] transition-all duration-300"
        >
          Get Early Access
        </a>
      </div>
    </nav>
  );
}
