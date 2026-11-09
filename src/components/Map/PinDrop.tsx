import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { geoToSvg } from "./mapData";

export interface PinDropProps {
  lon: number;
  lat: number;
  label: string;
  subLabel?: string;
  delayFrames?: number;
  color?: string;
  glow?: boolean;
}

export const PinDrop: React.FC<PinDropProps> = ({
  lon,
  lat,
  label,
  subLabel,
  delayFrames = 0,
  color = "#FFD400",
  glow = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delayFrames);
  const dropSpring = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 12, stiffness: 140, mass: 0.6 },
  });

  const [x, y] = geoToSvg(lon, lat);

  // Radar Pulse animation
  const pulseAge = (adjustedFrame * 0.05) % 1;
  const pulseRadius = 15 + pulseAge * 45;
  const pulseOpacity = (1 - pulseAge) * 0.8;

  if (frame < delayFrames) {
    return null;
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Radar ripple */}
      <circle
        r={pulseRadius}
        fill="none"
        stroke={color}
        strokeWidth="2"
        opacity={pulseOpacity}
      />

      {/* Pin Body dropping into place */}
      <g transform={`translate(0, ${(1 - dropSpring) * -60}) scale(${dropSpring})`}>
        {/* Glow halo */}
        {glow && (
          <circle
            r="16"
            fill={color}
            opacity="0.25"
            filter="url(#neonBloom)"
          />
        )}

        {/* Central beacon marker */}
        <circle r="7" fill={color} stroke="#0A0A0A" strokeWidth="2.5" />
        <circle r="2.5" fill="#FFFFFF" />

        {/* Label Tag */}
        <g transform="translate(18, -12)">
          <rect
            x="0"
            y="-16"
            width={label.length * 10 + 24}
            height="32"
            rx="6"
            fill="#0A0A0A"
            stroke={color}
            strokeWidth="1.5"
            opacity="0.9"
          />
          <text
            x="12"
            y="5"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="14"
            fontWeight="700"
            fill="#FFFFFF"
            letterSpacing="0.05em"
          >
            {label}
          </text>
          {subLabel && (
            <text
              x="12"
              y="22"
              fontFamily="monospace"
              fontSize="10"
              fontWeight="600"
              fill={color}
              letterSpacing="0.08em"
            >
              {subLabel}
            </text>
          )}
        </g>
      </g>
    </g>
  );
};

