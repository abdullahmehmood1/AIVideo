import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MapZoom } from "./components/Map/MapZoom";
import { RouteAnimation } from "./components/Map/RouteAnimation";
import { BORDER_COORDINATES } from "./components/Map/mapData";

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  // Epic Pullback from close map view back to high orbit
  const zoom = interpolate(frame, [0, 390], [1.8, 0.78], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerLon = interpolate(frame, [0, 390], [73.5, 71.5]);
  const centerLat = interpolate(frame, [0, 390], [29.5, 26.5]);

  // Pulse intensity as video reaches its final dramatic payoff
  const finalGlow = 0.8 + Math.sin(frame * 0.15) * 0.2;

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#0A0A0A" }}>
      <MapZoom
        center={[centerLon, centerLat]}
        zoom={zoom}
        showEarthCurve={frame > 180}
      >
        {/* Full glowing border line shining as a scar across space */}
        <RouteAnimation
          coordinates={BORDER_COORDINATES}
          color="#FFD400"
          width={7}
          drawDurationFrames={60}
          delayFrames={0}
          glow={true}
          showBeacon={false}
        />
      </MapZoom>

      {/* Dramatic Final Space HUD */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "monospace",
          opacity: finalGlow,
          zIndex: 50,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#FFD400",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            textShadow: "0 0 20px rgba(255, 212, 0, 0.7)",
          }}
        >
          VISIBLE FROM LOW EARTH ORBIT
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#00FF88",
            letterSpacing: "0.15em",
            marginTop: 6,
          }}
        >
          1,200 MILES OF ELECTRIFIED ILLUMINATION // 1947 — PRESENT
        </div>
      </div>
    </div>
  );
};

