import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as d3Geo from "d3-geo";
import worldData from "../../data/worldCountries.json";
import {
  GeoCountryCollection,
  GeoCountryFeature,
  TWELVE_DAY_WAR_SITES,
} from "../../data/timelineData";
import { TacticalHUD } from "../Shared/TacticalHUD";
import { SubtitlesBar } from "../Shared/SubtitlesBar";

const SCRIPT_ACT1 =
  "To understand why the tankers stopped in 2026, you have to rewind eight months to June 13, 2025: the opening hour of the Twelve-Day War. At dawn, Israel launched Operation Rising Lion—also tracked as Operation Dawn Strike—a massive preemptive air and intelligence campaign across Iran. Using smuggled short-range drones to blind radar batteries from the inside and fifth-generation stealth aircraft from the outside, Israeli forces crippled over a hundred and twenty air defense systems in the opening phase. Within days, more than nine hundred targets were struck, including centrifuge facilities at Karaj, conversion plants at Isfahan, the heavy water complex at Arak, and the above-ground enrichment plant at Natanz. Over thirty senior military commanders and eleven nuclear scientists were killed. Iran answered with waves of ballistic missiles and cluster munitions aimed at Tel Aviv, Haifa, and military installations. While allied air defenses intercepted roughly eighty to ninety percent of incoming fire, dozens of missiles broke through. Then, on Day Ten—June 22—the United States entered the war directly. Under Operation Midnight Hammer, more than a hundred and twenty-five American aircraft, led by B-2 stealth bombers carrying deep-penetration munitions, struck the underground halls at Fordow alongside Natanz and Isfahan. Twenty-four hours later, Iran fired a precision strike across the Gulf at Al Udeid Air Base in Qatar—headquarters of US Central Command—hitting a geodesic radar dome. On June 24, a sudden ceasefire froze the conflict. On paper, the war lasted twelve days. In reality, it changed the military math of the Middle East forever. With its air defenses degraded and its nuclear sites damaged, Tehran had only one asymmetric trump card left that airpower alone couldn't easily erase: the geography of the Persian Gulf.";

