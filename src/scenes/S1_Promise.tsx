import React, { useCallback } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { Callout } from "../components/Callout";
import { GlobeDots, globeRotation, latLonToVec3 } from "../components/GlobeDots";
import {
  projectToScreen,
  SceneStage,
  type CameraPath,
} from "../design/SceneStage";
import { colors, easings, fonts, springs, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S1_Promise")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_TITLE_FRAME = 45;
export const BEAT_Q1_FRAME = 240;
export const BEAT_Q2_FRAME = 420;
export const BEAT_Q3_FRAME = 580;

const GLOBE_RADIUS = 3.25;
const Q_COORDS: [number, number][] = [
  [37.3, -121.9], // San Jose
  [24.8, 121.0], // Hsinchu / Taiwan
  [38.9, -77.0], // Washington / Global
];

const rotY = (f: number) => globeRotation(f, 0.0028, -35);

export const S1_Promise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cameraPath: CameraPath = useCallback((f: number) => {
    const t = interpolate(f, [0, SCENE_DURATION_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    const angle = -0.22 + t * 0.44;
    const dist = 10.6 - t * 1.1;
    return {
      position: [
        Math.sin(angle) * dist,
        0.95 - t * 0.4,
        Math.cos(angle) * dist,
      ],
      lookAt: [0, 0.25, 0],
      fov: 40,
    };
  }, []);

  const brandEnter = spring({
    frame: frame - 8,
    fps,
    config: springs.smooth,
  });

  const titleEnter = spring({
    frame: frame - BEAT_TITLE_FRAME,
    fps,
    config: springs.smooth,
  });

  const titleDim = interpolate(frame, [BEAT_Q1_FRAME - 20, BEAT_Q1_FRAME + 20], [1, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cam = cameraPath(frame);
  const rY = rotY(frame);
  const p0 = projectToScreen(
    latLonToVec3(Q_COORDS[0][0], Q_COORDS[0][1], GLOBE_RADIUS, rY),
    cam,
  );
  const p1 = projectToScreen(
    latLonToVec3(Q_COORDS[1][0], Q_COORDS[1][1], GLOBE_RADIUS, rY),
    cam,
  );
  const p2 = projectToScreen(
    latLonToVec3(Q_COORDS[2][0], Q_COORDS[2][1], GLOBE_RADIUS, rY),
    cam,
  );

  const [headlineMain, headlineSub] = scriptData.workingTitle.split(": ");

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage cameraPath={cameraPath} fogNear={12} fogFar={38} glow={0.3}>
        <GlobeDots
          radius={GLOBE_RADIUS}
          rotationY={rotY}
          highlights={[
            { lat: Q_COORDS[0][0], lon: Q_COORDS[0][1], startFrame: BEAT_Q1_FRAME },
            { lat: Q_COORDS[1][0], lon: Q_COORDS[1][1], startFrame: BEAT_Q2_FRAME },
            {
              lat: Q_COORDS[2][0],
              lon: Q_COORDS[2][1],
              startFrame: BEAT_Q3_FRAME,
              color: colors.red,
            },
          ]}
        />
      </SceneStage>

      {/* Brand Lockup + Layered Documentary Title */}
      <div
        style={{
          position: "absolute",
          top: 74,
          left: 112,
          right: 112,
          pointerEvents: "none",
          opacity: titleDim,
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: typeScale.minText,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: colors.amber,
            textTransform: "uppercase",
            opacity: brandEnter,
            transform: `translateY(${(1 - brandEnter) * 20}px)`,
          }}
        >
          {scriptData.channel.toUpperCase()}
        </div>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: typeScale.hero,
            fontWeight: 700,
            color: colors.cream,
            margin: "12px 0 0 0",
            lineHeight: 1.04,
            opacity: titleEnter,
            transform: `translateY(${(1 - titleEnter) * 32}px)`,
          }}
        >
          {headlineMain}
        </h1>

        {headlineSub && (
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: typeScale.subtitle,
              fontWeight: 600,
              color: colors.steel,
              marginTop: 12,
              opacity: titleEnter,
              transform: `translateY(${(1 - titleEnter) * 38}px)`,
            }}
          >
            {headlineSub}
          </div>
        )}
      </div>

      {/* Three Question Chips Projected onto the Globe (Non-overlapping layout) */}
      <Callout
        x={Math.min(640, Math.max(480, p0.x))}
        y={Math.min(580, Math.max(480, p0.y))}
        label={scriptData.promiseQuestions[0]}
        side="left"
        startFrame={BEAT_Q1_FRAME}
      />
      <Callout
        x={Math.min(920, Math.max(760, p1.x))}
        y={Math.min(780, Math.max(680, p1.y))}
        label={scriptData.promiseQuestions[1]}
        side="right"
        startFrame={BEAT_Q2_FRAME}
      />
      <Callout
        x={Math.min(1380, Math.max(1180, p2.x))}
        y={Math.min(560, Math.max(460, p2.y))}
        label={scriptData.promiseQuestions[2]}
        side="left"
        startFrame={BEAT_Q3_FRAME}
      />
    </AbsoluteFill>
  );
};
