"use client";

import DashboardLayout from "../components/DashboardLayout";
import {
    User,
    Shield,
    Bell,
    Palette,
    Globe,
    Key,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { useState } from "react";

interface SettingToggleProps {
    label: string;
    description: string;
    defaultOn?: boolean;
}

function SettingToggle({ label, description, defaultOn = false }: SettingToggleProps) {
    const [on, setOn] = useState(defaultOn);
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid var(--border)",
            }}
        >
            <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-primary)" }}>
                    {label}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                    {description}
                </div>
            </div>
            <button
                onClick={() => setOn(!on)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: on ? "var(--accent)" : "var(--fg-dim)",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                }}
            >
                {on ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
        </div>
    );
}

const sections = [
    {
        icon: User,
        title: "Profile",
        description: "Manage your account details and preferences",
    },
    {
        icon: Shield,
        title: "Security",
        description: "Two-factor authentication and login settings",
    },
    {
        icon: Key,
        title: "API Keys",
        description: "Manage API access for integrations",
    },
    {
        icon: Globe,
        title: "Data Sources",
        description: "Configure market data providers",
    },
];

export default function SettingsPage() {
    return (
        <DashboardLayout title="Settings" subtitle="Configure your preferences">
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                }}
            >
                {/* Quick links */}
                <div className="card" style={{ padding: 24 }}>
                    <h3
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--fg-primary)",
                            margin: 0,
                            marginBottom: 16,
                        }}
                    >
                        Account Settings
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {sections.map((s) => {
                            const Icon = s.icon;
                            return (
                                <button
                                    key={s.title}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "12px 14px",
                                        background: "transparent",
                                        border: "none",
                                        borderRadius: "var(--radius-md)",
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left",
                                        transition: "background 0.15s",
                                        color: "var(--fg-primary)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = "var(--bg-hover)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "transparent")
                                    }
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "var(--radius-md)",
                                            background: "var(--bg-elevated)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={16} color="var(--fg-secondary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                                            {s.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "var(--fg-muted)",
                                                marginTop: 1,
                                            }}
                                        >
                                            {s.description}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} color="var(--fg-dim)" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notification & Display preferences */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <Bell size={16} color="var(--fg-secondary)" />
                            <h3
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: "var(--fg-primary)",
                                    margin: 0,
                                }}
                            >
                                Notifications
                            </h3>
                        </div>
                        <SettingToggle
                            label="Risk Threshold Alerts"
                            description="Get notified when risk scores exceed defined thresholds"
                            defaultOn
                        />
                        <SettingToggle
                            label="Daily Portfolio Summary"
                            description="Receive a daily email summary of portfolio performance"
                            defaultOn
                        />
                        <SettingToggle
                            label="Rebalancing Recommendations"
                            description="AI-generated rebalancing suggestions"
                            defaultOn={false}
                        />
                        <SettingToggle
                            label="Market Event Alerts"
                            description="Major market movement notifications"
                            defaultOn
                        />
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <Palette size={16} color="var(--fg-secondary)" />
                            <h3
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: "var(--fg-primary)",
                                    margin: 0,
                                }}
                            >
                                Display
                            </h3>
                        </div>
                        <SettingToggle
                            label="Dark Mode"
                            description="Use dark color scheme throughout the application"
                            defaultOn
                        />
                        <SettingToggle
                            label="Compact View"
                            description="Reduce card padding for higher information density"
                            defaultOn={false}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
