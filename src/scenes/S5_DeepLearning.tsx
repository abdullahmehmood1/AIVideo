import React, { useCallback } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { formatFactValue, getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { NeuralNet3D } from "../components/NeuralNet3D";
import { SceneStage, type CameraPath } from "../design/SceneStage";
import { colors, easings, fonts, springs, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S5_DeepLearning")!;
const script = scriptData.scenes.find((s) => s.id === "S5_DeepLearning")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_ALEXNET_FRAME = 220;
export const BEAT_COMPRESS_FRAME = 1360;
export const BEAT_TIMELINE_FRAME = 1440;

export const S5_DeepLearning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const alexnetErr = getFact("alexnet_error");
  const runnerUpErr = getFact("alexnet_runnerup_error");

  const cameraPath: CameraPath = useCallback((f: number) => {
    const p = interpolate(f, [0, BEAT_COMPRESS_FRAME], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    const post = interpolate(
      f,
      [BEAT_COMPRESS_FRAME, SCENE_DURATION_FRAMES],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easings.outExpo,
      },
    );
    return {
      position: [
        -3.2 + p * 5.2 - post * 2.0,
        0.9 + Math.sin(p * Math.PI) * 0.8,
        14.2 - p * 4.8 + post * 3.5,
      ],
      lookAt: [0, 0, 0],
      fov: 42,
    };
  }, []);

  const barProgress = interpolate(
    frame,
    [BEAT_ALEXNET_FRAME, BEAT_ALEXNET_FRAME + 80],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.outExpo,
    },
  );

  const barExit = interpolate(
    frame,
    [BEAT_COMPRESS_FRAME - 40, BEAT_COMPRESS_FRAME],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const alexVal = Number(alexnetErr.value);
  const runnerVal = Number(runnerUpErr.value);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage cameraPath={cameraPath} fogNear={14} fogFar={42} glow={0.4}>
        <NeuralNet3D
          startFrame={0}
          compressAt={BEAT_COMPRESS_FRAME}
          compressFrames={64}
        />
      </SceneStage>

      {/* Scene Title Header */}
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

      {/* ImageNet Top-5 Error 2D Bar Comparison (15.3% vs 26.2%) */}
      {frame >= BEAT_ALEXNET_FRAME && frame < BEAT_COMPRESS_FRAME && (
        <div
          style={{
            position: "absolute",
            right: 112,
            top: 220,
            width: 640,
            padding: "32px 38px",
            backgroundColor: "rgba(34, 42, 53, 0.9)",
            border: `2px solid ${colors.amber}`,
            opacity: barProgress * barExit,
            transform: `translateY(${(1 - barProgress) * 28}px)`,
          }}
        >
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: typeScale.minText,
              fontWeight: 700,
              color: colors.cream,
              marginBottom: 24,
            }}
          >
            {scriptData.deepLearningLabels.comparisonTitle}
          </div>

          {/* AlexNet Bar */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: fonts.sans,
                fontSize: typeScale.minText,
                fontWeight: 600,
                color: colors.amber,
                marginBottom: 8,
              }}
            >
              <span>{scriptData.deepLearningLabels.alexnetTag}</span>
              <span style={{ fontFamily: fonts.mono }}>
                {formatFactValue(alexnetErr)}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 26,
                backgroundColor: colors.bgDeep,
              }}
            >
              <div
                style={{
                  width: `${(alexVal / 30) * 100 * barProgress}%`,
                  height: "100%",
                  backgroundColor: colors.amber,
                }}
              />
            </div>
          </div>

          {/* Runner-Up Bar */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: fonts.sans,
                fontSize: typeScale.minText,
                fontWeight: 600,
                color: colors.steel,
                marginBottom: 8,
              }}
            >
              <span>{scriptData.deepLearningLabels.runnerUpTag}</span>
              <span style={{ fontFamily: fonts.mono }}>
                {formatFactValue(runnerUpErr)}
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: 26,
                backgroundColor: colors.bgDeep,
              }}
            >
              <div
                style={{
                  width: `${(runnerVal / 30) * 100 * barProgress}%`,
                  height: "100%",
                  backgroundColor: colors.steel,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Post-Compression 4-Milestone Expansion Cards (2012, 2016, 2017, 2022) */}
      {frame >= BEAT_TIMELINE_FRAME && (
        <div
          style={{
            position: "absolute",
            left: 112,
            right: 112,
            top: 260,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
          }}
        >
          {scriptData.deepLearningLabels.milestones.map((m, idx) => {
            const fact = getFact(m.factId);
            const cardIn = spring({
              frame: frame - (BEAT_TIMELINE_FRAME + idx * 36),
              fps,
              config: springs.snappy,
            });
            return (
              <div
                key={m.factId}
                style={{
                  padding: "26px 34px",
                  backgroundColor: "rgba(34, 42, 53, 0.9)",
                  borderLeft: `8px solid ${colors.amber}`,
                  opacity: cardIn,
                  transform: `translateY(${(1 - cardIn) * 28}px) scale(${0.96 + 0.04 * cardIn})`,
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: typeScale.minText,
                    fontWeight: 700,
                    color: colors.amber,
                  }}
                >
                  {String(fact.value)}
                </div>
                <div
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: typeScale.subtitle,
                    fontWeight: 700,
                    color: colors.cream,
                    marginTop: 6,
                  }}
                >
                  {m.shortLabel}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
