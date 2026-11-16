import React, { useCallback } from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { ChipDie } from "../components/ChipDie";
import { LowerThird } from "../components/LowerThird";
import { StatCounter } from "../components/StatCounter";
import {
  MilestoneCard,
  ribbonPoint,
  TimelineRibbon3D,
} from "../components/TimelineRibbon";
import { SceneStage, type CameraPath } from "../design/SceneStage";
import { colors, easings, fonts, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S2_Origins")!;
const script = scriptData.scenes.find((s) => s.id === "S2_Origins")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_NV1_FRAME = 420;
export const BEAT_CASH_CRISIS_FRAME = 900;
export const BEAT_RIVA_FRAME = 1380;
export const BEAT_IPO_FRAME = 1800;
export const BEAT_GEFORCE_FRAME = 2050;

const MILESTONE_T = [0.08, 0.24, 0.42, 0.6, 0.78, 0.92];
const MILESTONE_FRAMES = [
  20,
  BEAT_NV1_FRAME,
  BEAT_CASH_CRISIS_FRAME,
  BEAT_RIVA_FRAME,
  BEAT_IPO_FRAME,
  BEAT_GEFORCE_FRAME,
];

export const S2_Origins: React.FC = () => {
  const frame = useCurrentFrame();
  const earlyCapFact = getFact("early_capital");

  const travelT = interpolate(frame, [0, SCENE_DURATION_FRAMES], [0.04, 0.92], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  const cameraPath: CameraPath = useCallback((f: number) => {
    const u = interpolate(f, [0, SCENE_DURATION_FRAMES], [0.04, 0.92], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    const pt = ribbonPoint(u);
    const ahead = ribbonPoint(Math.min(1, u + 0.08));
    return {
      position: [pt[0] - 2.4, pt[1] + 2.8, pt[2] + 5.8],
      lookAt: [ahead[0] + 0.9, ahead[1] + 0.4, ahead[2]],
      fov: 42,
    };
  }, []);

  // Morph ChipDie density: sparse NV1 (0.14) -> denser RIVA 128 (0.55) -> dense GeForce 256 (0.98)
  const density = interpolate(
    frame,
    [0, BEAT_NV1_FRAME, BEAT_RIVA_FRAME, BEAT_GEFORCE_FRAME, SCENE_DURATION_FRAMES],
    [0.12, 0.16, 0.56, 0.98, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Cash runway drains toward zero during 1996-97 crisis, then refills on RIVA 128
  const cashLevel = interpolate(
    frame,
    [
      0,
      BEAT_NV1_FRAME,
      BEAT_CASH_CRISIS_FRAME + 220,
      BEAT_RIVA_FRAME + 180,
      SCENE_DURATION_FRAMES,
    ],
    [0.78, 0.52, 0.07, 0.88, 0.95],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const chipAnchor = ribbonPoint(Math.min(1, travelT + 0.06));

  // Determine current active milestone index
  let activeIdx = 0;
  for (let i = 0; i < MILESTONE_FRAMES.length; i++) {
    if (frame >= MILESTONE_FRAMES[i]) {
      activeIdx = i;
    }
  }
  const activeSpec = scriptData.originsMilestones[activeIdx];
  const activeFact = getFact(activeSpec.factId);

  const dieLabel =
    frame < BEAT_RIVA_FRAME
      ? scriptData.originsLabels.nv1
      : frame < BEAT_GEFORCE_FRAME
        ? scriptData.originsLabels.riva128
        : scriptData.originsLabels.geforce256;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage
        cameraPath={cameraPath}
        fogNear={10}
        fogFar={38}
        accent={cashLevel < 0.2 ? colors.red : colors.amber}
        glow={0.35}
      >
        <TimelineRibbon3D
          milestones={MILESTONE_T}
          startFrame={0}
          drawFrames={Math.round(SCENE_DURATION_FRAMES * 0.82)}
        />

        <group
          position={[chipAnchor[0] + 2.1, chipAnchor[1] + 0.55, chipAnchor[2] - 0.4]}
        >
          <ChipDie
            density={density}
            size={3.3}
            glow={0.45 + density * 0.45}
            rotation={[0.48, frame * 0.004, -0.15]}
            startFrame={10}
          />
        </group>
      </SceneStage>

      {/* Active Milestone Card */}
      <MilestoneCard
        key={activeSpec.factId}
        date={String(activeFact.value)}
        title={activeSpec.shortLabel}
        startFrame={MILESTONE_FRAMES[activeIdx]}
        x={112}
        y={78}
      />

      {/* Early Startup Capital Counter during Founding Beat */}
      {frame < BEAT_NV1_FRAME && (
        <div
          style={{
            position: "absolute",
            right: 112,
            top: 84,
            padding: "22px 34px",
            backgroundColor: "rgba(34, 42, 53, 0.86)",
            border: `2px solid ${colors.steel}`,
          }}
        >
          <StatCounter
            from={0}
            value={Number(earlyCapFact.value)}
            prefix="$"
            decimals={0}
            label={script.title}
            startFrame={24}
            durationFrames={70}
            color={colors.amber}
          />
        </div>
      )}

      {/* Cash Runway Drain / Refill Bar */}
      <div
        style={{
          position: "absolute",
          right: 112,
          bottom: 210,
          width: 520,
          padding: "22px 30px",
          backgroundColor: "rgba(34, 42, 53, 0.88)",
          border: `2px solid ${cashLevel < 0.2 ? colors.red : colors.steel}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: fonts.sans,
            fontSize: typeScale.minText,
            fontWeight: 600,
            color: colors.cream,
            marginBottom: 14,
          }}
        >
          <span>{scriptData.originsLabels.cashRunway}</span>
          <span
            style={{
              fontFamily: fonts.mono,
              color: cashLevel < 0.2 ? colors.red : colors.amber,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(cashLevel * 100)}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 22,
            backgroundColor: colors.bgDeep,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.round(cashLevel * 100)}%`,
              height: "100%",
              backgroundColor: cashLevel < 0.2 ? colors.red : colors.amber,
            }}
          />
        </div>
      </div>

      <LowerThird
        label={dieLabel}
        sublabel={script.title}
        startFrame={30}
        durationInFrames={SCENE_DURATION_FRAMES - 60}
      />
    </AbsoluteFill>
  );
};
