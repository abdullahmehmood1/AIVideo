import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MapZoom } from "./components/Map/MapZoom";
import { PinDrop } from "./components/Map/PinDrop";
import { RouteAnimation } from "./components/Map/RouteAnimation";
import { BORDER_COORDINATES, CITIES } from "./components/Map/mapData";

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rapid satellite zoom dive
  const diveSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 65, mass: 1 },
  });

  const zoom = interpolate(diveSpring, [0, 1], [0.95, 1.65]);
  const centerLon = interpolate(diveSpring, [0, 1], [72.8, 72.2]);
  const centerLat = interpolate(diveSpring, [0, 1], [28.5, 27.8]);

  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#0A0A0A" }}>
      <MapZoom center={[centerLon, centerLat]} zoom={zoom}>
        {/* Fully illuminated border line */}
        <RouteAnimation
          coordinates={BORDER_COORDINATES}
          color="#FFD400"
          width={6}
          drawDurationFrames={120}
          delayFrames={10}
          glow={true}
          showBeacon={false}
        />

        {/* City & Capital Pins */}
        <PinDrop
          lon={CITIES[0].coords[0]}
          lat={CITIES[0].coords[1]}
          label="KARACHI"
          subLabel="PORT HUB"
          color="#00FF88"
          delayFrames={30}
        />
        <PinDrop
          lon={CITIES[1].coords[0]}
          lat={CITIES[1].coords[1]}
          label="LAHORE"
          subLabel="PUNJAB"
          color="#00FF88"
          delayFrames={50}
        />
        <PinDrop
          lon={CITIES[2].coords[0]}
          lat={CITIES[2].coords[1]}
          label="NEW DELHI"
          subLabel="CAPITAL"
          color="#FFD400"
          delayFrames={70}
        />
        <PinDrop
          lon={CITIES[3].coords[0]}
          lat={CITIES[3].coords[1]}
          label="ISLAMABAD"
          subLabel="CAPITAL"
          color="#00FF88"
          delayFrames={90}
        />
      </MapZoom>

      {/* Center Tactical Lock Banner */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          fontFamily: "monospace",
          zIndex: 50,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.85)",
            border: "1.5px solid #FFD400",
            padding: "12px 28px",
            borderRadius: 8,
            color: "#FFD400",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.15em",
            boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
          }}
        >
          TARGET: 1,200+ MILES ILLUMINATED FRONTIER
        </div>
      </div>
    </div>
  );
};

