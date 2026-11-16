import React from "react";
import { AbsoluteFill } from "remotion";

export const Vignette: React.FC<{ intensity?: number }> = ({
  intensity = 0.52,
}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse 78% 72% at 50% 48%, rgba(22, 27, 34, 0) 48%, rgba(10, 13, 18, ${intensity}) 100%)`,
      }}
    />
  );
};
