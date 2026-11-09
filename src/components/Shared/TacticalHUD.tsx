import React from "react";

export interface TacticalHUDProps {
  title: string;
  category: string;
  dateStr?: string;
  coordsStr?: string;
  statLabel?: string;
  statValue?: string;
  statTrend?: string;
  accentColor?: string; // Crimson #DC2626, Cobalt #2563EB, Amber #D97706
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  title,
  category,
  dateStr = "2025 – 2026",
  coordsStr = "26.56° N, 56.25° E",
  statLabel,
  statValue,
  statTrend,
  accentColor = "#2563EB",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 40,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      }}
    >
      {/* Corner Technical Alignment Brackets */}
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 1920 1080"
      >
        <path d="M 40,65 L 40,40 L 65,40" fill="none" stroke="#94A3B8" strokeWidth="2" />
        <path d="M 1855,40 L 1880,40 L 1880,65" fill="none" stroke="#94A3B8" strokeWidth="2" />
        <path d="M 40,1015 L 40,1040 L 65,1040" fill="none" stroke="#94A3B8" strokeWidth="2" />
        <path d="M 1855,1040 L 1880,1040 L 1880,1015" fill="none" stroke="#94A3B8" strokeWidth="2" />
      </svg>

      {/* Top Left Header Badge */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 68,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#FFFFFF",
            border: `1.5px solid ${accentColor}`,
            padding: "4px 12px",
            borderRadius: 4,
            width: "fit-content",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: accentColor,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", letterSpacing: "0.1em" }}>
            {category.toUpperCase()}
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            marginTop: 4,
            fontSize: 26,
            fontWeight: 800,
            color: "#0F172A",
            fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>

        <div style={{ fontSize: 13, color: "#64748B", letterSpacing: "0.05em" }}>
          DATE: <span style={{ color: "#0F172A", fontWeight: 600 }}>{dateStr}</span> | COORD:{" "}
          <span style={{ color: "#0F172A", fontWeight: 600 }}>{coordsStr}</span>
        </div>
      </div>

      {/* Top Right Live Telemetry Metric Ticker */}
      {statValue && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 68,
            backgroundColor: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderRadius: 8,
            padding: "12px 20px",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
            textAlign: "right",
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: "0.1em" }}>
            {statLabel?.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "-0.02em",
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 2,
            }}
          >
            {statValue}
          </div>
          {statTrend && (
            <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, marginTop: 2 }}>
              {statTrend}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
