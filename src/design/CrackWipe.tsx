import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { colors, easings } from "./tokens";

export interface CrackPoint {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
}

export const generateCrackPoints = (
  seed = "world-rupture-crack",
  segments = 16,
  startX = 56,
  endX = 44,
): CrackPoint[] => {
  const points: CrackPoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const baseX = startX + (endX - startX) * t;
    const jitter =
      i === 0 || i === segments
        ? 0
        : (random(`${seed}-${i}`) - 0.5) * 7.5;
    points.push({
      x: Number((baseX + jitter).toFixed(2)),
      y: Number((t * 100).toFixed(2)),
    });
  }
  return points;
};

export interface CrackLineProps {
  progress?: number; // 0..1
  seed?: string;
  strokeWidth?: number;
  startX?: number;
  endX?: number;
  opacity?: number;
}

export const CrackLine: React.FC<CrackLineProps> = ({
  progress = 1,
  seed = "world-rupture-crack",
  strokeWidth = 4,
  startX = 56,
  endX = 44,
  opacity = 1,
}) => {
  const pathD = useMemo(() => {
    const pts = generateCrackPoints(seed, 16, startX, endX);
    return pts
      .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x * 19.2} ${p.y * 10.8}`)
      .join(" ");
  }, [seed, startX, endX]);

  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={colors.red}
        strokeWidth={strokeWidth * 3.2}
        strokeOpacity={0.22}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - clamped}
      />
      <path
        d={pathD}
        fill="none"
        stroke={colors.red}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - clamped}
      />
    </svg>
  );
};

export interface CrackWipeProps extends Record<string, unknown> {
  seed?: string;
}

const CrackWipePresentation: React.FC<
  TransitionPresentationComponentProps<CrackWipeProps>
> = ({
  children,
  presentationProgress,
  presentationDirection,
  passedProps,
}) => {
  const seed = passedProps?.seed ?? "world-rupture-crack";
  const points = useMemo(() => generateCrackPoints(seed, 18, 56, 44), [seed]);

  if (presentationDirection === "exiting") {
    const dim = interpolate(presentationProgress, [0, 0.45, 1], [1, 0.94, 0.8], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <AbsoluteFill
        showInTimeline={false}
        style={{ filter: `brightness(${dim})` }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  // Entering scene draws crack from 0..0.45 then splits open from 0.45..1.0
  const drawProgress = interpolate(presentationProgress, [0, 0.45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });

  const splitProgress = interpolate(presentationProgress, [0.45, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  const dxPercent = splitProgress * 68;
  const leftPoly = points.map(
    (p) => `${Math.max(0, p.x - dxPercent).toFixed(2)}% ${p.y.toFixed(2)}%`,
  );
  const rightPoly = [...points]
    .reverse()
    .map(
      (p) => `${Math.min(100, p.x + dxPercent).toFixed(2)}% ${p.y.toFixed(2)}%`,
    );

  const clipPath =
    splitProgress <= 0.001
      ? "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)"
      : `polygon(${[...leftPoly, ...rightPoly].join(", ")})`;

  const dxPx = dxPercent * 19.2;
  const leftPathD = points
    .map(
      (p, idx) =>
        `${idx === 0 ? "M" : "L"} ${(p.x * 19.2 - dxPx).toFixed(1)} ${(p.y * 10.8).toFixed(1)}`,
    )
    .join(" ");
  const rightPathD = points
    .map(
      (p, idx) =>
        `${idx === 0 ? "M" : "L"} ${(p.x * 19.2 + dxPx).toFixed(1)} ${(p.y * 10.8).toFixed(1)}`,
    )
    .join(" ");

  const crackOpacity = interpolate(splitProgress, [0.8, 1], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill showInTimeline={false}>
      <AbsoluteFill showInTimeline={false} style={{ clipPath }}>
        {children}
      </AbsoluteFill>
      <svg
        width="1920"
        height="1080"
        viewBox="0 0 1920 1080"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: crackOpacity,
        }}
      >
        <path
          d={leftPathD}
          fill="none"
          stroke={colors.red}
          strokeWidth={14}
          strokeOpacity={0.28}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - drawProgress}
        />
        <path
          d={leftPathD}
          fill="none"
          stroke={colors.red}
          strokeWidth={5}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - drawProgress}
        />
        {splitProgress > 0.001 && (
          <>
            <path
              d={rightPathD}
              fill="none"
              stroke={colors.red}
              strokeWidth={14}
              strokeOpacity={0.28}
              strokeLinejoin="round"
            />
            <path
              d={rightPathD}
              fill="none"
              stroke={colors.red}
              strokeWidth={5}
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

export const crackWipe = (
  props?: CrackWipeProps,
): TransitionPresentation<CrackWipeProps> => {
  return {
    component: CrackWipePresentation,
    props: props ?? {},
  };
};
