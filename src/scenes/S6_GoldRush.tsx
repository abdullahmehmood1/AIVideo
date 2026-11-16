import React, { useCallback } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { formatFactValue, getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { Chart3DBars } from "../components/Chart3DBars";
import { aisleCamera, DataCenterAisle } from "../components/DataCenterAisle";
import { LowerThird } from "../components/LowerThird";
import { StatCounter } from "../components/StatCounter";
import { SceneStage, type CameraPath } from "../design/SceneStage";
import { colors, easings, fonts, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S6_GoldRush")!;
const script = scriptData.scenes.find((s) => s.id === "S6_GoldRush")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_STAIRCASE_FRAME = 1080;
export const BEAT_CRACK_FRAME = 2040;

const STAIR_VALUES = [1, 2, 3, 4, 5];

export const S6_GoldRush: React.FC = () => {
  const frame = useCurrentFrame();
  const h100Fact = getFact("h100_year");
  const inStaircase = frame >= BEAT_STAIRCASE_FRAME;

  const cameraPath: CameraPath = useCallback((f: number) => {
    if (f < BEAT_STAIRCASE_FRAME) {
      return aisleCamera(f, BEAT_STAIRCASE_FRAME);
    }
    const p = interpolate(
      f,
      [BEAT_STAIRCASE_FRAME, SCENE_DURATION_FRAMES],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easings.inOut,
      },
    );
    return {
      position: [-4.5 + p * 6.5, 3.6 + p * 1.4, 14.5 - p * 2.8],
      lookAt: [0.6, 2.8, 0],
      fov: 42,
    };
  }, []);

  // Determine which market-cap step is currently highlighted
  const stairLocal = Math.max(0, frame - BEAT_STAIRCASE_FRAME);
  const stepIdx = Math.min(4, Math.floor(stairLocal / 190));
  const stepSpec = scriptData.goldRushLabels.milestones[stepIdx];
  const stepFact = getFact(stepSpec.factId);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage
        cameraPath={cameraPath}
        fogNear={inStaircase ? 14 : 10}
        fogFar={inStaircase ? 44 : 50}
        accent={frame >= BEAT_CRACK_FRAME - 60 ? colors.red : colors.amber}
        glow={0.38}
      >
        {!inStaircase ? (
          <DataCenterAisle startFrame={0} />
        ) : (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
              <planeGeometry args={[56, 36]} />
              <meshStandardMaterial color={colors.slate} roughness={0.95} />
            </mesh>
            <group scale={[1.65, 1, 1.8]}>
              <Chart3DBars
                values={STAIR_VALUES}
                buildFrames={920}
                maxHeight={6.4}
                startFrame={BEAT_STAIRCASE_FRAME}
                crackBarIndex={4}
                crackFrames={72}
                barColor={colors.slateLight}
              />
            </group>
          </group>
        )}
      </SceneStage>

      {/* Top Title Header */}
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

      {/* Market-Cap Staircase Milestone Readout */}
      {inStaircase && (
        <div
          style={{
            position: "absolute",
            right: 112,
            top: 84,
            padding: "28px 40px",
            backgroundColor: "rgba(34, 42, 53, 0.9)",
            borderLeft: `8px solid ${stepIdx === 4 && frame >= BEAT_CRACK_FRAME - 60 ? colors.red : colors.amber}`,
          }}
        >
          <StatCounter
            key={stepSpec.factId}
            from={stepIdx === 0 ? 0 : stepIdx}
            value={Number(stepFact.value)}
            prefix="$"
            unit="T"
            decimals={0}
            label={stepSpec.date}
            startFrame={BEAT_STAIRCASE_FRAME + stepIdx * 190}
            durationFrames={50}
            color={
              stepIdx === 4 && frame >= BEAT_CRACK_FRAME - 60
                ? colors.red
                : colors.amber
            }
          />
        </div>
      )}

      {/* Staircase Step Pills at Bottom-Left */}
      {inStaircase ? (
        <div
          style={{
            position: "absolute",
            left: 112,
            bottom: 200,
            display: "flex",
            gap: 20,
          }}
        >
          {scriptData.goldRushLabels.milestones.map((m, idx) => {
            const f = getFact(m.factId);
            const reached = idx <= stepIdx;
            return (
              <div
                key={m.factId}
                style={{
                  padding: "14px 24px",
                  backgroundColor: reached ? colors.slate : "rgba(22, 27, 34, 0.6)",
                  border: `2px solid ${idx === 4 && frame >= BEAT_CRACK_FRAME - 60 ? colors.red : reached ? colors.amber : colors.slateLight}`,
                  opacity: reached ? 1 : 0.45,
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: typeScale.minText,
                    fontWeight: 700,
                    color:
                      idx === 4 && frame >= BEAT_CRACK_FRAME - 60
                        ? colors.red
                        : colors.cream,
                  }}
                >
                  {formatFactValue(f)}
                </div>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: typeScale.minText,
                    color: colors.steel,
                  }}
                >
                  {m.date}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <LowerThird
          label={scriptData.goldRushLabels.aisleLabel}
          sublabel={`H100 (${String(h100Fact.value)})`}
          startFrame={30}
          durationInFrames={BEAT_STAIRCASE_FRAME - 60}
        />
      )}
    </AbsoluteFill>
  );
};
