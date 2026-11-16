import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { colors, fonts, easings, typeScale } from "../design/tokens";

export interface LineChart2DProps {
  points: { x: number; y: number }[];
  width: number;
  height: number;
  color?: string;
  drawFrames: number;
  startFrame?: number;
  showAxes?: boolean;
  label?: string;
}

export const LineChart2D: React.FC<LineChart2DProps> = ({
  points,
  width,
  height,
  color = colors.amber,
  drawFrames,
  startFrame = 0,
  showAxes = true,
  label,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const pad = 24;
  const geo = useMemo(() => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const sx = (v: number) => pad + ((v - minX) / (maxX - minX || 1)) * (width - pad * 2);
    const sy = (v: number) => height - pad - ((v - minY) / (maxY - minY || 1)) * (height - pad * 2);
    const pts = points.map((p) => [sx(p.x), sy(p.y)] as const);
    return pts;
  }, [points, width, height]);
  if (local < 0 || geo.length === 0) return null;
  const draw = interpolate(local, [0, drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });
  const fade = interpolate(local, [0, 16], [0, 1], {
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });
  const d = geo.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L ${geo[geo.length - 1][0]} ${height - pad} L ${geo[0][0]} ${height - pad} Z`;
  // head position along polyline by arc length (matches dash progress)
  const segLen = geo.slice(1).map((p, i) => Math.hypot(p[0] - geo[i][0], p[1] - geo[i][1]));
  const total = segLen.reduce((a, b) => a + b, 0) || 1;
  let remain = draw * total;
  let hx = geo[0][0];
  let hy = geo[0][1];
  for (let i = 0; i < segLen.length; i++) {
    const t = segLen[i] > 0 ? Math.min(1, remain / segLen[i]) : 1;
    hx = geo[i][0] + (geo[i + 1][0] - geo[i][0]) * t;
    hy = geo[i][1] + (geo[i + 1][1] - geo[i][1]) * t;
    if (remain <= segLen[i]) break;
    remain -= segLen[i];
  }  return (
    <div
      style={{
        position: "relative",
        width,
        opacity: fade,
        transform: `translateY(${(1 - fade) * 24}px)`,
      }}
    >
      {label ? (
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 600,
            fontSize: typeScale.minText,
            color: colors.steel,
            marginBottom: 12,
          }}
        >
          {label}
        </div>
      ) : null}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
        <defs>
          <clipPath id="lc2d-clip">
            <rect x={0} y={0} width={hx} height={height} />
          </clipPath>
        </defs>
        {showAxes ? (
          <g stroke={colors.creamDim} strokeOpacity={0.5} strokeWidth={2}>
            <line x1={pad} y1={pad} x2={pad} y2={height - pad} />
            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />
          </g>
        ) : null}
        <path d={area} fill={color} fillOpacity={0.12} clipPath="url(#lc2d-clip)" />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <circle cx={hx} cy={hy} r={9} fill={colors.cream} opacity={draw > 0 ? 1 : 0} />
      </svg>
    </div>
  );
};

