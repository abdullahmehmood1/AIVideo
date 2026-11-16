import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S0_ColdOpen")!;
const script = scriptData.scenes.find((s) => s.id === "S0_ColdOpen")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_RESIGNATION_FRAME = 360;

export const S0_ColdOpen: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S0_ColdOpen"
      sceneTag="COLD OPEN"
      title={script.title}
      factIds={["resignation_date", "mcap_drop", "as_of_date"]}
      variant="bars"
      showCrack
      seed="s0-cold-open"
    />
  );
};
