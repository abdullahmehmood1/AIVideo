import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Scene3D } from "../components/ThreeDScene/Scene3D";
import { CaptionsOverlay, defaultCaptions } from "../components/Captions/CaptionsOverlay";
import { AudioTrack } from "../components/Audio/AudioTrack";

export const threeDAnimationSchema = z.object({
  title: z.string().default("3D MOTION UNIVERSE"),
  subtitle: z.string().default("Rendered in Cloud GPU with Remotion & Three.js"),
  audioUrl: z.string().optional(),
});

export type ThreeDAnimationProps = z.infer<typeof threeDAnimationSchema>;

export const ThreeDAnimation: React.FC<ThreeDAnimationProps> = ({
  title = "3D MOTION UNIVERSE",
  subtitle = "Rendered in Cloud GPU with Remotion & Three.js",
  audioUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Intro Title animation
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const headerOpacity = interpolate(frame, [0, 20, 200, 230], [0, 1, 1, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030712",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background radial gradient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, rgba(59, 130, 246, 0.18) 0%, rgba(15, 23, 42, 0.95) 75%)",
          zIndex: 1,
        }}
      />

      {/* Three.js 3D Canvas */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
        <Scene3D />
      </div>

      {/* Top Header / Branding HUD */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 30,
          opacity: headerOpacity,
          transform: `translateY(${(1 - titleSpring) * -30}px)`,
          textAlign: "center",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.35em",
            fontWeight: 800,
            color: "#38bdf8",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#94a3b8",
            fontWeight: 400,
            letterSpacing: "0.05em",
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Captions Overlay */}
      <CaptionsOverlay captions={defaultCaptions} />

      {/* Optional Audio Track */}
      {audioUrl && <AudioTrack src={audioUrl} />}
    </AbsoluteFill>
  );
};

