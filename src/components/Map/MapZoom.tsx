import React from "react";
import {
  geoToSvg,
  SOUTH_ASIA_COASTLINE_COORDS,
  NORTHERN_RANGE_COORDS,
  BORDER_COORDINATES,
} from "./mapData";

export interface MapZoomProps {
  center?: [number, number]; // [lon, lat]
  zoom?: number; // 1 = normal overview, 2 = 2x, etc.
  children?: React.ReactNode;
  showEarthCurve?: boolean;
  opacity?: number;
}

export const MapZoom: React.FC<MapZoomProps> = ({
  center = [72.0, 28.0],
  zoom = 1,
  children,
  showEarthCurve = false,
  opacity = 1,
}) => {
  const [targetX, targetY] = geoToSvg(center[0], center[1]);

  // Land polygon: South Asian Peninsula + Northern Mountains combined
  const landPoints = [
    ...SOUTH_ASIA_COASTLINE_COORDS.map(([lon, lat]) => geoToSvg(lon, lat)),
    ...NORTHERN_RANGE_COORDS.slice().reverse().map(([lon, lat]) => geoToSvg(lon, lat)),
  ];
  const landPathD = "M " + landPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ") + " Z";

  // Pakistan western polygon
  const pakBorderPoints = [
    ...BORDER_COORDINATES.map(([lon, lat]) => geoToSvg(lon, lat)),
    geoToSvg(77.5, 35.8),
    geoToSvg(74.5, 37.0),
    geoToSvg(71.5, 36.5),
    geoToSvg(69.5, 34.0),
    geoToSvg(66.5, 32.0),
    geoToSvg(61.8, 29.5),
    geoToSvg(61.5, 25.2),
    geoToSvg(64.5, 25.3),
    geoToSvg(66.9, 24.8),
    geoToSvg(68.16, 23.71),
  ];
  const pakPathD = "M " + pakBorderPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ") + " Z";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: 1920,
        height: 1080,
        backgroundColor: "#0A0A0A",
        overflow: "hidden",
        opacity,
      }}
    >
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <defs>
          {/* Radial ocean gradient */}
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="100%" stopColor="#050811" />
          </radialGradient>

          {/* Neon Bloom Filter */}
          <filter id="neonBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle Cyber Grid */}
          <pattern id="cyberGrid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#00FF88" strokeWidth="1" strokeOpacity="0.05" />
          </pattern>
        </defs>

        {/* Ocean Background */}
        <rect width="1920" height="1080" fill="url(#oceanGrad)" />
        <rect width="1920" height="1080" fill="url(#cyberGrid)" />

        {/* Zoom & Pan Camera Group */}
        <g
          transform={`translate(960, 540) scale(${zoom}) translate(${-targetX}, ${-targetY})`}
          style={{ transformOrigin: "0 0" }}
        >
          {/* Base Continental Landmass */}
          <path
            d={landPathD}
            fill="#101827"
            stroke="#1E293B"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />

          {/* Pakistan Region Tint */}
          <path
            d={pakPathD}
            fill="#0F243A"
            stroke="#00FF88"
            strokeWidth="1.5"
            strokeOpacity="0.4"
            vectorEffect="non-scaling-stroke"
          />

          {/* Himalayan Ridge Texture Lines */}
          <path
            d={`M ${geoToSvg(73, 34)[0]} ${geoToSvg(73, 34)[1]} Q ${geoToSvg(78, 32)[0]} ${geoToSvg(78, 32)[1]} ${geoToSvg(86, 28)[0]} ${geoToSvg(86, 28)[1]}`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeOpacity="0.25"
            strokeDasharray="8 6"
          />

          {/* Thar Desert Shading */}
          <ellipse
            cx={geoToSvg(71.5, 27.2)[0]}
            cy={geoToSvg(71.5, 27.2)[1]}
            rx="110"
            ry="90"
            fill="#F59E0B"
            fillOpacity="0.08"
          />

          {/* Child Layers (Routes, Pins, Overlays) */}
          {children}
        </g>

        {/* Optional Earth Horizon Curve (for High Orbit Shot) */}
        {showEarthCurve && (
          <path
            d="M -100 1150 Q 960 920 2020 1150 L 2020 1200 L -100 1200 Z"
            fill="#030712"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeOpacity="0.4"
          />
        )}
      </svg>
    </div>
  );
};

