import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface SubtitlesBarProps {
  text: string;
  startFrame?: number;
  durationFrames?: number;
  highlightColor?: string; // Cobalt Blue #2563EB or Amber #D97706
}

export const SubtitlesBar: React.FC<SubtitlesBarProps> = ({
  text,
  startFrame = 0,
  durationFrames = 300,
  highlightColor = "#2563EB",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progressInCue = Math.max(0, frame - startFrame);

  const entrance = spring({
    frame: progressInCue,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const words = text.split(" ");
  const wordDuration = Math.max(1, durationFrames / words.length);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
        zIndex: 50,
        pointerEvents: "none",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          transform: `scale(${entrance}) translateY(${(1 - entrance) * 15}px)`,
          opacity: entrance,
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          backdropFilter: "blur(12px)",
          border: "1px solid #CBD5E1",
          borderRadius: 14,
          padding: "16px 32px",
          maxWidth: "88%",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 26,
            lineHeight: 1.4,
            fontWeight: 700,
            color: "#1E293B",
            letterSpacing: "-0.01em",
          }}
        >
          {words.map((word, idx) => {
            const wordStart = idx * wordDuration;
            const wordEnd = (idx + 1) * wordDuration;
            const isCurrent = progressInCue >= wordStart && progressInCue < wordEnd;
            const isPast = progressInCue >= wordEnd;

            const wordColor = isCurrent
              ? highlightColor
              : isPast
              ? "#0F172A"
              : "#94A3B8";

            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  margin: "0 4px",
                  color: wordColor,
                  fontWeight: isCurrent ? 800 : 700,
                  transform: isCurrent ? "scale(1.06)" : "scale(1)",
                  borderBottom: isCurrent ? `2px solid ${highlightColor}` : "none",
                }}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};
