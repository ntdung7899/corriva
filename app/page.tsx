"use client";

import DashboardLayout from "./components/DashboardLayout";
import CircularProgress from "./components/CircularProgress";
import MetricCard from "./components/MetricCard";
import PerformanceChart from "./components/PerformanceChart";
import AllocationChart from "./components/AllocationChart";
import {
  DollarSign,
  Activity,
  GitBranch,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

export default function OverviewPage() {
  return (
    <DashboardLayout
      title="Overview"
      subtitle="Last updated: Feb 11, 2026 · 09:41 AM EST"
    >
      {/* ── Top Cards Grid ───────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Risk Score Card */}
        <div
          className="card-glow"
          style={{
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gridRow: "1 / 3",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--fg-secondary)",
              marginBottom: 20,
              alignSelf: "flex-start",
            }}
          >
            Overall Risk Score
          </div>
          <CircularProgress
            value={42}
            label="/ 100"
            sublabel="Moderate"
            size={170}
            strokeWidth={12}
          />
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
              width: "100%",
            }}
          >
            {[
              { label: "VaR 95%", value: "-3.2%", color: "var(--risk-high)" },
              { label: "Sharpe", value: "1.45", color: "var(--accent)" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: "var(--bg-elevated)",
                  borderRadius: "var(--radius-md)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--fg-muted)",
                    marginBottom: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <MetricCard
          icon={DollarSign}
          title="Portfolio Value"
          value="$1,284,520"
          change="12.4% (12mo)"
          changeType="positive"
          accentColor="var(--accent)"
        />
        <MetricCard
          icon={Activity}
          title="Volatility (Ann.)"
          value="14.8%"
          change="2.1% from last month"
          changeType="negative"
          accentColor="var(--warning)"
        />
        <MetricCard
          icon={GitBranch}
          title="Correlation Conc."
          value="0.67"
          change="Moderate clustering"
          changeType="neutral"
          accentColor="#6366f1"
        />

        {/* AI Explanation block — spans 3 columns, second row */}
        <div
          className="card"
          style={{
            gridColumn: "2 / 5",
            padding: "20px 24px",
            display: "flex",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-md)",
              background: "var(--accent-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <BrainCircuit
              size={18}
              color="var(--accent)"
              strokeWidth={2}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--fg-primary)",
                }}
              >
                AI Risk Analysis
              </span>
              <span className="badge badge-accent">Live</span>
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.65,
                color: "var(--fg-secondary)",
                margin: 0,
              }}
            >
              Your portfolio risk is currently <strong style={{ color: "var(--risk-medium)" }}>moderate</strong>.
              The primary risk driver is a{" "}
              <strong style={{ color: "var(--fg-primary)" }}>high correlation concentration (0.67)</strong>{" "}
              between US and International equities, which reduces diversification
              benefits during market downturns. Annualized volatility increased 2.1%
              month-over-month, primarily driven by recent tech sector earnings
              uncertainty. Consider increasing fixed income allocation by 3-5% to
              improve risk-adjusted returns. The current Sharpe ratio of 1.45 suggests
              favorable risk-reward, but sector-level VaR indicates elevated tail risk
              in the technology sub-portfolio.
            </p>
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
        }}
      >
        <PerformanceChart />
        <AllocationChart />
      </div>
    </DashboardLayout>
  );
}
