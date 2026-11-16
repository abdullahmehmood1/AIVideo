import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

const TILE_SIZE = 160;
const GRAIN_DOTS = 260;

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
  const frame = useCurrentFrame();

  const dots = useMemo(() => {
    return Array.from({ length: GRAIN_DOTS }, (_, i) => {
      const x = Math.floor(random(`grain-x-${i}`) * TILE_SIZE);
      const y = Math.floor(random(`grain-y-${i}`) * TILE_SIZE);
      const size = random(`grain-s-${i}`) > 0.7 ? 2 : 1;
      const isLight = random(`grain-c-${i}`) > 0.45;
      const alpha = 0.35 + random(`grain-a-${i}`) * 0.55;
      return { x, y, size, isLight, alpha };
    });
  }, []);

  // Deterministic frame-by-frame shift on 2s cycle (mod doesn't hurt chunk determinism)
  const shiftX = Math.round((random(`grain-fx-${frame}`) - 0.5) * TILE_SIZE);
  const shiftY = Math.round((random(`grain-fy-${frame}`) - 0.5) * TILE_SIZE);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity,
        overflow: "hidden",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="film-grain-tile"
            width={TILE_SIZE}
            height={TILE_SIZE}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${shiftX}, ${shiftY})`}
          >
            {dots.map((d, idx) => (
              <rect
                key={idx}
                x={d.x}
                y={d.y}
                width={d.size}
                height={d.size}
                fill={d.isLight ? "#F2ECE0" : "#000000"}
                fillOpacity={d.alpha}
              />
            ))}
          </pattern>
        </defs>
        <rect width="1920" height="1080" fill="url(#film-grain-tile)" />
      </svg>
    </AbsoluteFill>
  );
};
