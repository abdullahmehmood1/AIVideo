import React, { useMemo } from "react";
import { random, useCurrentFrame } from "remotion";

export const Particles: React.FC<{ count?: number }> = ({ count = 120 }) => {
  const frame = useCurrentFrame();

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (random(`x-${i}`) - 0.5) * 12;
      pos[i * 3 + 1] = (random(`y-${i}`) - 0.5) * 12;
      pos[i * 3 + 2] = (random(`z-${i}`) - 0.5) * 10;
      sc[i] = random(`s-${i}`) * 0.08 + 0.02;
    }
    return [pos, sc];
  }, [count]);

  return (
    <group rotation={[0, frame * 0.003, frame * 0.001]}>
      {Array.from({ length: count }).map((_, i) => {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1] + Math.sin((frame + i * 20) * 0.02) * 0.2;
        const z = positions[i * 3 + 2];
        const s = scales[i];

        return (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[s, 8, 8]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? "#60a5fa" : "#c084fc"}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
};
