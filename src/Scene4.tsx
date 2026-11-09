import React from "react";
import { TacticalFenceDiagram } from "./components/Map/TacticalFenceDiagram";

export const Scene4: React.FC = () => {
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#0A0A0A" }}>
      {/* Tactical Engineering & Floodlight Blueprint */}
      <TacticalFenceDiagram />
    </div>
  );
};

