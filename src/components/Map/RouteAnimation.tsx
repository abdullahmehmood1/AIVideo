import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { geoToSvg } from "./mapData";

export interface RouteAnimationProps {
  coordinates?: [number, number][]; // Array of [lon, lat]
  color?: string; // #FFD400 (illuminated border) or #00FF88 (route)
  width?: number;
  drawDurationFrames?: number;
  delayFrames?: number;
  glow?: boolean;
  showBeacon?: boolean;
}

export const RouteAnimation: React.FC<RouteAnimationProps> = ({
  coordinates,
  color = "#FFD400",
  width = 4,
  drawDurationFrames = 90,
  delayFrames = 0,
  glow = true,
  showBeacon = true,
}) => {
  const frame = useCurrentFrame();

  const points = useMemo(() => {
    if (!coordinates || coordinates.length === 0) return [];
    return coordinates.map(([lon, lat]) => geoToSvg(lon, lat));
  }, [coordinates]);

  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    return "M " + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, [points]);

  // Total approximate polyline length
  const totalLength = useMemo(() => {
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i][0] - points[i - 1][0];
      const dy = points[i][1] - points[i - 1][1];
      len += Math.hypot(dx, dy);
    }
    return Math.max(1, len);
  }, [points]);

  const progress = interpolate(
    frame - delayFrames,
    [0, drawDurationFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Current head position of the drawing route
  const currentHeadPoint = useMemo(() => {
    if (points.length === 0) return [0, 0];
    const targetDistance = totalLength * progress;
    let accumulated = 0;

    for (let i = 1; i < points.length; i++) {
      const dx = points[i][0] - points[i - 1][0];
      const dy = points[i][1] - points[i - 1][1];
      const segmentLen = Math.hypot(dx, dy);

      if (accumulated + segmentLen >= targetDistance) {
        const segProgress = (targetDistance - accumulated) / (segmentLen || 1);
        return [
          points[i - 1][0] + dx * segProgress,
          points[i - 1][1] + dy * segProgress,
        ];
      }
      accumulated += segmentLen;
    }
    return points[points.length - 1];
  }, [points, totalLength, progress]);

  if (frame < delayFrames || points.length === 0) {
    return null;
  }

  const strokeDashoffset = totalLength * (1 - progress);

  return (
    <g>
      {/* Outer Glow Line */}
      {glow && (
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={width * 3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={strokeDashoffset}
          opacity="0.4"
          filter="url(#neonBloom)"
        />
      )}

      {/* Core Sharp Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={totalLength}
        strokeDashoffset={strokeDashoffset}
      />

      {/* Active Moving Beacon at the Head */}
      {showBeacon && progress > 0 && progress < 1 && (
        <g transform={`translate(${currentHeadPoint[0]}, ${currentHeadPoint[1]})`}>
          <circle r={width * 2} fill={color} filter="url(#neonBloom)" />
          <circle r={width} fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
};

