const problems = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--risk-high)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        title: "Hidden correlation risk",
        desc: "Assets that seem diversified often move together during crises, amplifying losses when it matters most.",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
        ),
        title: "Overexposure to volatile assets",
        desc: "Without proper analysis, portfolios silently concentrate risk in sectors or assets that swing wildly.",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--risk-medium)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        title: "No stress testing for market crashes",
        desc: "Most tools only look backward. You deserve to see how your portfolio would survive a real downturn.",
    },
];

export default function ProblemSection() {
    return (
        <section className="relative py-24 lg:py-32">
            {/* Subtle red glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(248,113,113,0.04)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--risk-high-soft)] border border-[rgba(248,113,113,0.15)] text-xs font-medium text-[var(--risk-high)] mb-4">
                        The Problem
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--fg-primary)] max-w-2xl mx-auto">
                        Most investors track returns.{" "}
                        <span className="text-[var(--fg-muted)]">Few measure real risk.</span>
                    </h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                    {problems.map((p, i) => (
                        <div
                            key={i}
                            className="group relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-8
                hover:border-[var(--risk-high)]/20 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[var(--risk-high-soft)] flex items-center justify-center mb-5">
                                {p.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--fg-primary)] mb-2">{p.title}</h3>
                            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
