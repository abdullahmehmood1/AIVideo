import React from "react";
import { Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export interface AudioTrackProps {
  src?: string;
  volume?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  src,
  volume = 0.8,
  fadeInFrames = 30,
  fadeOutFrames = 30,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // If no audio source is provided, skip silently
  if (!src) {
    return null;
  }

  // Calculate smooth volume envelope (Fade In -> Sustain -> Fade Out)
  const fadeIn = interpolate(frame, [0, fadeInFrames], [0, volume], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [volume, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const calculatedVolume = Math.min(fadeIn, fadeOut);

  // If local file path, resolve with staticFile
  const resolvedSrc = src.startsWith("http://") || src.startsWith("https://")
    ? src
    : staticFile(src);

  return <Audio src={resolvedSrc} volume={calculatedVolume} />;
};

