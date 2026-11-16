import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S3_GPU")!;
const script = scriptData.scenes.find((s) => s.id === "S3_GPU")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_GPU_GRID_FRAME = 420;

export const S3_GPU: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S3_GPU"
      sceneTag="ACT II"
      title={script.title}
      factIds={["geforce_256_year", "cpu_vs_gpu_cores"]}
      variant="cores"
      seed="s3-gpu"
    />
  );
};
