import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as d3Geo from "d3-geo";
import worldData from "../../data/worldCountries.json";
import {
  GeoCountryCollection,
  GeoCountryFeature,
  PIPELINES,
} from "../../data/timelineData";
import { TacticalHUD } from "../Shared/TacticalHUD";
import { SubtitlesBar } from "../Shared/SubtitlesBar";

const SCRIPT_ACT3 =
  "Whenever a crisis hits the Persian Gulf, the first question energy traders ask is: why not just pump the oil overland through pipelines and skip the Strait entirely? Saudi Arabia and the United Arab Emirates actually built pipelines for this exact emergency. Saudi Arabia operates the East-West Pipeline, running seven hundred and forty-six miles across the desert to the Red Sea port of Yanbu, with a nameplate capacity of seven million barrels a day. The UAE runs the Habshan-to-Fujairah pipeline, bypassing the Strait directly into the Gulf of Oman at one point eight million barrels a day. Here is the problem when you run the actual numbers. Those pipelines were already running partially full before the war started. When subtracting normal baseline usage, the true unused spare capacity available for an emergency was only about two point six million barrels per day. Meanwhile, Kuwait, Qatar, Iraq’s southern terminals, and Bahrain had virtually zero overland bypass routes to the open ocean. Out of twenty million barrels a day, thirteen to fourteen million barrels were completely trapped behind the chokepoint. In a global economy that burns roughly a hundred and four million barrels every twenty-four hours, losing thirteen percent of the world’s daily supply overnight had no modern precedent.";

