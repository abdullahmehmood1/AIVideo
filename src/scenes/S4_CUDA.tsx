import React, { useCallback } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { Callout } from "../components/Callout";
import { LineChart2D } from "../components/LineChart2D";
import { LowerThird } from "../components/LowerThird";
import {
  LAYER_NAMES,
  layerPositions,
  LayerTower,
} from "../components/Monolith";
import { MilestoneCard } from "../components/TimelineRibbon";
import {
  projectToScreen,
  SceneStage,
  type CameraPath,
} from "../design/SceneStage";
import { colors, easings } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S4_CUDA")!;
const script = scriptData.scenes.find((s) => s.id === "S4_CUDA")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_TOWER_BUILD = 540;
export const BEAT_CUDA_GLOW_FRAME = 680;
export const BEAT_CHART_FRAME = 820;
export const BEAT_SWITCHING_COST_FRAME = 1320;

// Schematic curve (no invented numbers): years of flat doubt -> late adoption climb
const SCHEMATIC_ADOPTION = [
  { x: 0, y: 1.0 },
  { x: 1, y: 1.05 },
  { x: 2, y: 1.08 },
  { x: 3, y: 1.12 },
  { x: 4, y: 1.25 },
  { x: 5, y: 1.6 },
  { x: 6, y: 2.4 },
  { x: 7, y: 4.2 },
  { x: 8, y: 7.5 },
];

export const S4_CUDA: React.FC = () => {
  const frame = useCurrentFrame();
  const cudaAnnounced = getFact("cuda_announced");
  const cudaReleased = getFact("cuda_released");

  const cameraPath: CameraPath = useCallback((f: number) => {
    const p = interpolate(f, [0, SCENE_DURATION_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    const angle = -0.55 + p * 0.85;
    const dist = 13.5 - p * 1.2;
    return {
      position: [
        Math.sin(angle) * dist - 1.8,
        1.6 + p * 3.4,
        Math.cos(angle) * dist,
      ],
      lookAt: [0.8, 1.8 + p * 0.8, 0],
      fov: 42,
    };
  }, []);

  const cam = cameraPath(frame);

  // Pick the active layer callout as the tower builds
  const activeLayerIdx =
    frame < 240 ? 0 : frame < 420 ? 1 : frame < 620 ? 2 : 3;
  const layerAnchor = layerPositions[activeLayerIdx];
  const layerScreen = projectToScreen(layerAnchor, cam);
  const wallScreen = projectToScreen([-4.2, 2.6, 3.7], cam);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage cameraPath={cameraPath} fogNear={14} fogFar={44} glow={0.38}>
        <LayerTower
          startFrame={20}
          buildFrames={BEAT_TOWER_BUILD}
          cudaGlowFrame={BEAT_CUDA_GLOW_FRAME}
          wallStartFrame={BEAT_SWITCHING_COST_FRAME}
          wallFrames={480}
        />
      </SceneStage>

      <MilestoneCard
        date={`${String(cudaAnnounced.value)} → ${String(cudaReleased.value)}`}
        title={script.title}
        startFrame={16}
        x={112}
        y={78}
      />

      {/* Layer Callout (visible during tower build before chart overlay) */}
      {frame < BEAT_CHART_FRAME && (
        <Callout
          x={Math.max(520, Math.min(1220, layerScreen.x))}
          y={Math.max(320, Math.min(700, layerScreen.y))}
          label={LAYER_NAMES[activeLayerIdx]}
          side="right"
          startFrame={80}
        />
      )}

      {/* Switching Cost Wall Callout */}
      {frame >= BEAT_SWITCHING_COST_FRAME + 60 && (
        <Callout
          x={Math.max(220, Math.min(440, wallScreen.x))}
          y={Math.max(520, Math.min(720, wallScreen.y))}
          label={scriptData.cudaLabels.wallLabel}
          side="right"
          startFrame={BEAT_SWITCHING_COST_FRAME + 60}
        />
      )}

      {/* Schematic 2D Line Chart of Early Doubt vs Adoption */}
      {frame >= BEAT_CHART_FRAME && (
        <div
          style={{
            position: "absolute",
            right: 112,
            top: 250,
            padding: "28px 34px",
            backgroundColor: "rgba(34, 42, 53, 0.9)",
            border: `2px solid ${colors.steel}`,
          }}
        >
          <LineChart2D
            points={SCHEMATIC_ADOPTION}
            width={620}
            height={320}
            drawFrames={480}
            startFrame={BEAT_CHART_FRAME}
            label={scriptData.cudaLabels.chartTitle}
          />
        </div>
      )}

      <LowerThird
        label={scriptData.cudaLabels.wallLabel}
        sublabel={`CUDA (${String(cudaReleased.value)})`}
        startFrame={BEAT_CUDA_GLOW_FRAME}
        durationInFrames={SCENE_DURATION_FRAMES - BEAT_CUDA_GLOW_FRAME - 40}
      />
    </AbsoluteFill>
  );
};
