import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S4_CUDA")!;
const script = scriptData.scenes.find((s) => s.id === "S4_CUDA")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_SWITCHING_COST_FRAME = 1050;

export const S4_CUDA: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S4_CUDA"
      sceneTag="ACT III"
      title={script.title}
      factIds={["cuda_announced", "cuda_released"]}
      variant="tower"
      seed="s4-cuda"
    />
  );
};
