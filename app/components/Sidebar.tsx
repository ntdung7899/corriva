"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    FileBarChart,
    FlaskConical,
    Bell,
    Settings,
    ShieldCheck,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";

const navItems = [
    { key: "nav.overview", href: "/dashboard", icon: LayoutDashboard },
    { key: "nav.portfolio", href: "/dashboard/portfolio", icon: Briefcase },
    { key: "nav.riskReport", href: "/dashboard/risk-report", icon: FileBarChart },
    { key: "nav.stressTest", href: "/dashboard/stress-test", icon: FlaskConical },
    { key: "nav.alerts", href: "/dashboard/alerts", icon: Bell },
    { key: "nav.settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { t } = useTranslation();

    return (
        <aside
            style={{
                width: "var(--sidebar-w)",
                minHeight: "100vh",
                background: "var(--bg-surface)",
                borderRight: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 40,
            }}
        >
            {/* Brand */}
            <div
                style={{
                    height: "var(--topbar-h)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "0 24px",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: "var(--radius-md)",
                        background: "linear-gradient(135deg, var(--accent), #6366f1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ShieldCheck size={18} color="#fff" strokeWidth={2.2} />
                </div>
                <span
                    style={{
                        fontWeight: 700,
                        fontSize: 18,
                        letterSpacing: "-0.02em",
                        color: "var(--fg-primary)",
                    }}
                >
                    Corriva
                </span>
            </div>

            {/* Nav */}
            <nav
                style={{
                    flex: 1,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 14px",
                                borderRadius: "var(--radius-md)",
                                fontSize: 14,
                                fontWeight: active ? 600 : 400,
                                color: active ? "var(--accent)" : "var(--fg-secondary)",
                                background: active ? "var(--accent-soft)" : "transparent",
                                textDecoration: "none",
                                transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = "var(--bg-hover)";
                                    e.currentTarget.style.color = "var(--fg-primary)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "var(--fg-secondary)";
                                }
                            }}
                        >
                            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                            {t(item.key)}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div
                style={{
                    padding: "16px 20px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-full)",
                        background: "linear-gradient(135deg, #6366f1, var(--accent))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#fff",
                    }}
                >
                    JD
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--fg-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        John Doe
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                        {t("nav.portfolioManager")}
                    </div>
                </div>
            </div>
        </aside>
    );
}
