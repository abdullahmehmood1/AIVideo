import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S2_Origins")!;
const script = scriptData.scenes.find((s) => s.id === "S2_Origins")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_CASH_CRISIS_FRAME = 900;

export const S2_Origins: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S2_Origins"
      sceneTag="ACT I"
      title={script.title}
      factIds={["founded_year", "early_capital", "ipo_date"]}
      variant="ribbon"
      seed="s2-origins"
    />
  );
};
