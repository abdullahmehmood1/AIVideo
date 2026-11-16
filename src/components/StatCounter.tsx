import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fonts, easings, typeScale } from "../design/tokens";

export interface StatCounterProps {
  value: number;
  from?: number;
  unit?: string;
  prefix?: string;
  decimals?: number;
  label?: string;
  startFrame?: number;
  durationFrames?: number;
  color?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  from = 0,
  unit = "",
  prefix = "",
  decimals = 0,
  label,
  startFrame = 0,
  durationFrames = 60,
  color = colors.cream,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const current = interpolate(local, [0, durationFrames], [from, value], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });
  const p = interpolate(local, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });
  const text = current.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.96 + 0.04 * p})`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: typeScale.stat,
          color,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {prefix}
        {text}
        {unit ? (
          <span style={{ fontSize: typeScale.heading, color: colors.creamDim, marginLeft: 8 }}>
            {unit}
          </span>
        ) : null}
      </div>
      {label ? (
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 600,
            fontSize: typeScale.minText,
            color: colors.steel,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
