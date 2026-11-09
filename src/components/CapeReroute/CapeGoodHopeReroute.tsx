import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as d3Geo from "d3-geo";
import worldData from "../../data/worldCountries.json";
import {
  CAPE_ROUTE,
  GeoCountryCollection,
  GeoCountryFeature,
} from "../../data/timelineData";
import { TacticalHUD } from "../Shared/TacticalHUD";
import { SubtitlesBar } from "../Shared/SubtitlesBar";

const SCRIPT_ACT4 =
  "When a chokepoint closes, the pain doesn't stay in the region—it compounds across every ocean on Earth. Because security across both the Persian Gulf and the Red Sea corridor fractured at the same time, available supertankers scrambling to pick up alternative crude from the Atlantic Basin or West Africa couldn't cut through Suez. Instead, global shipping had to reroute around the southern tip of Africa via the Cape of Good Hope. Look at what that detour does to global logistics. Adding six thousand nautical miles tacks on two and a half extra weeks to a single voyage. When a supertanker spends eighteen extra days at sea, that ship isn't available to load its next cargo—which effectively shrinks the size of the global tanker fleet by up to twenty-five percent overnight. In March 2026, oil recorded its largest monthly surge in modern market history. Brent crude jumped more than sixty percent past a hundred and twenty dollars a barrel, with institutional models warning of a hundred and ninety dollars if the blockade held. And it wasn't just fuel. Because the Persian Gulf supplies roughly thirty percent of the world’s traded urea and ammonia fertilizers, locking down the Strait meant farms from Brazil to South Asia suddenly faced an agricultural supply shock right at planting season. Economists estimated the chokepoint freeze alone added up to two full percentage points to global inflation.";

export const CapeGoodHopeReroute: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // D3 Orthographic Projection (Globe View covering Africa, Europe, Middle East)
  const { pathGenerator, projectCoord } = useMemo(() => {
    const projection = d3Geo
      .geoOrthographic()
      .rotate([-25, -5, 0])
      .scale(620)
      .translate([760, 540]);

    return {
      pathGenerator: d3Geo.geoPath().projection(projection),
      projectCoord: (coords: [number, number]): [number, number] => {
        const p = projection(coords);
        return p ? [p[0], p[1]] : [-100, -100];
      },
    };
  }, []);

  // Filter countries for Africa, Europe, Middle East
  const countries = (worldData as unknown as GeoCountryCollection).features;

  // Route A: Blocked Suez Route (Crimson dashed)
  const suezPathD = useMemo(() => {
    const pts = CAPE_ROUTE.suezBlocked.map(projectCoord).filter(([x, y]) => x > 0 && y > 0);
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, [projectCoord]);

  // Route B: Cape of Good Hope Active Detour (Amber solid #D97706)
  const capePathD = useMemo(() => {
    const pts = CAPE_ROUTE.capeDetour.map(projectCoord).filter(([x, y]) => x > 0 && y > 0);
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, [projectCoord]);

  // Animated Detour Path Progress
  const detourProgress = interpolate(frame, [200, 2200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const brentSpike = interpolate(frame, [600, 2400], [74.5, 122.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const capePt = projectCoord([18.47, -34.35]);

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

        {/* Orthographic Globe Disc */}
        <circle cx="760" cy="540" r="620" fill="#CBD5E1" />

        {/* Landmasses */}
        {countries.map((country: GeoCountryFeature, idx: number) => {
          const d = pathGenerator(country);
          if (!d) return null;
          return (
            <path
              key={idx}
              d={d}
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Route A: Blocked Suez Corridor (Crimson Dashed) */}
        <path
          d={suezPathD}
          fill="none"
          stroke="#DC2626"
          strokeWidth="3.5"
          strokeDasharray="8 6"
          opacity="0.8"
        />

        {/* Route B: Cape of Good Hope Active Detour (Amber Solid) */}
        <path
          d={capePathD}
          fill="none"
          stroke="#D97706"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3000"
          strokeDashoffset={3000 * (1 - detourProgress)}
        />

        {/* Cape of Good Hope Callout Node */}
        {capePt[0] > 0 && (
          <g transform={`translate(${capePt[0]}, ${capePt[1]})`}>
            <circle r="7" fill="#D97706" stroke="#FFFFFF" strokeWidth="2.5" />
            <rect
              x="14"
              y="-16"
              width="250"
              height="32"
              rx="6"
              fill="#FFFFFF"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            <text x="24" y="5" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#D97706">
              CAPE OF GOOD HOPE (34°S)
            </text>
          </g>
        )}
      </svg>

      {/* Right Dashboard: Logistics & Economic Domino Effect */}
      <div
        style={{
          position: "absolute",
          top: 130,
          right: 68,
          width: 480,
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #CBD5E1",
          borderRadius: 12,
          padding: "24px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          fontFamily: "'JetBrains Mono', monospace",
          zIndex: 45,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#D97706", letterSpacing: "0.15em" }}>
          GLOBAL MARITIME SUPPLY SHOCK
        </div>

        {/* Metric 1: Distance Detour */}
        <div style={{ marginTop: 18, borderBottom: "1px solid #E2E8F0", paddingBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>CAPE TRANSIT PENALTY</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
            +6,000 <span style={{ fontSize: 16 }}>NAUTICAL MILES</span>
          </div>
          <div style={{ fontSize: 13, color: "#D97706", fontWeight: 700, marginTop: 2 }}>
            +14 to +18 Days Added per Voyage
          </div>
        </div>

        {/* Metric 2: Brent Crude Price Spike */}
        <div style={{ marginTop: 14, borderBottom: "1px solid #E2E8F0", paddingBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>BRENT CRUDE SPOT / STRESS TEST</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#DC2626", marginTop: 2 }}>
            ${brentSpike.toFixed(2)} <span style={{ fontSize: 16 }}>/ bbl (+64%)</span>
          </div>
          <div style={{ fontSize: 12, color: "#DC2626", fontWeight: 700, marginTop: 2 }}>
            Stress Projections: Flash Peaks to $190/bbl
          </div>
        </div>

        {/* Metric 3: Fertilizer & Agriculture */}
        <div style={{ marginTop: 14, borderBottom: "1px solid #E2E8F0", paddingBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>FERTILIZER & CHEMICAL SHOCK</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>
            30% GLOBAL UREA & AMMONIA
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
            Critical agricultural planting window disrupted
          </div>
        </div>

        {/* Metric 4: Inflation */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>GLOBAL HEADLINE INFLATION</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#DC2626", marginTop: 2 }}>
            +1.2% TO +2.0%
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
            Effective global tanker capacity contracted -25%
          </div>
        </div>
      </div>

      <TacticalHUD
        category="Act IV // Global Logistics Reroute"
        title="THE CAPE OF GOOD HOPE DETOUR & PRICE SHOCK"
        dateStr="SPRING 2026 // GLOBAL MARITIME DOMINO"
        coordsStr="18.47° E, 34.35° S (Cape of Good Hope)"
        statLabel="Detour Distance / Fleet Impact"
        statValue="+6,000 NM | -25% Tanker Fleet"
        statTrend="PRICE: BRENT SURGES PAST $120/BBL"
        accentColor="#D97706"
      />

      <SubtitlesBar
        text={SCRIPT_ACT4}
        startFrame={0}
        durationFrames={durationInFrames}
        highlightColor="#D97706"
      />
    </div>
  );
};
