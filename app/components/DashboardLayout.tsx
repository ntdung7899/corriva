"use client";

import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}

export default function DashboardLayout({
    children,
    title,
    subtitle,
}: DashboardLayoutProps) {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div
                style={{
                    flex: 1,
                    marginLeft: "var(--sidebar-w)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <TopNav title={title} subtitle={subtitle} />
                <main
                    style={{
                        flex: 1,
                        padding: 32,
                        overflowY: "auto",
                    }}
                    className="animate-fade-in"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
