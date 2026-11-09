import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface CaptionItem {
  id: string;
  startFrame: number;
  endFrame: number;
  text: string;
  highlightWords?: string[];
}

export const defaultCaptions: CaptionItem[] = [
  {
    id: "c1",
    startFrame: 15,
    endFrame: 75,
    text: "Welcome to 3D Motion Graphics with Three.js",
    highlightWords: ["3D", "Motion", "Graphics"],
  },
  {
    id: "c2",
    startFrame: 80,
    endFrame: 140,
    text: "Real-time procedural rendering powered by Remotion",
    highlightWords: ["procedural", "rendering", "Remotion"],
  },
  {
    id: "c3",
    startFrame: 145,
    endFrame: 210,
    text: "GPU accelerated cloud rendering directly in Google Colab",
    highlightWords: ["GPU", "accelerated", "Google", "Colab"],
  },
];

export const CaptionsOverlay: React.FC<{
  captions?: CaptionItem[];
}> = ({ captions = defaultCaptions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Find the currently active caption
  const activeCaption = captions.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame,
  );

  if (!activeCaption) {
    return null;
  }

  // Animation for caption appearance
  const progressInCaption = frame - activeCaption.startFrame;
  const entrySpring = spring({
    frame: progressInCaption,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const words = activeCaption.text.split(" ");
  const duration = activeCaption.endFrame - activeCaption.startFrame;
  const wordDuration = duration / words.length;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "12%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 40px",
        boxSizing: "border-box",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          transform: `scale(${entrySpring}) translateY(${(1 - entrySpring) * 30}px)`,
          opacity: entrySpring,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: 20,
          padding: "24px 36px",
          maxWidth: "85%",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 42,
            lineHeight: 1.3,
            fontWeight: 700,
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#f8fafc",
            letterSpacing: "-0.01em",
          }}
        >
          {words.map((word, idx) => {
            const wordStart = idx * wordDuration;
            const wordEnd = (idx + 1) * wordDuration;
            const isCurrent =
              progressInCaption >= wordStart && progressInCaption < wordEnd;
            const isHighlighted =
              activeCaption.highlightWords?.some((hw) =>
                word.toLowerCase().includes(hw.toLowerCase()),
              ) ?? false;

            const wordScale = isCurrent ? 1.08 : 1;
            const wordColor = isHighlighted
              ? "#38bdf8"
              : isCurrent
                ? "#fbbf24"
                : "#f8fafc";

            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  margin: "0 6px",
                  color: wordColor,
                  transform: `scale(${wordScale})`,
                  textShadow: isCurrent
                    ? "0 0 16px rgba(251, 191, 36, 0.6)"
                    : isHighlighted
                      ? "0 0 16px rgba(56, 189, 248, 0.5)"
                      : "none",
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

