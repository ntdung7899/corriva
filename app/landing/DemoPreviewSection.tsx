export default function DemoPreviewSection() {
    return (
        <section id="demo" className="relative py-24 lg:py-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(56,189,248,0.06)_0%,transparent_70%)]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[rgba(56,189,248,0.15)] text-xs font-medium text-[var(--accent)] mb-4">
                        Live Preview
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--fg-primary)] max-w-2xl mx-auto">
                        Your risk dashboard,{" "}
                        <span className="bg-gradient-to-r from-[var(--accent)] to-[#0ea5e9] bg-clip-text text-transparent">
                            reimagined.
                        </span>
                    </h2>
                </div>

                {/* Dashboard mockup */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute -inset-6 bg-[radial-gradient(ellipse,rgba(56,189,248,0.08)_0%,transparent_60%)] blur-3xl" />

                    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ef4444]/60" />
                                <div className="w-3 h-3 rounded-full bg-[#eab308]/60" />
                                <div className="w-3 h-3 rounded-full bg-[#22c55e]/60" />
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="h-7 rounded-lg bg-[var(--bg-base)] flex items-center px-3">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--fg-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <span className="text-xs text-[var(--fg-dim)]">app.corriva.io/dashboard/overview</span>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard grid */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Left column – Risk Score + Allocation */}
                            <div className="md:col-span-4 space-y-4">
                                {/* Risk Score Card */}
                                <div className="bg-[var(--bg-elevated)] rounded-xl p-6">
                                    <h3 className="text-xs text-[var(--fg-muted)] uppercase tracking-wider mb-4">Overall Risk Score</h3>
                                    <div className="flex justify-center">
                                        <div className="relative w-32 h-32">
                                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-base)" strokeWidth="10" />
                                                {/* Background track */}
                                                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
                                                {/* Score arc */}
                                                <circle
                                                    cx="60" cy="60" r="50" fill="none"
                                                    stroke="var(--risk-medium)"
                                                    strokeWidth="10"
                                                    strokeDasharray={`${0.62 * 314} ${314}`}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-[var(--risk-medium)]">62</span>
                                                <span className="text-[10px] text-[var(--fg-muted)]">/ 100</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--risk-medium-soft)] text-xs font-medium text-[var(--risk-medium)]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-medium)]" />
                                            Moderate Risk
                                        </span>
                                    </div>
                                </div>

                                {/* Allocation Chart */}
                                <div className="bg-[var(--bg-elevated)] rounded-xl p-6">
                                    <h3 className="text-xs text-[var(--fg-muted)] uppercase tracking-wider mb-4">Asset Allocation</h3>
                                    <div className="flex justify-center mb-4">
                                        <div className="relative w-28 h-28">
                                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                <circle cx="50" cy="50" r="40" fill="none" stroke="#38bdf8" strokeWidth="12"
                                                    strokeDasharray={`${0.40 * 251} ${251}`} />
                                                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12"
                                                    strokeDasharray={`${0.25 * 251} ${251}`} strokeDashoffset={`${-0.40 * 251}`} />
                                                <circle cx="50" cy="50" r="40" fill="none" stroke="#34d399" strokeWidth="12"
                                                    strokeDasharray={`${0.20 * 251} ${251}`} strokeDashoffset={`${-0.65 * 251}`} />
                                                <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" strokeWidth="12"
                                                    strokeDasharray={`${0.15 * 251} ${251}`} strokeDashoffset={`${-0.85 * 251}`} />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { label: "Equities", pct: "40%", color: "#38bdf8" },
                                            { label: "Bonds", pct: "25%", color: "#8b5cf6" },
                                            { label: "Crypto", pct: "20%", color: "#34d399" },
                                            { label: "Cash", pct: "15%", color: "#fbbf24" },
                                        ].map((a) => (
                                            <div key={a.label} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />
                                                    <span className="text-[var(--fg-secondary)]">{a.label}</span>
                                                </div>
                                                <span className="font-medium text-[var(--fg-primary)]">{a.pct}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right column – Performance + AI Insight */}
                            <div className="md:col-span-8 space-y-4">
                                {/* Metrics row */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: "Portfolio Value", value: "$128,450", change: "+2.4%", positive: true },
                                        { label: "VaR (95%)", value: "-$4,280", change: "", positive: false },
                                        { label: "Sharpe Ratio", value: "1.42", change: "+0.08", positive: true },
                                        { label: "Max Drawdown", value: "-12.3%", change: "", positive: false },
                                    ].map((m) => (
                                        <div key={m.label} className="bg-[var(--bg-elevated)] rounded-xl p-4">
                                            <span className="text-[10px] text-[var(--fg-muted)] uppercase tracking-wider">{m.label}</span>
                                            <p className={`text-lg font-semibold mt-1 ${m.positive ? "text-[var(--fg-primary)]" : "text-[var(--risk-high)]"}`}>
                                                {m.value}
                                            </p>
                                            {m.change && (
                                                <span className={`text-[10px] ${m.positive ? "text-[var(--risk-low)]" : "text-[var(--risk-high)]"}`}>
                                                    {m.change}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Performance Chart */}
                                <div className="bg-[var(--bg-elevated)] rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs text-[var(--fg-muted)] uppercase tracking-wider">Portfolio Performance</h3>
                                        <div className="flex gap-1">
                                            {["1W", "1M", "3M", "1Y"].map((t, i) => (
                                                <button key={t} className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${i === 1
                                                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                                                        : "text-[var(--fg-muted)] hover:text-[var(--fg-secondary)]"
                                                    }`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <svg viewBox="0 0 600 120" className="w-full h-28">
                                        <defs>
                                            <linearGradient id="demoChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        {/* Grid lines */}
                                        {[0, 30, 60, 90, 120].map((y) => (
                                            <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="var(--border)" strokeWidth="0.5" />
                                        ))}
                                        <path
                                            d="M0,90 C30,88 50,85 80,70 S120,65 150,55 S200,50 230,60 S270,55 310,40 S350,38 380,35 S420,30 460,25 S500,22 540,20 S570,18 600,15"
                                            fill="none" stroke="var(--accent)" strokeWidth="2.5"
                                        />
                                        <path
                                            d="M0,90 C30,88 50,85 80,70 S120,65 150,55 S200,50 230,60 S270,55 310,40 S350,38 380,35 S420,30 460,25 S500,22 540,20 S570,18 600,15 L600,120 L0,120Z"
                                            fill="url(#demoChartGrad)"
                                        />
                                        {/* Point */}
                                        <circle cx="600" cy="15" r="4" fill="var(--accent)" />
                                        <circle cx="600" cy="15" r="8" fill="var(--accent)" opacity="0.2" />
                                    </svg>
                                </div>

                                {/* AI Insight Block */}
                                <div className="bg-[var(--bg-elevated)] rounded-xl p-6 border border-[rgba(56,189,248,0.1)]">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0 mt-0.5">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-[var(--accent)] mb-1">AI Risk Analysis</h4>
                                            <p className="text-sm text-[var(--fg-secondary)] leading-relaxed">
                                                Your portfolio shows <span className="text-[var(--risk-medium)] font-medium">moderate risk</span> with a score of 62/100.
                                                Crypto allocation (20%) introduces significant volatility. Consider shifting 5-10% into bonds to reduce
                                                correlation-driven drawdowns.{" "}
                                                <span className="text-[var(--risk-high)] font-medium">Stress test shows -18.7% in a 2020-style crash scenario.</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
