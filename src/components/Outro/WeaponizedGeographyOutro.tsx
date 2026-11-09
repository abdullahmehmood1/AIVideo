import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as d3Geo from "d3-geo";
import worldData from "../../data/worldCountries.json";
import {
  GeoCountryCollection,
  GeoCountryFeature,
  GLOBAL_CHOKEPOINTS,
} from "../../data/timelineData";
import { TacticalHUD } from "../Shared/TacticalHUD";
import { SubtitlesBar } from "../Shared/SubtitlesBar";

const SCRIPT_OUTRO =
  "Even after naval escorts, offshore ship-to-ship transfers in the Gulf of Oman, and diplomatic scrambles like the Islamabad Memorandum slowly clawed oil flows back toward fourteen million barrels a day later in 2026, the illusion of permanent maritime security was gone. For decades, globalization was built on a simple assumption: that the oceans are a neutral highway, and the narrow straits connecting them will always stay open. The Twelve-Day War of 2025 and the Hormuz Crisis of 2026 proved that in modern warfare, a two-mile-wide stretch of shallow water is more powerful than an entire fleet of bombers. Because when you control the funnel, you control the world.";

export const WeaponizedGeographyOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Natural Earth Equal-Area or Equirectangular world projection
  const { pathGenerator, projectCoord } = useMemo(() => {
    const projection = d3Geo
      .geoNaturalEarth1()
      .scale(290)
      .translate([960, 510]);

    return {
      pathGenerator: d3Geo.geoPath().projection(projection),
      projectCoord: (coords: [number, number]): [number, number] => {
        const p = projection(coords);
        return p ? [p[0], p[1]] : [-100, -100];
      },
    };
  }, []);

  const countries = (worldData as unknown as GeoCountryCollection).features;

  const pulseAge = (frame * 0.05) % 1;
  const pulseRadius = 14 + pulseAge * 28;
  const pulseOpacity = (1 - pulseAge) * 0.8;

  const summaryEntrance = interpolate(frame, [400, 700], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      <svg width="1920" height="1080" style={{ display: "block" }}>
        {/* Ocean Background */}
        <rect width="1920" height="1080" fill="#E2E8F0" />

        {/* World Landmasses */}
        {countries.map((country: GeoCountryFeature, idx: number) => {
          const d = pathGenerator(country);
          if (!d) return null;
          return (
            <path
              key={idx}
              d={d}
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Pulsing Chokepoint Alert Nodes */}
        {GLOBAL_CHOKEPOINTS.map((cp, idx) => {
          const [cx, cy] = projectCoord(cp.coords);
          if (cx < 0 || cy < 0) return null;

          return (
            <g key={idx} transform={`translate(${cx}, ${cy})`}>
              {/* Pulsing ring */}
              <circle
                r={pulseRadius}
                fill="none"
                stroke="#D97706"
                strokeWidth="2"
                opacity={pulseOpacity}
              />
              {/* Center point */}
              <circle r="6" fill="#D97706" stroke="#FFFFFF" strokeWidth="2" />

              {/* Label Tag */}
              <g transform="translate(14, -14)">
                <rect
                  x="0"
                  y="-12"
                  width={cp.name.length * 8 + 14}
                  height="22"
                  rx="4"
                  fill="#FFFFFF"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <text
                  x="7"
                  y="3"
                  fontFamily="Inter, sans-serif"
                  fontSize="10"
                  fontWeight="800"
                  fill="#1E293B"
                >
                  {cp.name.toUpperCase()}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* Final Thesis Summary Card */}
      {frame > 400 && (
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 68,
            width: 480,
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            border: "1.5px solid #CBD5E1",
            borderRadius: 12,
            padding: "24px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            fontFamily: "Inter, sans-serif",
            opacity: summaryEntrance,
            transform: `translateY(${(1 - summaryEntrance) * 20}px)`,
            zIndex: 45,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: "#D97706",
              letterSpacing: "0.15em",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            STRATEGIC DOCTRINE AUDIT // 2026
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", marginTop: 8 }}>
            THE ERA OF WEAPONIZED GEOGRAPHY
          </div>
          <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.5, marginTop: 8 }}>
            A single two-mile shipping lane holds 20% of global oil, 20% of LNG, and 30% of fertilizers. In modern
            warfare, controlling the funnel controls the global economy.
          </div>
        </div>
      )}

      <TacticalHUD
        category="Outro // Strategic Assessment"
        title="THE WEAPONIZATION OF GLOBAL CHOKEPOINTS"
        dateStr="2026 & BEYOND"
        coordsStr="GLOBAL MARITIME NETWORK"
        statLabel="Primary World Chokepoints"
        statValue="5 Vulnerable Straits"
        statTrend="GLOBALIZATION ARCHITECTURE FRACTURED"
        accentColor="#D97706"
      />

      <SubtitlesBar
        text={SCRIPT_OUTRO}
        startFrame={0}
        durationFrames={durationInFrames}
        highlightColor="#D97706"
      />
    </div>
  );
};