export const TwelveDayWarTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Regional projection covering Levant, Iraq, Iran & Gulf
  const { pathGenerator, projectCoord } = useMemo(() => {
    const projection = d3Geo
      .geoMercator()
      .center([44.5, 32.5])
      .scale(2300)
      .translate([960, 540]);

    return {
      pathGenerator: d3Geo.geoPath().projection(projection),
      projectCoord: (coords: [number, number]): [number, number] => {
        const p = projection(coords);
        return p ? [p[0], p[1]] : [0, 0];
      },
    };
  }, []);

  const relevantCountries = useMemo(() => {
    const names = [
      "Israel",
      "Jordan",
      "Syria",
      "Iraq",
      "Iran",
      "Saudi Arabia",
      "Kuwait",
      "Qatar",
      "United Arab Emirates",
      "Turkey",
    ];
    const countriesCollection = worldData as unknown as GeoCountryCollection;
    return countriesCollection.features.filter((f: GeoCountryFeature) =>
      names.includes(f.properties?.name || "")
    );
  }, []);

  // Timeline Phase Calculation
  // Phase 1: Days 1-5 (Frames 0 - 1800) -> Israeli strike corridors
  // Phase 2: Day 10 (Frames 1800 - 3200) -> Op Midnight Hammer (US B-2s)
  // Phase 3: Day 11-12 (Frames 3200 - 4950) -> Al Udeid ballistic strike & Ceasefire
  const dayProgress = interpolate(frame, [0, 1800, 3200, 4200], [1, 5, 10, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentDay = Math.floor(dayProgress);

  const targetsStruck = Math.min(
    900,
    Math.floor(interpolate(frame, [100, 1600], [0, 912], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  );
  const airDefenseHits = Math.min(
    120,
    Math.floor(interpolate(frame, [100, 1200], [0, 124], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  );

  // Vector coordinates
  const telAvivPt = projectCoord([34.78, 32.08]);
  const natanzPt = projectCoord([51.72, 33.72]);
  const isfahanPt = projectCoord([51.68, 32.65]);
  const karajPt = projectCoord([51.0, 35.83]);
  const fordowPt = projectCoord([50.99, 34.88]);
  const alUdeidPt = projectCoord([51.31, 25.11]);

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

        {/* Landmasses */}
        {relevantCountries.map((country: GeoCountryFeature, idx: number) => {
          const d = pathGenerator(country);
          if (!d) return null;
          return (
            <path
              key={idx}
              d={d}
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Phase 1: Israeli Stealth Strike Corridors (Crimson #DC2626) */}
        {frame > 120 && (
          <g>
            <path
              d={`M ${telAvivPt[0]} ${telAvivPt[1]} Q 420 380 ${natanzPt[0]} ${natanzPt[1]}`}
              fill="none"
              stroke="#DC2626"
              strokeWidth="3.5"
              strokeDasharray="10 6"
              opacity="0.85"
            />
            <path
              d={`M ${telAvivPt[0]} ${telAvivPt[1]} Q 440 340 ${karajPt[0]} ${karajPt[1]}`}
              fill="none"
              stroke="#DC2626"
              strokeWidth="3.5"
              strokeDasharray="10 6"
              opacity="0.85"
            />
            <path
              d={`M ${telAvivPt[0]} ${telAvivPt[1]} Q 430 420 ${isfahanPt[0]} ${isfahanPt[1]}`}
              fill="none"
              stroke="#DC2626"
              strokeWidth="3.5"
              strokeDasharray="10 6"
              opacity="0.85"
            />
          </g>
        )}

        {/* Phase 2: US B-2 Stealth Vectors (Cobalt Blue #2563EB) */}
        {frame > 1800 && (
          <g>
            <path
              d={`M 960 -50 Q 820 200 ${fordowPt[0]} ${fordowPt[1]}`}
              fill="none"
              stroke="#2563EB"
              strokeWidth="5"
              opacity="0.9"
            />
            <path
              d={`M 1100 -50 Q 950 220 ${natanzPt[0]} ${natanzPt[1]}`}
              fill="none"
              stroke="#2563EB"
              strokeWidth="5"
              opacity="0.9"
            />
          </g>
        )}

        {/* Phase 3: Iranian Retaliatory Strike on Al Udeid Air Base (Crimson Arc) */}
        {frame > 3200 && (
          <g>
            <path
              d={`M ${isfahanPt[0]} ${isfahanPt[1]} Q 760 620 ${alUdeidPt[0]} ${alUdeidPt[1]}`}
              fill="none"
              stroke="#DC2626"
              strokeWidth="4"
              strokeDasharray="8 6"
            />
            {/* Impact indicator at Al Udeid */}
            <circle cx={alUdeidPt[0]} cy={alUdeidPt[1]} r="16" fill="#DC2626" opacity="0.3" />
            <circle cx={alUdeidPt[0]} cy={alUdeidPt[1]} r="6" fill="#DC2626" />
          </g>
        )}

        {/* Target Site Nodes */}
        {TWELVE_DAY_WAR_SITES.map((site, i) => {
          const [sx, sy] = projectCoord(site.coords);
          const isTarget = site.country === "Iran";
          const nodeColor = isTarget ? "#DC2626" : site.name === "Al Udeid Air Base" ? "#F59E0B" : "#2563EB";

          return (
            <g key={i} transform={`translate(${sx}, ${sy})`}>
              <circle r="7" fill={nodeColor} stroke="#FFFFFF" strokeWidth="2" />
              <rect
                x="12"
                y="-14"
                width={site.name.length * 8.5 + 16}
                height="24"
                rx="4"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <text
                x="20"
                y="3"
                fontFamily="Inter, sans-serif"
                fontSize="12"
                fontWeight="700"
                fill="#1E293B"
              >
                {site.name.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Date & Phase Stamp */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 68,
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #CBD5E1",
          borderRadius: 8,
          padding: "10px 18px",
          fontFamily: "'JetBrains Mono', monospace",
          zIndex: 45,
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>OPERATION STATUS</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: currentDay >= 12 ? "#16A34A" : "#DC2626", marginTop: 2 }}>
          {currentDay >= 12
            ? "JUNE 24, 2025 // CEASEFIRE DECLARED"
            : currentDay >= 10
            ? "JUNE 22, 2025 // OP MIDNIGHT HAMMER (B-2)"
            : `JUNE 13, 2025 // DAY ${currentDay.toString().padStart(2, "0")}`}
        </div>
      </div>

      {/* HUD Telemetry Header */}
      <TacticalHUD
        category="Act I // The Fuse: Twelve-Day War"
        title="AIR CORRIDORS & STRATEGIC STRIKE ARCS"
        dateStr={`JUNE 13–24, 2025 (DAY ${currentDay})`}
        coordsStr="32.08° N, 34.78° E ➔ 33.72° N, 51.72° E"
        statLabel="Targets Struck / Air Defenses"
        statValue={`${targetsStruck}+ Struck | ${airDefenseHits}+ Defenses`}
        statTrend="STATUS: FULL THEATER MOBILIZATION"
        accentColor="#DC2626"
      />

      <SubtitlesBar
        text={SCRIPT_ACT1}
        startFrame={0}
        durationFrames={durationInFrames}
        highlightColor="#2563EB"
      />
    </div>
  );
};
