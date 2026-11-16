import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fonts, easings, typeScale } from "../design/tokens";

export interface CalloutProps {
  x: number;
  y: number;
  label: string;
  side?: "left" | "right";
  startFrame?: number;
}

const LEG = 150;
const RISE = 90;

export const Callout: React.FC<CalloutProps> = ({ x, y, label, side = "right", startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0) return null;
  const dir = side === "right" ? 1 : -1;
  const line = interpolate(local, [0, 22], [0, 1], {
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });
  const box = interpolate(local, [14, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });
  const ex = x + dir * LEG;
  const ey = y - RISE;
  const d = `M ${x} ${y} L ${x + dir * 50} ${ey} L ${ex} ${ey}`;
  const ring = interpolate(local, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });
  return (
    <>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <circle cx={x} cy={y} r={14 * ring} fill="none" stroke={colors.amber} strokeWidth={4} />
        <circle cx={x} cy={y} r={5 * ring} fill={colors.amber} />
        <path
          d={d}
          fill="none"
          stroke={colors.amber}
          strokeWidth={4}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: ex,
          top: ey,
          transform: `translate(${dir > 0 ? 0 : "-100%"}, -50%) translateX(${dir * (1 - box) * 30}px) scale(${0.96 + 0.04 * box})`,
          transformOrigin: dir > 0 ? "left center" : "right center",
          opacity: box,
          padding: "12px 28px",
          background: colors.slate,
          border: `2px solid ${colors.amber}`,
          fontFamily: fonts.sans,
          fontWeight: 600,
          fontSize: typeScale.minText,
          color: colors.cream,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </>
  );
};
