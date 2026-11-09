import React, { useRef } from "react";
import * as THREE from "three";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const FloatingObject: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meshRef = useRef<THREE.Mesh>(null);

  // Entrance scale spring
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    },
  });

  // Continuous rotation based on frame
  const rotationY = (frame * 0.02) % (Math.PI * 2);
  const rotationX = Math.sin(frame * 0.03) * 0.4;
  const rotationZ = (frame * 0.01) % (Math.PI * 2);

  // Floating bobbing motion
  const posY = Math.sin(frame * 0.05) * 0.25;

  // Color transition across frames
  const hue = interpolate(frame % 300, [0, 300], [0.55, 0.85]);
  const emissiveColor = new THREE.Color().setHSL(hue, 0.9, 0.4);

  return (
    <group position={[0, posY, 0]} scale={scale}>
      {/* Outer Torus Knot */}
      <mesh
        ref={meshRef}
        rotation={[rotationX, rotationY, rotationZ]}
        castShadow
        receiveShadow
      >
        <torusKnotGeometry args={[1.2, 0.35, 128, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          roughness={0.15}
          metalness={0.85}
          wireframe={false}
        />
      </mesh>

      {/* Inner Glowing Core Sphere */}
      <mesh scale={0.7 + Math.sin(frame * 0.08) * 0.08}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive={emissiveColor}
          emissiveIntensity={1.8}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};

