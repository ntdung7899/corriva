"use client";

interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    sublabel?: string;
}

export default function CircularProgress({
    value,
    max = 100,
    size = 160,
    strokeWidth = 10,
    label,
    sublabel,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const offset = circumference * (1 - progress);

    // Color based on risk level
    const getColor = () => {
        if (value <= 30) return "var(--risk-low)";
        if (value <= 60) return "var(--risk-medium)";
        return "var(--risk-high)";
    };

    const color = getColor();

    return (
        <div
            style={{
                position: "relative",
                width: size,
                height: size,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                {/* Background track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--bg-hover)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress arc */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: "stroke-dashoffset 1s ease-out, stroke 0.3s ease",
                        filter: `drop-shadow(0 0 6px ${color}40)`,
                    }}
                />
            </svg>
            {/* Center label */}
            <div
                style={{
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <span
                    style={{
                        fontSize: size * 0.22,
                        fontWeight: 800,
                        color,
                        letterSpacing: "-0.02em",
                        lineHeight: 1,
                    }}
                >
                    {value}
                </span>
                {label && (
                    <span
                        style={{
                            fontSize: 11,
                            color: "var(--fg-muted)",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}
                    >
                        {label}
                    </span>
                )}
                {sublabel && (
                    <span style={{ fontSize: 10, color: "var(--fg-dim)" }}>
                        {sublabel}
                    </span>
                )}
            </div>
        </div>
    );
}
