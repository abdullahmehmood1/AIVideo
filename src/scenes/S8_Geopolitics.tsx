import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S8_Geopolitics")!;
const script = scriptData.scenes.find((s) => s.id === "S8_Geopolitics")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_EXPORT_CONTROLS_FRAME = 360;

export const S8_Geopolitics: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S8_Geopolitics"
      sceneTag="ACT VII"
      title={script.title}
      factIds={["export_controls_date", "doj_statement", "as_of_date"]}
      variant="globe"
      seed="s8-geopolitics"
    />
  );
};
