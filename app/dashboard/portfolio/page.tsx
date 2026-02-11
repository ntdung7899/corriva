"use client";

import DashboardLayout from "../../components/DashboardLayout";
import { Plus, ArrowUpDown } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

const assets = [
    {
        name: "Apple Inc.",
        ticker: "AAPL",
        allocation: 12.5,
        price: 242.31,
        volatility: 18.2,
        risk: "High" as const,
        change: 1.24,
    },
    {
        name: "Microsoft Corp.",
        ticker: "MSFT",
        allocation: 10.8,
        price: 458.72,
        volatility: 15.6,
        risk: "Low" as const,
        change: 0.87,
    },
    {
        name: "Vanguard Total Bond",
        ticker: "BND",
        allocation: 25.0,
        price: 72.45,
        volatility: 4.2,
        risk: "Low" as const,
        change: -0.12,
    },
    {
        name: "NVIDIA Corp.",
        ticker: "NVDA",
        allocation: 8.3,
        price: 892.14,
        volatility: 42.1,
        risk: "High" as const,
        change: 3.45,
    },
    {
        name: "iShares MSCI EAFE",
        ticker: "EFA",
        allocation: 11.2,
        price: 82.31,
        volatility: 12.8,
        risk: "Medium" as const,
        change: -0.34,
    },
    {
        name: "Prologis Inc.",
        ticker: "PLD",
        allocation: 5.0,
        price: 128.55,
        volatility: 19.4,
        risk: "Medium" as const,
        change: 0.56,
    },
    {
        name: "SPDR Gold Shares",
        ticker: "GLD",
        allocation: 5.0,
        price: 218.90,
        volatility: 14.1,
        risk: "Low" as const,
        change: 0.92,
    },
    {
        name: "Amazon.com Inc.",
        ticker: "AMZN",
        allocation: 9.2,
        price: 215.63,
        volatility: 22.7,
        risk: "Medium" as const,
        change: -1.15,
    },
    {
        name: "JPMorgan Chase",
        ticker: "JPM",
        allocation: 7.0,
        price: 248.90,
        volatility: 16.3,
        risk: "Medium" as const,
        change: 0.42,
    },
    {
        nameKey: "portfolio.cashEquivalents",
        ticker: "CASH",
        allocation: 6.0,
        price: 1.0,
        volatility: 0.0,
        risk: "Low" as const,
        change: 0.0,
    },
];

type RiskLevel = "High" | "Medium" | "Low";

