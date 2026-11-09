import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MapZoom } from "./components/Map/MapZoom";
import { PinDrop } from "./components/Map/PinDrop";
import { RouteAnimation } from "./components/Map/RouteAnimation";
import { BORDER_COORDINATES, CITIES } from "./components/Map/mapData";

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  // Terrain Tracking Pan from South (Arabian Sea) to North (Himalayas)
  const centerLon = interpolate(frame, [0, 420], [69.0, 75.2], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const centerLat = interpolate(frame, [0, 420], [24.0, 33.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const zoom = interpolate(frame, [0, 210, 420], [2.1, 2.4, 2.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#0A0A0A" }}>
      <MapZoom center={[centerLon, centerLat]} zoom={zoom}>
        {/* Continuous Active Border Line */}
        <RouteAnimation
          coordinates={BORDER_COORDINATES}
          color="#FFD400"
          width={6.5}
          drawDurationFrames={60}
          delayFrames={0}
          glow={true}
          showBeacon={true}
        />

        {/* Sector Callouts dropping along the camera path */}
        <PinDrop
          lon={CITIES[4].coords[0]}
          lat={CITIES[4].coords[1]}
          label="SECTOR 1: RANN OF KUTCH"
          subLabel="MARSHLAND / ARABIAN SEA"
          color="#00FF88"
          delayFrames={20}
        />
        <PinDrop
          lon={CITIES[5].coords[0]}
          lat={CITIES[5].coords[1]}
          label="SECTOR 2: THAR DESERT"
          subLabel="SAND DUNE BARRIER"
          color="#FFD400"
          delayFrames={140}
        />
        <PinDrop
          lon={CITIES[6].coords[0]}
          lat={CITIES[6].coords[1]}
          label="SECTOR 3: LINE OF CONTROL"
          subLabel="18,000 FT HIMALAYAN FRONT"
          color="#00FF88"
          delayFrames={260}
        />
      </MapZoom>

      {/* Floating HUD Badges */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 60,
          fontFamily: "monospace",
          zIndex: 50,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.85)",
            borderLeft: "4px solid #FFD400",
            padding: "10px 20px",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          ACTIVE PATROL ZONE // DUAL NUCLEAR POWERS
        </div>
        <div style={{ color: "#00FF88", fontSize: 13, marginTop: 6, letterSpacing: "0.1em" }}>
          SURVEILLANCE: RADAR + THERMAL SENSORS ONLINE
        </div>
      </div>
    </div>
  );
};

