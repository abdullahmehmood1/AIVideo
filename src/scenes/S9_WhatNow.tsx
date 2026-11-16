import React, { useCallback } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { LowerThird } from "../components/LowerThird";
import { competitorPositions, Monolith } from "../components/Monolith";
import {
  projectToScreen,
  SceneStage,
  type CameraPath,
} from "../design/SceneStage";
import { colors, easings, fonts, springs, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S9_WhatNow")!;
const script = scriptData.scenes.find((s) => s.id === "S9_WhatNow")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_CRACKS_START = 220;
export const BEAT_COMPETITORS_FRAME = 420;
export const BEAT_FRACTURE_FRAME = 1320;
export const BEAT_CLOSING_CARD_FRAME = 1580;

const COMP_HEIGHTS = [2.8, 3.4, 2.5, 3.1];

export const S9_WhatNow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const asOfFact = getFact("as_of_date");

  const cameraPath: CameraPath = useCallback((f: number) => {
    const p = interpolate(f, [0, BEAT_FRACTURE_FRAME], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    const pullBack = interpolate(
      f,
      [BEAT_FRACTURE_FRAME, SCENE_DURATION_FRAMES],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easings.outExpo,
      },
    );
    return {
      position: [
        -2.2 + p * 4.4 - pullBack * 2.2,
        2.8 + p * 0.6 + pullBack * 0.4,
        13.2 - p * 1.4 + pullBack * 4.2,
      ],
      lookAt: [0, 3.0, 0],
      fov: 42,
    };
  }, []);

  const cam = cameraPath(frame);
  const compAnchors = competitorPositions(4, COMP_HEIGHTS);

  const closingEnter = spring({
    frame: frame - BEAT_CLOSING_CARD_FRAME,
    fps,
    config: springs.smooth,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage
        cameraPath={cameraPath}
        fogNear={14}
        fogFar={46}
        accent={frame >= BEAT_FRACTURE_FRAME - 60 ? colors.red : colors.amber}
        glow={0.38}
      >
        <Monolith
          crackStartFrame={BEAT_CRACKS_START}
          splitFrame={BEAT_FRACTURE_FRAME}
          splitFrames={78}
          competitors={4}
          competitorHeights={COMP_HEIGHTS}
          riseStart={BEAT_COMPETITORS_FRAME}
        />
      </SceneStage>

      {/* Top Section Header */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 112,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: typeScale.heading,
            fontWeight: 700,
            color: colors.cream,
          }}
        >
          {script.title}
        </div>
      </div>

      {/* Competitor Labels (Non-overlapping left/right staggered cards) */}
      {frame >= BEAT_COMPETITORS_FRAME + 40 &&
        frame < BEAT_CLOSING_CARD_FRAME &&
        compAnchors.map((pos, idx) => {
          const proj = projectToScreen([pos[0], pos[1] + 0.4, pos[2]], cam);
          void proj;
          const appear = interpolate(
            frame - (BEAT_COMPETITORS_FRAME + 40 + idx * 36),
            [0, 24],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          if (appear <= 0) return null;
          const isLeft = idx % 2 === 0;
          const row = Math.floor(idx / 2);
          return (
            <div
              key={scriptData.whatNowLabels.competitors[idx]}
              style={{
                position: "absolute",
                left: isLeft ? 112 : undefined,
                right: isLeft ? undefined : 112,
                top: 280 + row * 130,
                padding: "14px 28px",
                backgroundColor: "rgba(34, 42, 53, 0.9)",
                borderLeft: isLeft ? `6px solid ${colors.steel}` : undefined,
                borderRight: !isLeft ? `6px solid ${colors.steel}` : undefined,
                fontFamily: fonts.sans,
                fontSize: typeScale.minText,
                fontWeight: 600,
                color: colors.cream,
                opacity: appear,
                whiteSpace: "nowrap",
              }}
            >
              {scriptData.whatNowLabels.competitors[idx]}
            </div>
          );
        })}

      {/* Closing Line Card ("WORLD RUPTURE" + "Not financial advice.") */}
      {frame >= BEAT_CLOSING_CARD_FRAME ? (
        <div
          style={{
            position: "absolute",
            right: 112,
            top: 84,
            padding: "28px 42px",
            backgroundColor: "rgba(22, 27, 34, 0.92)",
            borderLeft: `8px solid ${colors.red}`,
            opacity: closingEnter,
            transform: `translateY(${(1 - closingEnter) * 28}px)`,
          }}
        >
          <div
            style={{
              fontFamily: fonts.serif,
              fontSize: typeScale.subtitle,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: colors.cream,
            }}
          >
            {scriptData.channel.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: typeScale.minText,
              color: colors.steel,
              marginTop: 8,
            }}
          >
            {scriptData.disclaimer}
          </div>
        </div>
      ) : (
        <LowerThird
          label={scriptData.whatNowLabels.interimTag}
          sublabel={String(asOfFact.value)}
          startFrame={30}
          durationInFrames={BEAT_FRACTURE_FRAME - 60}
        />
      )}
    </AbsoluteFill>
  );
};
