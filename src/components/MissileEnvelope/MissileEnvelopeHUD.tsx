import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as d3Geo from "d3-geo";
import worldData from "../../data/worldCountries.json";
import {
  GeoCountryCollection,
  GeoCountryFeature,
  TANKER_CASUALTIES,
} from "../../data/timelineData";
import { TacticalHUD } from "../Shared/TacticalHUD";
import { SubtitlesBar } from "../Shared/SubtitlesBar";

const SCRIPT_ACT2 =
  "When hostilities reignited on February 28, 2026, the battlefield shifted immediately from underground bunkers to the water. Look at the terrain on the northern shore of the Strait. The Zagros Mountains drop straight down to the coast around Bandar Abbas, headquarters of the IRGC Navy's First Naval Region. Just offshore sit three rocky islands—Qeshm, Hormuz, and Larak—positioned right on top of the shipping channel. To shut down a maritime chokepoint, you don’t need to build a physical wall across the sea. You just have to make maritime insurance impossible to buy. In the first week of March 2026, coastal batteries, sea mines, and anti-ship drones turned the transit corridor into a shooting gallery. On March 1, the oil tankers Skylight and MKD Vyom were struck and abandoned. Days later, the Safesea Vishnu was set ablaze. By March 27, Iran formally declared the Strait closed to any vessel linked to the United States, Israel, or their allies—followed weeks later by a counter-blockade from the US Navy against Iranian ports. When you layer the range rings of modern coastal anti-ship cruise missiles and one-way attack drones over a two-mile-wide shipping lane, a three-hundred-meter supertanker traveling at fourteen knots has nowhere to hide. Within days, commercial tanker traffic plunged by seventy percent. More than a hundred and fifty massive vessels cut their engines and anchored outside the Strait, waiting in limbo.";

