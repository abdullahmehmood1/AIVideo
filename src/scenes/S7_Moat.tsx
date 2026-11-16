import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S7_Moat")!;
const script = scriptData.scenes.find((s) => s.id === "S7_Moat")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_SUPPLY_CHAIN_FRAME = 900;

export const S7_Moat: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S7_Moat"
      sceneTag="ACT VI"
      title={script.title}
      factIds={["mellanox_year", "mellanox_value"]}
      variant="globe"
      seed="s7-moat"
    />
  );
};