export default function PortfolioPage() {
    const { t } = useTranslation();

    const riskTranslation: Record<RiskLevel, string> = {
        High: t("portfolio.riskHigh"),
        Medium: t("portfolio.riskMedium"),
        Low: t("portfolio.riskLow"),
    };

    const riskBadge = (level: RiskLevel) => {
        const cls =
            level === "Low"
                ? "badge-low"
                : level === "High"
                    ? "badge-high"
                    : "badge-medium";
        return <span className={`badge ${cls}`}>{riskTranslation[level]}</span>;
    };

    const tabs = [
        t("portfolio.allAssets"),
        t("portfolio.equities"),
        t("portfolio.fixedIncome"),
        t("portfolio.alternatives"),
    ];

    const headers = [
        t("portfolio.asset"),
        t("portfolio.allocation"),
        t("portfolio.currentPrice"),
        t("portfolio.change24h"),
        t("portfolio.volatility"),
        t("portfolio.riskLevel"),
    ];

    return (
        <DashboardLayout
            title={t("portfolio.title")}
            subtitle={t("portfolio.subtitle")}
        >
            {/* Header row */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                <div style={{ display: "flex", gap: 8 }}>
                    {tabs.map((tab, i) => (
                        <button
                            key={tab}
                            style={{
                                padding: "7px 16px",
                                borderRadius: "var(--radius-full)",
                                border: "1px solid var(--border)",
                                background:
                                    i === 0 ? "var(--accent-soft)" : "transparent",
                                color: i === 0 ? "var(--accent)" : "var(--fg-secondary)",
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 18px",
                        borderRadius: " var(--radius-md)",
                        border: "none",
                        background: "var(--accent)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: "0 0 16px rgba(56, 189, 248, 0.25)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                >
                    <Plus size={15} />
                    {t("portfolio.addAsset")}
                </button>
            </div>

            {/* Table */}
            <div
                className="card"
                style={{ overflow: "hidden" }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 13,
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                borderBottom: "1px solid var(--border)",
                                background: "var(--bg-elevated)",
                            }}
                        >
                            {headers.map((h) => (
                                <th
                                    key={h}
                                    style={{
                                        padding: "12px 16px",
                                        textAlign: "left",
                                        fontWeight: 500,
                                        color: "var(--fg-muted)",
                                        fontSize: 12,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.04em",
                                        whiteSpace: "nowrap",
                                        cursor: "pointer",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                        }}
                                    >
                                        {h}
                                        <ArrowUpDown size={11} color="var(--fg-dim)" />
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((a, i) => (
                            <tr
                                key={a.ticker}
                                style={{
                                    borderBottom:
                                        i < assets.length - 1
                                            ? "1px solid var(--border)"
                                            : "none",
                                    transition: "background 0.1s",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.background = "var(--bg-hover)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.background = "transparent")
                                }
                            >
                                {/* Asset */}
                                <td style={{ padding: "14px 16px" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "var(--radius-md)",
                                                background: "var(--bg-active)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: "var(--fg-secondary)",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {a.ticker.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    color: "var(--fg-primary)",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {"nameKey" in a ? t((a as { nameKey: string }).nameKey) : a.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "var(--fg-dim)",
                                                    marginTop: 1,
                                                }}
                                            >
                                                {a.ticker}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                {/* Allocation */}
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <div
                                            style={{
                                                flex: 1,
                                                height: 4,
                                                borderRadius: 2,
                                                background: "var(--bg-active)",
                                                maxWidth: 80,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: "100%",
                                                    width: `${(a.allocation / 30) * 100}%`,
                                                    borderRadius: 2,
                                                    background: "var(--accent)",
                                                    maxWidth: "100%",
                                                }}
                                            />
                                        </div>
                                        <span
                                            style={{
                                                fontWeight: 600,
                                                color: "var(--fg-primary)",
                                                fontVariantNumeric: "tabular-nums",
                                            }}
                                        >
                                            {a.allocation}%
                                        </span>
                                    </div>
                                </td>
                                {/* Price */}
                                <td
                                    style={{
                                        padding: "14px 16px",
                                        fontWeight: 600,
                                        color: "var(--fg-primary)",
                                        fontVariantNumeric: "tabular-nums",
                                    }}
                                >
                                    ${a.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                {/* Change */}
                                <td
                                    style={{
                                        padding: "14px 16px",
                                        fontWeight: 600,
                                        fontVariantNumeric: "tabular-nums",
                                        color:
                                            a.change > 0
                                                ? "var(--risk-low)"
                                                : a.change < 0
                                                    ? "var(--risk-high)"
                                                    : "var(--fg-dim)",
                                    }}
                                >
                                    {a.change > 0 ? "+" : ""}
                                    {a.change.toFixed(2)}%
                                </td>
                                {/* Volatility */}
                                <td
                                    style={{
                                        padding: "14px 16px",
                                        fontVariantNumeric: "tabular-nums",
                                        color: "var(--fg-secondary)",
                                    }}
                                >
                                    {a.volatility}%
                                </td>
                                {/* Risk */}
                                <td style={{ padding: "14px 16px" }}>{riskBadge(a.risk)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary bar */}
            <div
                style={{
                    display: "flex",
                    gap: 24,
                    justifyContent: "flex-end",
                    marginTop: 16,
                    fontSize: 12,
                    color: "var(--fg-muted)",
                }}
            >
                <span>
                    {t("portfolio.totalAssets")} <strong style={{ color: "var(--fg-primary)" }}>10</strong>
                </span>
                <span>
                    {t("portfolio.avgVolatility")}{" "}
                    <strong style={{ color: "var(--fg-primary)" }}>16.5%</strong>
                </span>
                <span>
                    {t("portfolio.portfolioBeta")}{" "}
                    <strong style={{ color: "var(--fg-primary)" }}>1.12</strong>
                </span>
            </div>
        </DashboardLayout>
    );
}
