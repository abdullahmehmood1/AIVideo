import React from "react";
import { AbsoluteFill } from "remotion";
import { GeoMotionMap } from "../components/GeoMotion/GeoMotionMap";

export const GeoMotionScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#02050b" }}>
      <GeoMotionMap />
    </AbsoluteFill>
  );
};

