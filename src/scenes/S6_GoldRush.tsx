import React from "react";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { SceneScaffold3D } from "./SceneScaffold3D";

const timing = timingData.scenes.find((s) => s.id === "S6_GoldRush")!;
const script = scriptData.scenes.find((s) => s.id === "S6_GoldRush")!;
export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_STAIRCASE_FRAME = 1080;

export const S6_GoldRush: React.FC = () => {
  return (
    <SceneScaffold3D
      sceneId="S6_GoldRush"
      sceneTag="ACT V"
      title={script.title}
      factIds={["mcap_1t", "mcap_3t", "mcap_5t"]}
      variant="racks"
      showCrack
      seed="s6-gold-rush"
    />
  );
};