export const BypassPipelineVsTanker: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Arabian Peninsula Overview Projection
  const { pathGenerator, projectCoord } = useMemo(() => {
    const projection = d3Geo
      .geoMercator()
      .center([47.5, 24.5])
      .scale(2200)
      .translate([820, 540]);

    return {
      pathGenerator: d3Geo.geoPath().projection(projection),
      projectCoord: (coords: [number, number]): [number, number] => {
        const p = projection(coords);
        return p ? [p[0], p[1]] : [0, 0];
      },
    };
  }, []);

  const peninsulaCountries = useMemo(() => {
    const names = [
      "Saudi Arabia",
      "Yemen",
      "Oman",
      "United Arab Emirates",
      "Qatar",
      "Kuwait",
      "Iraq",
      "Jordan",
      "Egypt",
    ];
    const countriesCollection = worldData as unknown as GeoCountryCollection;
    return countriesCollection.features.filter((f: GeoCountryFeature) =>
      names.includes(f.properties?.name || "")
    );
  }, []);

  // Pipeline paths
  const petrolineD = useMemo(() => {
    const pts = PIPELINES.petroline.path.map(projectCoord);
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, [projectCoord]);

  const habshanD = useMemo(() => {
    const pts = PIPELINES.habshan.path.map(projectCoord);
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, [projectCoord]);

  // Progress of pipeline capacity fill
  const petrolineFill = interpolate(frame, [150, 600], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const habshanFill = interpolate(frame, [300, 750], [0, 1], {
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

        {/* Arabian Peninsula Landmasses */}
        {peninsulaCountries.map((country: GeoCountryFeature, idx: number) => {
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

        {/* Saudi Petroline Route (Abqaiq to Yanbu) */}
        <path
          d={petrolineD}
          fill="none"
          stroke="#2563EB"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <path
          d={petrolineD}
          fill="none"
          stroke="#60A5FA"
          strokeWidth="2"
          strokeDasharray="10 6"
        />

        {/* UAE Habshan to Fujairah Route */}
        <path
          d={habshanD}
          fill="none"
          stroke="#00FF88"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Terminals (Abqaiq, Yanbu, Habshan, Fujairah) */}
        {[
          { name: "YANBU (RED SEA)", coords: [38.06, 24.08] as [number, number] },
          { name: "ABQAIQ (EASTERN)", coords: [50.19, 26.27] as [number, number] },
          { name: "HABSHAN", coords: [53.75, 23.75] as [number, number] },
          { name: "FUJAIRAH", coords: [56.35, 25.12] as [number, number] },
        ].map((pt, i) => {
          const [px, py] = projectCoord(pt.coords);
          return (
            <g key={i} transform={`translate(${px}, ${py})`}>
              <circle r="6" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x="12"
                y="4"
                fontFamily="Inter, sans-serif"
                fontSize="12"
                fontWeight="800"
                fill="#FFFFFF"
                stroke="#0A0A0A"
                strokeWidth="2"
                paintOrder="stroke"
              >
                {pt.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Right Sidebar: The Infrastructure Math Data Breakdown */}
      <div
        style={{
          position: "absolute",
          top: 140,
          right: 68,
          width: 460,
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #CBD5E1",
          borderRadius: 12,
          padding: "24px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          fontFamily: "'JetBrains Mono', monospace",
          zIndex: 45,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB", letterSpacing: "0.15em" }}>
          INFRASTRUCTURE DEFICIT EQUATION
        </div>

        {/* Metric 1: Total Normal Flow */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748B" }}>
            <span>Strait Normal Flow</span>
            <span style={{ fontWeight: 800, color: "#0F172A" }}>20.0M bpd</span>
          </div>
          <div style={{ width: "100%", height: 10, backgroundColor: "#E2E8F0", borderRadius: 5, marginTop: 6 }}>
            <div style={{ width: "100%", height: "100%", backgroundColor: "#0F172A", borderRadius: 5 }} />
          </div>
        </div>

        {/* Metric 2: Saudi Petroline */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748B" }}>
            <span>Saudi Petroline (7.0M Nameplate)</span>
            <span style={{ fontWeight: 700, color: "#2563EB" }}>1.8M bpd Spare</span>
          </div>
          <div style={{ width: "100%", height: 10, backgroundColor: "#E2E8F0", borderRadius: 5, marginTop: 6 }}>
            <div
              style={{
                width: `${petrolineFill * 35}%`,
                height: "100%",
                backgroundColor: "#2563EB",
                borderRadius: 5,
              }}
            />
          </div>
        </div>

        {/* Metric 3: UAE Habshan */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748B" }}>
            <span>UAE Habshan–Fujairah (1.8M Nameplate)</span>
            <span style={{ fontWeight: 700, color: "#00FF88" }}>0.8M bpd Spare</span>
          </div>
          <div style={{ width: "100%", height: 10, backgroundColor: "#E2E8F0", borderRadius: 5, marginTop: 6 }}>
            <div
              style={{
                width: `${habshanFill * 16}%`,
                height: "100%",
                backgroundColor: "#00FF88",
                borderRadius: 5,
              }}
            />
          </div>
        </div>

        <div style={{ height: 1, backgroundColor: "#E2E8F0", margin: "20px 0" }} />

        {/* Net Result */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>TOTAL AVAILABLE SPARE CAPACITY</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#DC2626", marginTop: 2 }}>
            ~2.6M <span style={{ fontSize: 18 }}>BPD</span>
          </div>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
            Net Trapped Deficit: <strong style={{ color: "#0F172A" }}>13.5M–14.0M bpd</strong> (13% of world demand)
          </div>
        </div>
      </div>

      <TacticalHUD
        category="Act III // The Infrastructure Math"
        title="WHY BYPASS PIPELINES COULDN'T SAVE THE MARKET"
        dateStr="SPRING 2026 AUDIT"
        coordsStr="24.08° N, 38.06° E (Yanbu) ➔ 25.12° N, 56.35° E"
        statLabel="Pipeline Spare vs. Trapped"
        statValue="2.6M Spare | 14.0M Trapped"
        statTrend="DEFICIT: 13% OF DAILY GLOBAL SUPPLY"
        accentColor="#2563EB"
      />

      <SubtitlesBar
        text={SCRIPT_ACT3}
        startFrame={0}
        durationFrames={durationInFrames}
        highlightColor="#2563EB"
      />
    </div>
  );
};
