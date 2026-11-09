import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { FloatingObject } from "./FloatingObject";
import { Particles } from "./Particles";

export const Scene3D: React.FC = () => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Dynamic camera angle / zoom
  const cameraZ = 5.5 + Math.sin(frame * 0.02) * 0.5;
  const cameraX = Math.sin(frame * 0.015) * 0.8;
  const cameraY = Math.cos(frame * 0.015) * 0.3;

  return (
    <div style={{ position: "absolute", width: "100%", height: "100%" }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{
          position: [cameraX, cameraY, cameraZ],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
      >
        {/* Ambient base lighting */}
        <ambientLight intensity={0.6} />

        {/* Dynamic primary key light */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.8}
          color="#ffffff"
        />

        {/* Rim / backlight with accent color */}
        <pointLight
          position={[-6, -4, -3]}
          intensity={2.5}
          color="#38bdf8"
        />

        {/* Foreground accent light */}
        <pointLight
          position={[3, -2, 4]}
          intensity={1.2}
          color="#ec4899"
        />

        {/* Floating animated 3D Mesh */}
        <FloatingObject />

        {/* 3D ambient particle system */}
        <Particles count={150} />
      </ThreeCanvas>
    </div>
  );
};

