import React, { useCallback, useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { Chart3DBars } from "../components/Chart3DBars";
import { LowerThird } from "../components/LowerThird";
import { StatCounter } from "../components/StatCounter";
import { SceneStage, type CameraPath } from "../design/SceneStage";
import { colors, easings, fonts, springs, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S0_ColdOpen")!;
const script = scriptData.scenes.find((s) => s.id === "S0_ColdOpen")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_BUILD_FRAMES = 240;
export const BEAT_RESIGNATION_FRAME = 380;

export const S0_ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const resignationFact = getFact("resignation_date");
  const mcapDropFact = getFact("mcap_drop");
  const asOfFact = getFact("as_of_date");

  // 60 bars across 3 depth rows (20 bars each) forming a market-value skyline
  const rows = useMemo(() => {
    const front = Array.from({ length: 20 }, (_, i) => {
      const centerBoost = 1 - Math.abs(i - 10) / 11;
      const base = 2.2 + centerBoost * 5.8 + random(`s0-f-${i}`) * 1.8;
      return i === 10 ? 9.6 : base;
    });
    const mid = Array.from({ length: 20 }, (_, i) => {
      const centerBoost = 1 - Math.abs(i - 9.5) / 12;
      return 1.8 + centerBoost * 4.5 + random(`s0-m-${i}`) * 1.6;
    });
    const back = Array.from({ length: 20 }, (_, i) => {
      return 1.4 + random(`s0-b-${i}`) * 4.2;
    });
    return { front, mid, back };
  }, []);

  const cameraPath: CameraPath = useCallback((f: number) => {
    const p = interpolate(f, [0, SCENE_DURATION_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    return {
      position: [-2.4 + p * 4.2, 4.6 - p * 1.1, 21.5 - p * 7.5],
      lookAt: [0, 2.6 - p * 0.6, -1.5],
      fov: 42,
    };
  }, []);

  const cardEnter = spring({
    frame: frame - 18,
    fps,
    config: springs.smooth,
  });

  const counterEnter = interpolate(
    frame,
    [BEAT_RESIGNATION_FRAME - 10, BEAT_RESIGNATION_FRAME + 20],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.outExpo,
    },
  );

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage
        cameraPath={cameraPath}
        fogNear={14}
        fogFar={44}
        accent={frame >= BEAT_RESIGNATION_FRAME - 30 ? colors.red : colors.amber}
        glow={0.35}
      >
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -3]}>
          <planeGeometry args={[64, 36]} />
          <meshStandardMaterial color={colors.slate} roughness={0.95} />
        </mesh>

        <group position={[0, 0, -5.2]}>
          <Chart3DBars
            values={rows.back}
            buildFrames={BEAT_BUILD_FRAMES}
            maxHeight={5.2}
            startFrame={0}
            collapse={{ atFrame: BEAT_RESIGNATION_FRAME + 18, staggerFrames: 3 }}
            barColor={colors.slateLight}
          />
        </group>

        <group position={[0.4, 0, -2.6]}>
          <Chart3DBars
            values={rows.mid}
            buildFrames={BEAT_BUILD_FRAMES}
            maxHeight={6.6}
            startFrame={10}
            collapse={{ atFrame: BEAT_RESIGNATION_FRAME + 8, staggerFrames: 3 }}
            barColor={colors.steel}
          />
        </group>

        <group position={[0, 0, 0]}>
          <Chart3DBars
            values={rows.front}
            buildFrames={BEAT_BUILD_FRAMES}
            maxHeight={8.2}
            startFrame={20}
            collapse={{ atFrame: BEAT_RESIGNATION_FRAME, staggerFrames: 3 }}
            crackBarIndex={10}
            crackFrames={32}
            barColor={colors.slateLight}
          />
        </group>
      </SceneStage>

      {/* Top-Left Dated News Card ("NOV 12, 2026" in Source Serif 4) */}
      <div
        style={{
          position: "absolute",
          left: 112,
          top: 78,
          padding: "26px 38px",
          backgroundColor: "rgba(34, 42, 53, 0.88)",
          borderLeft: `8px solid ${colors.red}`,
          opacity: cardEnter,
          transform: `translateY(${(1 - cardEnter) * 28}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: typeScale.heading,
            fontWeight: 700,
            color: colors.cream,
            lineHeight: 1.05,
          }}
        >
          {String(resignationFact.value).toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: typeScale.minText,
            fontWeight: 600,
            color: colors.creamDim,
            marginTop: 8,
          }}
        >
          {script.title} · {String(asOfFact.value)}
        </div>
      </div>

      {/* Lost Market Value Countdown Overlay */}
      <div
        style={{
          position: "absolute",
          right: 112,
          top: 86,
          padding: "26px 38px",
          backgroundColor: "rgba(22, 27, 34, 0.86)",
          border: `2px solid ${colors.red}`,
          opacity: counterEnter,
          transform: `translateY(${(1 - counterEnter) * 28}px)`,
        }}
      >
        <StatCounter
          from={0}
          value={-Number(mcapDropFact.value)}
          prefix="$"
          unit="T"
          decimals={2}
          label={String(asOfFact.value)}
          startFrame={BEAT_RESIGNATION_FRAME}
          durationFrames={90}
          color={colors.red}
        />
      </div>

      <LowerThird
        label={scriptData.whatNowLabels.interimTag}
        sublabel={String(asOfFact.value)}
        startFrame={BEAT_RESIGNATION_FRAME + 70}
        durationInFrames={460}
      />
    </AbsoluteFill>
  );
};
