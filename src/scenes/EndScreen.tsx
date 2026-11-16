import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { CrackLine } from "../design/CrackWipe";
import { colors, easings, fonts, springs, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "EndScreen")!;
const script = scriptData.scenes.find((s) => s.id === "EndScreen")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;

export const EndScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const intro = spring({
    frame,
    fps,
    config: springs.smooth,
  });

  const drift = interpolate(frame, [0, durationInFrames], [0, 14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  const crackDraw = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: colors.slate }}>
      {/* Left cream half & right slate half split */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
        }}
      >
        <div
          style={{
            flex: 1,
            backgroundColor: colors.cream,
            transform: `translateX(${(1 - intro) * -24}px)`,
          }}
        />
        <div
          style={{
            flex: 1,
            backgroundColor: colors.slate,
            transform: `translateX(${(1 - intro) * 24}px)`,
          }}
        />
      </div>

      {/* Central brand red crack */}
      <CrackLine
        progress={crackDraw}
        seed="endscreen-center-crack"
        startX={51.5}
        endX={48.5}
        strokeWidth={6}
      />

      {/* Minimal End-Screen Cards & Subscribe Placeholder */}
      <AbsoluteFill
        style={{
          padding: "88px 110px",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: intro,
          }}
        >
          <div
            style={{
              fontFamily: fonts.serif,
              fontSize: typeScale.heading,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: colors.bgDeep,
            }}
          >
            {scriptData.channel.toUpperCase()}
          </div>

          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: typeScale.minText,
              color: colors.creamDim,
            }}
          >
            {script.narration.split(".").slice(1).join(".").trim() || "Not financial advice."}
          </div>
        </div>

        {/* Two video placeholders + Subscribe circle placeholder */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 56,
            transform: `translateY(${(1 - intro) * 28 - drift * 0.4}px)`,
            opacity: intro,
          }}
        >
          <div
            style={{
              width: 560,
              height: 315,
              borderRadius: 24,
              border: `3px solid ${colors.slateLight}`,
              backgroundColor: "rgba(34, 42, 53, 0.14)",
            }}
          />

          <div
            style={{
              width: 196,
              height: 196,
              borderRadius: 999,
              border: `4px solid ${colors.red}`,
              backgroundColor: colors.bgDeep,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.sans,
              fontSize: typeScale.minText,
              fontWeight: 700,
              color: colors.cream,
              transform: `scale(${0.96 + Math.sin((frame / fps) * 1.8) * 0.02})`,
            }}
          >
            WR
          </div>

          <div
            style={{
              width: 560,
              height: 315,
              borderRadius: 24,
              border: `3px solid ${colors.steel}`,
              backgroundColor: "rgba(242, 236, 224, 0.08)",
            }}
          />
        </div>

        <div
          style={{
            height: 44,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
