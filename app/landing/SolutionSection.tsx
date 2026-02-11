const features = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 12 12 2" /><path d="M12 12l7-7" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        ),
        title: "AI Risk Score",
        desc: "A single, intelligent score from 0–100 that captures your portfolio's total risk exposure — updated in real time.",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <path d="M10 6.5h4" /><path d="M6.5 10v4" /><path d="M17.5 10v4" /><path d="M10 17.5h4" />
            </svg>
        ),
        title: "Correlation Analysis",
        desc: "Visualize how your assets move together. Identify hidden dependencies before they become costly surprises.",
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
        title: "Stress Test Simulation",
        desc: "Run your portfolio through historical crashes and custom scenarios. Know your downside before the market decides for you.",
    },
];

export default function SolutionSection() {
    return (
        <section id="features" className="relative py-24 lg:py-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[rgba(56,189,248,0.15)] text-xs font-medium text-[var(--accent)] mb-4">
                        The Solution
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--fg-primary)] max-w-2xl mx-auto">
                        One dashboard.{" "}
                        <span className="bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] bg-clip-text text-transparent">
                            Full risk visibility.
                        </span>
                    </h2>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="group relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 lg:p-8
                hover:border-[rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.06)] transition-all duration-300"
                        >
                            {/* Glow on hover */}
                            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.04)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center mb-5">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--fg-primary)] mb-2">{f.title}</h3>
                                <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
