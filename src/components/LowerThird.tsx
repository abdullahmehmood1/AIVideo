import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, springs, easings, typeScale } from "../design/tokens";

export interface LowerThirdProps {
  label: string;
  sublabel?: string;
  startFrame?: number;
  durationInFrames?: number;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  label,
  sublabel,
  startFrame = 0,
  durationInFrames = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;
  if (local < 0) return null;
  const enter = (delay: number) =>
    spring({ frame: local - delay, fps, config: springs.smooth, durationInFrames: 28 });
  const exit = interpolate(local, [durationInFrames - 10, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });
  if (exit >= 1) return null;
  const bar = enter(0);
  const a = enter(4);
  const b = enter(10);
  const style = (p: number): React.CSSProperties => ({
    opacity: p * (1 - exit),
    transform: `translateX(${(1 - p) * -36 - exit * 40}px) scale(${0.97 + 0.03 * p})`,
    transformOrigin: "left center",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        bottom: 96,
        display: "flex",
        alignItems: "stretch",
        gap: 28,
      }}
    >
      <div
        style={{
          width: 8,
          background: colors.amber,
          transform: `scaleY(${bar * (1 - exit)})`,
          transformOrigin: "bottom",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            ...style(a),
            fontFamily: fonts.serif,
            fontWeight: 700,
            fontSize: typeScale.caption,
            color: colors.cream,
            lineHeight: 1.1,
          }}
        >
          {label}
        </div>
        {sublabel ? (
          <div
            style={{
              ...style(b),
              fontFamily: fonts.sans,
              fontWeight: 600,
              fontSize: typeScale.minText,
              color: colors.steel,
              lineHeight: 1.15,
            }}
          >
            {sublabel}
          </div>
        ) : null}
      </div>
    </div>
  );
};
