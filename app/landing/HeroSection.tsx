export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
            {/* Background radial glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.08)_0%,transparent_70%)]" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(14,165,233,0.05)_0%,transparent_70%)]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-20">
                {/* Left – Copy */}
                <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[rgba(56,189,248,0.15)] mb-6">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                        <span className="text-xs font-medium text-[var(--accent)]">
                            AI-Powered Risk Intelligence
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-[var(--fg-primary)] mb-6">
                        Understand Your Portfolio Risk{" "}
                        <span className="bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] bg-clip-text text-transparent">
                            Before It&apos;s Too Late.
                        </span>
                    </h1>

                    <p className="text-lg text-[var(--fg-secondary)] leading-relaxed mb-8 max-w-md">
                        AI-powered risk analysis and stress testing for modern investors.
                        Go beyond returns — understand what&apos;s really at stake.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <a
                            href="#cta"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold
                bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] text-white
                hover:shadow-[0_0_32px_rgba(56,189,248,0.35)] transition-all duration-300
                hover:-translate-y-0.5"
                        >
                            Get Early Access
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                            </svg>
                        </a>
                        <a
                            href="#demo"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold
                border border-[var(--border-strong)] text-[var(--fg-secondary)]
                hover:border-[var(--accent)] hover:text-[var(--fg-primary)] transition-all duration-300"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            View Demo
                        </a>
                    </div>

                    {/* Social proof */}
                    <div className="mt-10 flex items-center gap-6 text-sm text-[var(--fg-muted)]">
                        <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Bank-grade security
                        </div>
                        <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            Real-time analysis
                        </div>
                    </div>
                </div>

                {/* Right – Dashboard Mockup */}
                <div className="relative hidden lg:block">
                    <div className="relative">
                        {/* Glow behind card */}
                        <div className="absolute -inset-8 bg-[radial-gradient(ellipse,rgba(56,189,248,0.1)_0%,transparent_70%)] blur-2xl" />

                        {/* Main dashboard card */}
                        <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
                                    <div className="w-3 h-3 rounded-full bg-[#eab308]/60" />
                                    <div className="w-3 h-3 rounded-full bg-[#22c55e]/60" />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="h-6 rounded-md bg-[var(--bg-base)] flex items-center px-3">
                                        <span className="text-[10px] text-[var(--fg-dim)]">app.corriva.io/dashboard</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard content */}
                            <div className="p-5 grid grid-cols-3 gap-3">
                                {/* Risk Score */}
                                <div className="col-span-1 bg-[var(--bg-elevated)] rounded-xl p-4 flex flex-col items-center justify-center">
                                    <div className="relative w-20 h-20">
                                        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-base)" strokeWidth="8" />
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--risk-medium)" strokeWidth="8"
                                                strokeDasharray={`${0.62 * 264} ${264}`} strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-bold text-[var(--risk-medium)]">62</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-[var(--fg-muted)] mt-2">Risk Score</span>
                                </div>

                                {/* Metrics */}
                                <div className="col-span-2 grid grid-rows-2 gap-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-[var(--bg-elevated)] rounded-xl p-3">
                                            <span className="text-[9px] text-[var(--fg-muted)] uppercase tracking-wider">VaR (95%)</span>
                                            <p className="text-base font-semibold text-[var(--risk-high)] mt-1">-$4,280</p>
                                        </div>
                                        <div className="bg-[var(--bg-elevated)] rounded-xl p-3">
                                            <span className="text-[9px] text-[var(--fg-muted)] uppercase tracking-wider">Sharpe Ratio</span>
                                            <p className="text-base font-semibold text-[var(--risk-low)] mt-1">1.42</p>
                                        </div>
                                    </div>
                                    <div className="bg-[var(--bg-elevated)] rounded-xl p-3">
                                        <span className="text-[9px] text-[var(--fg-muted)] uppercase tracking-wider">Portfolio Value</span>
                                        <p className="text-base font-semibold text-[var(--fg-primary)] mt-1">$128,450.00</p>
                                        <span className="text-[9px] text-[var(--risk-low)]">+2.4% today</span>
                                    </div>
                                </div>

                                {/* Chart area */}
                                <div className="col-span-3 bg-[var(--bg-elevated)] rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">Performance</span>
                                        <span className="text-[10px] text-[var(--accent)]">30D</span>
                                    </div>
                                    <svg viewBox="0 0 400 80" className="w-full h-16">
                                        <defs>
                                            <linearGradient id="heroChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,60 Q30,55 60,50 T120,35 T180,40 T240,25 T300,30 T360,15 L400,20 L400,80 L0,80Z" fill="url(#heroChartGrad)" />
                                        <path d="M0,60 Q30,55 60,50 T120,35 T180,40 T240,25 T300,30 T360,15 L400,20" fill="none" stroke="var(--accent)" strokeWidth="2" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <div className="absolute -bottom-4 -left-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-3 shadow-lg animate-float">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[var(--risk-low-soft)] flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--risk-low)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[var(--fg-muted)]">AI Insight</p>
                                    <p className="text-xs font-medium text-[var(--risk-low)]">Risk Optimized ✓</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
