"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const allocationData = [
    { name: "US Equities", value: 35, color: "#38bdf8" },
    { name: "Int'l Equities", value: 20, color: "#6366f1" },
    { name: "Fixed Income", value: 25, color: "#34d399" },
    { name: "Real Estate", value: 10, color: "#fbbf24" },
    { name: "Commodities", value: 5, color: "#fb923c" },
    { name: "Cash", value: 5, color: "#64748b" },
];

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.[0]) return null;
    const d = payload[0];
    return (
        <div
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                boxShadow: "var(--shadow-lg)",
                fontSize: 13,
            }}
        >
            <span style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</span>
            <span style={{ color: "var(--fg-secondary)", marginLeft: 8 }}>
                {d.value}%
            </span>
        </div>
    );
}

export default function AllocationChart() {
    return (
        <div className="card" style={{ padding: "24px" }}>
            <h3
                style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--fg-primary)",
                    margin: 0,
                    marginBottom: 4,
                }}
            >
                Asset Allocation
            </h3>
            <p
                style={{
                    fontSize: 12,
                    color: "var(--fg-muted)",
                    margin: 0,
                    marginBottom: 20,
                }}
            >
                Current portfolio distribution
            </p>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                }}
            >
                <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                        <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {allocationData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {allocationData.map((item) => (
                        <div
                            key={item.name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: 13,
                            }}
                        >
                            <div
                                style={{ display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: item.color,
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{ color: "var(--fg-secondary)" }}>
                                    {item.name}
                                </span>
                            </div>
                            <span
                                style={{
                                    fontWeight: 600,
                                    color: "var(--fg-primary)",
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
