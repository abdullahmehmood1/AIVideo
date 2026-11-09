import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface SubtitleCue {
  startFrame: number;
  endFrame: number;
  text: string;
}

export const SCRIPT_CUES: SubtitleCue[] = [
  {
    startFrame: 0,
    endFrame: 300,
    text: "If you look down at Earth from the International Space Station at night, you’ll see an eerie orange ribbon winding across thousands of miles of total darkness.",
  },
  {
    startFrame: 300,
    endFrame: 600,
    text: "Most international borders are completely invisible lines on a map, but this one glows so intensely that astronauts can easily spot it from orbit.",
  },
  {
    startFrame: 600,
    endFrame: 1020,
    text: "This is the border between India and Pakistan—two nuclear-armed rivals separated by one of the most fortified frontiers on Earth.",
  },
  {
    startFrame: 1020,
    endFrame: 1410,
    text: "Stretching from the Arabian Sea, through the scorching Thar Desert, and into the snow-capped Himalayas, India mounted tens of thousands of industrial floodlights across twelve hundred miles of razor-wire fence.",
  },
  {
    startFrame: 1410,
    endFrame: 1800,
    text: "The goal? To stop cross-border infiltration and smuggling across pitch-black wilderness. What began in 1947 as a hasty line drawn on paper is now so heavily electrified and illuminated, it shines as a glowing scar visible from the silence of space.",
  },
];

export const SubtitlesOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentCue = SCRIPT_CUES.find(
    (cue) => frame >= cue.startFrame && frame < cue.endFrame
  );

  if (!currentCue) {
    return null;
  }

  const durationFrames = currentCue.endFrame - currentCue.startFrame;
  const progressInCue = frame - currentCue.startFrame;

  // Spring appearance
  const popSpring = spring({
    frame: progressInCue,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const words = currentCue.text.split(" ");
  const wordDuration = durationFrames / words.length;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `scale(${popSpring}) translateY(${(1 - popSpring) * 20}px)`,
          opacity: popSpring,
          backgroundColor: "rgba(10, 10, 10, 0.88)",
          backdropFilter: "blur(16px)",
          border: "1.5px solid rgba(255, 212, 0, 0.3)",
          borderRadius: 18,
          padding: "20px 36px",
          maxWidth: "88%",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 34,
            lineHeight: 1.35,
            fontWeight: 700,
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {words.map((word, idx) => {
            const wordStart = idx * wordDuration;
            const wordEnd = (idx + 1) * wordDuration;
            const isCurrent =
              progressInCue >= wordStart && progressInCue < wordEnd;
            const isPast = progressInCue >= wordEnd;

            // Highlight in #FFD400 when spoken
            const wordColor = isCurrent
              ? "#FFD400"
              : isPast
              ? "#FFFFFF"
              : "rgba(255, 255, 255, 0.55)";

            const wordScale = isCurrent ? 1.08 : 1;

            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  margin: "0 5px",
                  color: wordColor,
                  transform: `scale(${wordScale})`,
                  textShadow: isCurrent
                    ? "0 0 18px rgba(255, 212, 0, 0.7)"
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

