import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S5_DeepLearning")!;
const script = scriptData.scenes.find((s) => s.id === "S5_DeepLearning")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_ALEXNET_FRAME = 240;

export const S5_DeepLearning: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S5_DeepLearning"
      sceneTag="ACT IV"
      title={script.title}
      factIds={["alexnet_year", "alexnet_error", "chatgpt_date"]}
      variant="net"
      seed="s5-deep-learning"
    />
  );
};
