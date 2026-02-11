export default function FinalCTASection() {
    return (
        <section id="cta" className="relative py-24 lg:py-32">
            {/* Radial glow background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.08)_0%,transparent_70%)]" />
            </div>

            <div className="relative max-w-3xl mx-auto px-6 text-center">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--fg-primary)] mb-6">
                    Stop guessing.{" "}
                    <span className="bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] bg-clip-text text-transparent">
                        Start measuring risk.
                    </span>
                </h2>

                <p className="text-lg text-[var(--fg-secondary)] leading-relaxed mb-10 max-w-lg mx-auto">
                    Join the waitlist and be the first to experience institutional-grade risk intelligence — built for everyday investors.
                </p>

                {/* Email input + CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto mb-8">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full sm:flex-1 px-5 py-3.5 rounded-full text-sm
              bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--fg-primary)]
              placeholder:text-[var(--fg-dim)] outline-none
              focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30
              transition-all"
                    />
                    <button
                        className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold
              bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] text-white
              hover:shadow-[0_0_40px_rgba(56,189,248,0.3)] hover:-translate-y-0.5
              transition-all duration-300 cursor-pointer"
                    >
                        Get Early Access
                    </button>
                </div>

                <p className="text-xs text-[var(--fg-dim)]">
                    Free to join. No credit card required. Cancel anytime.
                </p>
            </div>
        </section>
    );
}
