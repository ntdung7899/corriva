const steps = [
    {
        num: "01",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
        ),
        title: "Add your assets",
        desc: "Connect your brokerage or manually add stocks, ETFs, crypto, and bonds to your portfolio.",
    },
    {
        num: "02",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M4 10h16" /><path d="M10 4v16" />
            </svg>
        ),
        title: "We calculate advanced risk metrics",
        desc: "Our AI analyzes correlations, volatility clustering, VaR, and tail risk using institutional-grade models.",
    },
    {
        num: "03",
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
            </svg>
        ),
        title: "Get AI-powered insights instantly",
        desc: "Receive clear, actionable explanations of your risk exposure and personalized optimization suggestions.",
    },
];

export default function HowItWorksSection() {
    return (
        <section id="how-it-works" className="relative py-24 lg:py-32">
            <div className="relative max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[rgba(56,189,248,0.15)] text-xs font-medium text-[var(--accent)] mb-4">
                        How It Works
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--fg-primary)]">
                        Three steps to{" "}
                        <span className="bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] bg-clip-text text-transparent">
                            full clarity.
                        </span>
                    </h2>
                </div>

                <div className="relative grid md:grid-cols-3 gap-8 lg:gap-12">
                    {/* Connector line — hidden on mobile */}
                    <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />

                    {steps.map((s, i) => (
                        <div key={i} className="relative flex flex-col items-center text-center">
                            {/* Step circle */}
                            <div className="relative mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center shadow-lg relative z-10">
                                    {s.icon}
                                </div>
                                {/* Number badge */}
                                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#0ea5e9] flex items-center justify-center z-20">
                                    <span className="text-[10px] font-bold text-white">{s.num}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-[var(--fg-primary)] mb-2">{s.title}</h3>
                            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed max-w-xs">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
