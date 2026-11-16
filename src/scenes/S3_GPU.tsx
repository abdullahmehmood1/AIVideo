import React, { useCallback } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { Callout } from "../components/Callout";
import { CoreGrid, CpuBlocks, WireSphere } from "../components/CoreGrid";
import { LowerThird } from "../components/LowerThird";
import {
  projectToScreen,
  SceneStage,
  type CameraPath,
} from "../design/SceneStage";
import { colors, easings, fonts, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S3_GPU")!;
const script = scriptData.scenes.find((s) => s.id === "S3_GPU")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_GPU_GRID_FRAME = 260;
export const BEAT_SPHERE_FRAME = 720;

export const S3_GPU: React.FC = () => {
  const frame = useCurrentFrame();
  const coresFact = getFact("cpu_vs_gpu_cores");
  const geforceFact = getFact("geforce_256_year");

  const cameraPath: CameraPath = useCallback((f: number) => {
    const p = interpolate(f, [0, SCENE_DURATION_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    const angle = -0.18 + p * 0.36;
    const dist = 10.2 + p * 2.4;
    return {
      position: [
        Math.sin(angle) * dist,
        0.5 + Math.sin(p * Math.PI) * 0.7,
        Math.cos(angle) * dist,
      ],
      lookAt: [0.2, 0, 0],
      fov: 42,
    };
  }, []);

  const cam = cameraPath(frame);
  const cpuScreen = projectToScreen([-4.5, 1.5, 0], cam);
  const gpuScreen = projectToScreen([0.4, 1.8, 0], cam);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage cameraPath={cameraPath} fogNear={15} fogFar={42} glow={0.35}>
        <CpuBlocks
          position={[-4.5, -0.2, 0]}
          width={2.5}
          height={4.2}
          framesPerBlock={26}
          startFrame={0}
        />

        <CoreGrid
          position={[0.4, -0.2, 0]}
          size={4.3}
          mode="sweep"
          waveSpeed={34}
          startFrame={BEAT_GPU_GRID_FRAME}
        />

        <WireSphere
          position={[4.8, -0.2, 0.2]}
          radius={1.45}
          startFrame={BEAT_SPHERE_FRAME}
          paintFrames={420}
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

      {/* Projected Callouts for CPU vs GPU */}
      <Callout
        x={Math.max(260, Math.min(720, cpuScreen.x))}
        y={Math.max(280, Math.min(520, cpuScreen.y))}
        label={scriptData.gpuLabels.cpuSide}
        side="right"
        startFrame={40}
      />

      <Callout
        x={Math.max(820, Math.min(1360, gpuScreen.x))}
        y={Math.max(280, Math.min(520, gpuScreen.y))}
        label={scriptData.gpuLabels.gpuSide}
        side="right"
        startFrame={BEAT_GPU_GRID_FRAME + 30}
      />

      <LowerThird
        label={String(coresFact.value)}
        sublabel={`GeForce 256 (${String(geforceFact.value)})`}
        startFrame={BEAT_SPHERE_FRAME}
        durationInFrames={SCENE_DURATION_FRAMES - BEAT_SPHERE_FRAME - 30}
      />
    </AbsoluteFill>
  );
};
