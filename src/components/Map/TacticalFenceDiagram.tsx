import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const TacticalFenceDiagram: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const lightFlicker = 0.85 + Math.sin(frame * 0.25) * 0.12;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0A0A0A",
        overflow: "hidden",
        fontFamily: "monospace",
      }}
    >
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs>
          {/* Light cone gradient for floodlights */}
          <linearGradient id="lightCone" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD400" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#FFD400" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFD400" stopOpacity="0.0" />
          </linearGradient>

          {/* Grid pattern */}
          <pattern id="diagGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.08" />
          </pattern>
        </defs>

        <rect width="1920" height="1080" fill="#0A0A0A" />
        <rect width="1920" height="1080" fill="url(#diagGrid)" />

        {/* Blueprint HUD Header */}
        <g transform="translate(100, 80)" opacity={entrance}>
          <text x="0" y="0" fontSize="24" fontWeight="800" fill="#00FF88" letterSpacing="0.2em">
            TACTICAL BLUEPRINT // SEC_BORDER_FENCE_SPEC
          </text>
          <text x="0" y="28" fontSize="16" fill="#94A3B8" letterSpacing="0.1em">
            SPEC: DOUBLE CONCERTINA RAZOR WIRE + HIGH-PRESSURE SODIUM ARRAY (100M INTERVAL)
          </text>
        </g>

        {/* Ground Terrain Line */}
        <line x1="100" y1="760" x2="1820" y2="760" stroke="#334155" strokeWidth="3" />

        {/* Floodlight Cones casting downward */}
        {[350, 750, 1150, 1550].map((x, idx) => {
          const coneProgress = interpolate(frame - idx * 10, [0, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <g key={idx} opacity={coneProgress * lightFlicker}>
              {/* Light Cone beam */}
              <polygon
                points={`${x},280 ${x - 220},760 ${x + 220},760`}
                fill="url(#lightCone)"
              />

              {/* Steel Pylon Mast */}
              <line x1={x} y1="270" x2={x} y2="760" stroke="#94A3B8" strokeWidth="6" />
              <line x1={x - 20} y1="270" x2={x + 20} y2="270" stroke="#CBD5E1" strokeWidth="8" />

              {/* Lamp Fixture */}
              <circle cx={x} cy="270" r="14" fill="#FFD400" filter="url(#neonBloom)" />
              <circle cx={x} cy="270" r="6" fill="#FFFFFF" />

              {/* 100M Interval dimension callout */}
              {idx < 3 && (
                <g transform={`translate(${x + 200}, 330)`}>
                  <line x1="-160" y1="0" x2="160" y2="0" stroke="#00FF88" strokeWidth="1.5" strokeDasharray="4 4" />
                  <rect x="-35" y="-14" width="70" height="28" fill="#0A0A0A" stroke="#00FF88" strokeWidth="1" />
                  <text x="0" y="4" textAnchor="middle" fontSize="13" fill="#00FF88" fontWeight="700">
                    100M
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Double-Row Concertina Razor Wire Representation */}
        <g opacity={entrance}>
          {/* Row 1 (Lower) */}
          <path
            d="M 120 700 Q 180 640 240 700 T 360 700 T 480 700 T 600 700 T 720 700 T 840 700 T 960 700 T 1080 700 T 1200 700 T 1320 700 T 1440 700 T 1560 700 T 1680 700 T 1800 700"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="3.5"
          />
          {/* Row 2 (Upper) */}
          <path
            d="M 120 620 Q 180 560 240 620 T 360 620 T 480 620 T 600 620 T 720 620 T 840 620 T 960 620 T 1080 620 T 1200 620 T 1320 620 T 1440 620 T 1560 620 T 1680 620 T 1800 620"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="3.5"
          />

          {/* Technical Telemetry Callout Badges */}
          <g transform="translate(200, 830)">
            <rect width="360" height="70" rx="8" fill="#0F172A" stroke="#00FF88" strokeWidth="1.5" />
            <text x="20" y="30" fontSize="15" fontWeight="700" fill="#00FF88">
              [SYSTEM 1] DUAL-FENCE BARRIER
            </text>
            <text x="20" y="52" fontSize="13" fill="#94A3B8">
              12 FT GALVANIZED CONCERTINA COIL
            </text>
          </g>

          <g transform="translate(680, 830)">
            <rect width="380" height="70" rx="8" fill="#0F172A" stroke="#FFD400" strokeWidth="1.5" />
            <text x="20" y="30" fontSize="15" fontWeight="700" fill="#FFD400">
              [SYSTEM 2] SODIUM FLOODLIGHTS
            </text>
            <text x="20" y="52" fontSize="13" fill="#94A3B8">
              150,000+ HIGH-OUTPUT LAMPS INSTALLED
            </text>
          </g>

          <g transform="translate(1180, 830)">
            <rect width="360" height="70" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
            <text x="20" y="30" fontSize="15" fontWeight="700" fill="#38BDF8">
              [COVERAGE] TOTAL ILLUMINATION
            </text>
            <text x="20" y="52" fontSize="13" fill="#94A3B8">
              1,200+ MILES CONTINUOUS VISIBILITY
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};

