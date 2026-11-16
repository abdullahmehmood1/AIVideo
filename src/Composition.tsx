import React from "react";
import { AbsoluteFill } from "remotion";

export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0A",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 64, fontWeight: 700, margin: 0 }}>
          Ready for Next Video
        </h1>
        <p style={{ fontSize: 28, color: "#94A3B8", marginTop: 16 }}>
          Add your new scenes and voiceover to begin rendering
        </p>
      </div>
    </AbsoluteFill>
  );
};
