import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MapZoom } from "./components/Map/MapZoom";
import { RouteAnimation } from "./components/Map/RouteAnimation";
import { BORDER_COORDINATES } from "./components/Map/mapData";

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle orbital drift
  const zoom = interpolate(frame, [0, 300], [0.82, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerLon = interpolate(frame, [0, 300], [70.5, 72.8]);
  const centerLat = interpolate(frame, [0, 300], [26.0, 28.5]);

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#0A0A0A" }}>
      <MapZoom center={[centerLon, centerLat]} zoom={zoom} showEarthCurve={true}>
        {/* The glowing orange border ribbon appearing across darkness */}
        <RouteAnimation
          coordinates={BORDER_COORDINATES}
          color="#FFD400"
          width={5}
          drawDurationFrames={200}
          delayFrames={45}
          glow={true}
          showBeacon={true}
        />
      </MapZoom>

      {/* Orbital Telemetry HUD */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 70,
          fontFamily: "monospace",
          color: "#00FF88",
          fontSize: 16,
          letterSpacing: "0.15em",
          zIndex: 50,
        }}
      >
        <div style={{ fontWeight: 800 }}>LIVE ISS TELEMETRY // ORBIT_NIGHT_CAM</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
          ALTITUDE: 418 KM | INCLINATION: 51.6° | SECTOR: SOUTH ASIA
        </div>
      </div>

      {/* Top right target tag */}
      <div
        style={{
          position: "absolute",
          top: 50,
          right: 70,
          fontFamily: "monospace",
          color: "#FFD400",
          fontSize: 14,
          letterSpacing: "0.12em",
          padding: "8px 16px",
          border: "1px solid #FFD400",
          borderRadius: 6,
          backgroundColor: "rgba(10, 10, 10, 0.7)",
          zIndex: 50,
        }}
      >
        UNIDENTIFIED ILLUMINATED CORRIDOR
      </div>
    </div>
  );
};