export const MissileEnvelopeHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Close tactical zoom on Bandar Abbas and the three strategic islands
  const { pathGenerator, projectCoord } = useMemo(() => {
    const projection = d3Geo
      .geoMercator()
      .center([56.25, 26.85])
      .scale(12500)
      .translate([960, 520]);

    return {
      pathGenerator: d3Geo.geoPath().projection(projection),
      projectCoord: (coords: [number, number]): [number, number] => {
        const p = projection(coords);
        return p ? [p[0], p[1]] : [0, 0];
      },
    };
  }, []);

  const regionalCountries = useMemo(() => {
    const relevant = ["Iran", "Oman", "United Arab Emirates"];
    const countriesCollection = worldData as unknown as GeoCountryCollection;
    return countriesCollection.features.filter((f: GeoCountryFeature) =>
      relevant.includes(f.properties?.name || "")
    );
  }, []);

  const [bandarX, bandarY] = projectCoord([56.27, 27.18]);
  const [qeshmX, qeshmY] = projectCoord([55.82, 26.85]);
  const [hormuzX, hormuzY] = projectCoord([56.45, 27.06]);
  const [larakX, larakY] = projectCoord([56.35, 26.85]);

  // Radar Pulse Age
  const pulseAge = (frame * 0.04) % 1;

  // Expanding ring scales (projected px radius)
  const ring1R = 60 + pulseAge * 20; // 35km coastal ring
  const ring2R = 240 + pulseAge * 40; // 300km Khalij Fars
  const ring3R = 680 + pulseAge * 80; // 1,000km Abu Mahdi / drone envelope

  const dateTicker = frame > 4200
    ? "MARCH 27, 2026 // CLOSURE DECLARED"
    : frame > 2400
    ? "MARCH 11, 2026 // SAFESEA VISHNU ABLAZE"
    : frame > 600
    ? "MARCH 01, 2026 // TANKERS STRUCK"
    : "FEBRUARY 28, 2026 // HOSTILITIES REIGNITE";

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
        {/* Sea Background */}
        <rect width="1920" height="1080" fill="#E2E8F0" />

        {/* Landmasses */}
        {regionalCountries.map((country: GeoCountryFeature, idx: number) => {
          const d = pathGenerator(country);
          if (!d) return null;
          return (
            <path
              key={idx}
              d={d}
              fill="#1E293B"
              stroke="#94A3B8"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        {/* Concentric Crimson Missile Envelope Rings */}
        <g opacity="0.85">
          {/* Ring 1 (35 km): Coastal Artillery & Mines */}
          <circle
            cx={larakX}
            cy={larakY}
            r={ring1R}
            fill="#DC2626"
            fillOpacity="0.08"
            stroke="#DC2626"
            strokeWidth="2"
          />
          <text
            x={larakX + 70}
            y={larakY}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="12"
            fontWeight="700"
            fill="#DC2626"
          >
            [35 KM] ARTILLERY & MINES
          </text>

          {/* Ring 2 (300 km): Khalij Fars Anti-Ship Ballistic Missiles */}
          <circle
            cx={bandarX}
            cy={bandarY}
            r={ring2R}
            fill="#DC2626"
            fillOpacity="0.05"
            stroke="#DC2626"
            strokeWidth="2.5"
            strokeDasharray="8 6"
          />
          <text
            x={bandarX + 250}
            y={bandarY - 30}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="13"
            fontWeight="700"
            fill="#DC2626"
          >
            [300 KM] KHALIJ FARS ENVELOPE
          </text>

          {/* Ring 3 (1,000 km): Abu Mahdi Cruise & One-Way Drones */}
          <circle
            cx={bandarX}
            cy={bandarY}
            r={ring3R}
            fill="#DC2626"
            fillOpacity="0.03"
            stroke="#DC2626"
            strokeWidth="3"
            strokeDasharray="14 10"
          />
          <text
            x={bandarX + 520}
            y={bandarY + 120}
            fontFamily="'JetBrains Mono', monospace"
            fontSize="14"
            fontWeight="800"
            fill="#DC2626"
          >
            [1,000 KM] ABU MAHDI / SHAHED ENVELOPE
          </text>
        </g>

        {/* Base Nodes (Bandar Abbas, Qeshm, Hormuz, Larak) */}
        {[
          { name: "BANDAR ABBAS (IRGC 1ST NAVAL HQ)", x: bandarX, y: bandarY },
          { name: "QESHM ISLAND", x: qeshmX, y: qeshmY },
          { name: "HORMUZ ISLAND", x: hormuzX, y: hormuzY },
          { name: "LARAK ISLAND", x: larakX, y: larakY },
        ].map((base, i) => (
          <g key={i} transform={`translate(${base.x}, ${base.y})`}>
            <circle r="7" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2.5" />
            <rect
              x="12"
              y="-14"
              width={base.name.length * 8 + 18}
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
              fontSize="11"
              fontWeight="800"
              fill="#1E293B"
            >
              {base.name}
            </text>
          </g>
        ))}

        {/* Ship Casualty Incident Markers */}
        {TANKER_CASUALTIES.map((c, idx) => {
          const [cx, cy] = projectCoord(c.coords);
          const showFrame = idx === 0 ? 600 : idx === 1 ? 1200 : 2400;
          if (frame < showFrame) return null;

          return (
            <g key={idx} transform={`translate(${cx}, ${cy})`}>
              <polygon
                points="0,-18 16,14 -16,14"
                fill="#DC2626"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text x="0" y="8" textAnchor="middle" fontSize="12" fontWeight="900" fill="#FFFFFF">
                !
              </text>
              <g transform="translate(24, -20)">
                <rect
                  x="0"
                  y="0"
                  width={210}
                  height="48"
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#DC2626"
                  strokeWidth="1.5"
                />
                <text x="12" y="18" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#DC2626">
                  {c.name.toUpperCase()}
                </text>
                <text x="12" y="36" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="#64748B">
                  {c.date} | {c.status}
                </text>
              </g>
            </g>
          );
        })}

        {/* IRGC Closure Declaration Flash Banner */}
        {frame > 4200 && (
          <g transform="translate(680, 520)">
            <rect
              x="0"
              y="0"
              width="560"
              height="60"
              rx="8"
              fill="#DC2626"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <text
              x="280"
              y="38"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="20"
              fontWeight="900"
              fill="#FFFFFF"
              letterSpacing="0.1em"
            >
              IRGC DECLARES FORMAL PASSAGE CLOSURE
            </text>
          </g>
        )}
      </svg>

      <TacticalHUD
        category="Act II // The 2026 Hormuz Lockdown"
        title="MULTI-TIER ANTI-SHIP MISSILE ENVELOPES"
        dateStr={dateTicker}
        coordsStr="27.18° N, 56.27° E"
        statLabel="Commercial Traffic Plunge"
        statValue="-70% Transits | 150+ Anchored"
        statTrend="STATUS: MARITIME WAR RISK UNINSURABLE"
        accentColor="#DC2626"
      />

      <SubtitlesBar
        text={SCRIPT_ACT2}
        startFrame={0}
        durationFrames={durationInFrames}
        highlightColor="#DC2626"
      />
    </div>
  );
};
