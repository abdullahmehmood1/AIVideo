import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S1_Promise")!;
const script = scriptData.scenes.find((s) => s.id === "S1_Promise")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_QUESTIONS_FRAME = 300;

export const S1_Promise: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S1_Promise"
      sceneTag={scriptData.channel}
      title={script.title}
      variant="globe"
      seed="s1-promise"
    />
  );
};
