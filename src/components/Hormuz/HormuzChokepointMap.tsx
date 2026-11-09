import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as d3Geo from "d3-geo";
import worldData from "../../data/worldCountries.json";
import {
  GeoCountryCollection,
  GeoCountryFeature,
  HORMUZ_COORDINATES,
  SHIPPING_LANES,
} from "../../data/timelineData";
import { TacticalHUD } from "../Shared/TacticalHUD";
import { SubtitlesBar } from "../Shared/SubtitlesBar";

const SCRIPT_HOOK =
  "At its narrowest point, the Strait of Hormuz is twenty-one miles wide. But for the giant supertankers that carry one-fifth of all the oil consumed on Earth, most of that water is too shallow to use. Every single day, twenty million barrels of crude oil—along with twenty percent of the world’s liquefied natural gas and nearly a third of its chemical fertilizers—have to squeeze through two shipping lanes that are each just two miles across. For fifty years, military planners called closing this corridor the ultimate doomsday scenario—a move so destructive nobody would actually pull the trigger. They were wrong. Between June 2025 and the spring of 2026, a chain reaction starting with a twelve-day air war and ending with a full naval blockade turned those two miles of water into a kill zone. Over a hundred and fifty supertankers dropped anchor and refused to move. Fourteen million barrels of daily oil supply vanished from the market overnight. And the ships that could still sail were forced into a six-thousand-mile detour around the bottom of Africa. This is the anatomy of a chokepoint collapse—and how twelve days in June 2025 set the timer for the largest energy shock of the twenty-first century.";

export const HormuzChokepointMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Camera Zoom & Pan: starts slightly wide, snaps smoothly into the narrow 21-mile funnel
  const zoomScale = interpolate(frame, [0, 200, 800, 2000], [4200, 7800, 9500, 10200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerLon = interpolate(frame, [0, 200, 1000], [54.5, 56.25, 56.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerLat = interpolate(frame, [0, 200, 1000], [25.5, 26.56, 26.45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // D3 Projection
  const { pathGenerator, projectCoord } = useMemo(() => {
    const projection = d3Geo
      .geoMercator()
      .center([centerLon, centerLat])
      .scale(zoomScale)
      .translate([960, 540]);

    return {
      pathGenerator: d3Geo.geoPath().projection(projection),
      projectCoord: (coords: [number, number]): [number, number] => {
        const p = projection(coords);
        return p ? [p[0], p[1]] : [0, 0];
      },
    };
  }, [centerLon, centerLat, zoomScale]);

  // Oil flow metric drop from 20.0M to 6.0M BPD
  const flowProgress = interpolate(frame, [600, 1200], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentBpd = (20.0 - flowProgress * 14.0).toFixed(1);

  // Brent Crude ticker ripping past $120/bbl (+60%)
  const priceProgress = interpolate(frame, [800, 1400], [74.5, 122.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brentPrice = priceProgress.toFixed(2);

  // Filter regional countries for max rendering performance
  const regionalCountries = useMemo(() => {
    const relevant = [
      "Iran",
      "Oman",
      "United Arab Emirates",
      "Saudi Arabia",
      "Qatar",
      "Kuwait",
      "Bahrain",
      "Pakistan",
    ];
    const countriesCollection = worldData as unknown as GeoCountryCollection;
    return countriesCollection.features.filter((f: GeoCountryFeature) =>
      relevant.includes(f.properties?.name || "")
    );
  }, []);

  // Shipping Lane Paths in projected SVG coordinates
  const inboundD = useMemo(() => {
    const pts = SHIPPING_LANES.inbound.map(projectCoord);
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, [projectCoord]);

  const outboundD = useMemo(() => {
    const pts = SHIPPING_LANES.outbound.map(projectCoord);
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, [projectCoord]);

  // 150+ anchored vessel dots clustered outside Fujairah in Gulf of Oman
  const vesselDots = useMemo(() => {
    const dots: [number, number][] = [];
    const baseLon = 56.45;
    const baseLat = 25.15;
    for (let i = 0; i < 150; i++) {
      const angle = (i * 137.5 * Math.PI) / 180;
      const r = Math.sqrt(i) * 0.055;
      dots.push([baseLon + Math.cos(angle) * r, baseLat + Math.sin(angle) * r]);
    }
    return dots;
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      {/* Base Map SVG */}
      <svg width="1920" height="1080" style={{ display: "block" }}>
        <defs>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Sea / Gulf Background */}
        <rect width="1920" height="1080" fill="#E2E8F0" />

        {/* Deep Slate Landmasses with Crisp Borders */}
        {regionalCountries.map((country: GeoCountryFeature, idx: number) => {
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

        {/* Shipping Traffic Separation Scheme (TSS) Lanes */}
        <g opacity={frame > 120 ? 1 : frame / 120}>
          {/* Inbound Lane (Cobalt Blue #2563EB) */}
          <path
            d={inboundD}
            fill="none"
            stroke="#2563EB"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          <path
            d={inboundD}
            fill="none"
            stroke="#2563EB"
            strokeWidth="3.5"
            strokeDasharray="14 8"
          />

          {/* Outbound Lane (Amber #D97706) */}
          <path
            d={outboundD}
            fill="none"
            stroke="#D97706"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          <path
            d={outboundD}
            fill="none"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeDasharray="14 8"
          />
        </g>

        {/* 150+ Anchored Vessel Dots in Gulf of Oman */}
        {frame > 650 && (
          <g opacity={Math.min(1, (frame - 650) / 60)}>
            {vesselDots.map(([lon, lat], i) => {
              const [vx, vy] = projectCoord([lon, lat]);
              return (
                <circle
                  key={i}
                  cx={vx}
                  cy={vy}
                  r="3.5"
                  fill="#DC2626"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        )}

        {/* Strategic Geographic Callout Nodes */}
        {HORMUZ_COORDINATES.slice(0, 6).map((item, idx) => {
          const [cx, cy] = projectCoord(item.coords);
          if (cx < 0 || cx > 1920 || cy < 0 || cy > 1080) return null;
          return (
            <g key={idx} transform={`translate(${cx}, ${cy})`}>
              <circle r="5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
              <rect
                x="8"
                y="-14"
                width={item.name.length * 8.5 + 16}
                height="24"
                rx="4"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <text
                x="16"
                y="3"
                fontFamily="Inter, sans-serif"
                fontSize="12"
                fontWeight="700"
                fill="#1E293B"
              >
                {item.name.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>

      {/* High-Contrast Tactical HUD */}
      <TacticalHUD
        category="Global Energy Chokepoint // Strait of Hormuz"
        title="21 MILES THAT BROKE THE GLOBAL ECONOMY"
        dateStr="FEB 2026 — ACTIVE CRISIS"
        coordsStr="26.56° N, 56.25° E"
        statLabel="Strait Flow / Brent Crude"
        statValue={`${currentBpd}M BPD | $${brentPrice}`}
        statTrend={flowProgress > 0 ? "FLOW: -70% | BRENT: +64.8%" : "FLOW: NOMINAL (20.0M BPD)"}
        accentColor="#DC2626"
      />

      {/* Voiceover Subtitle Stream */}
      <SubtitlesBar
        text={SCRIPT_HOOK}
        startFrame={0}
        durationFrames={durationInFrames}
        highlightColor="#DC2626"
      />
    </div>
  );
};
