import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S9_WhatNow")!;
const script = scriptData.scenes.find((s) => s.id === "S9_WhatNow")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_FRACTURE_FRAME = 1500;

export const S9_WhatNow: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S9_WhatNow"
      sceneTag="ACT VIII"
      title={script.title}
      factIds={["resignation_date", "as_of_date"]}
      variant="monolith"
      showCrack
      seed="s9-what-now"
    />
  );
};
