import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { ENABLE_AUDIO_PREVIEW } from "./config";
import timingData from "./data/timing.json";
import { Caption } from "./components/Caption";
import { crackWipe } from "./design/CrackWipe";
import { Grain } from "./design/Grain";
import { colors } from "./design/tokens";
import { Vignette } from "./design/Vignette";
import { S0_ColdOpen } from "./scenes/S0_ColdOpen";
import { S1_Promise } from "./scenes/S1_Promise";
import { S2_Origins } from "./scenes/S2_Origins";
import { S3_GPU } from "./scenes/S3_GPU";
import { S4_CUDA } from "./scenes/S4_CUDA";
import { S5_DeepLearning } from "./scenes/S5_DeepLearning";
import { S6_GoldRush } from "./scenes/S6_GoldRush";
import { S7_Moat } from "./scenes/S7_Moat";
import { S8_Geopolitics } from "./scenes/S8_Geopolitics";
import { S9_WhatNow } from "./scenes/S9_WhatNow";
import { EndScreen } from "./scenes/EndScreen";

const SCENE_REGISTRY: Record<string, React.FC> = {
  S0_ColdOpen,
  S1_Promise,
  S2_Origins,
  S3_GPU,
  S4_CUDA,
  S5_DeepLearning,
  S6_GoldRush,
  S7_Moat,
  S8_Geopolitics,
  S9_WhatNow,
  EndScreen,
};

export const Main: React.FC = () => {
  const { fps, scenes, transitionFrames } = timingData;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep, overflow: "hidden" }}>
      {ENABLE_AUDIO_PREVIEW && <Audio src={staticFile("audio/vo.wav")} />}

      <TransitionSeries>
        {scenes.map((scene, index) => {
          const SceneComponent = SCENE_REGISTRY[scene.id];
          const isLast = index === scenes.length - 1;
          const baseDuration = Math.round((scene.end - scene.start) * fps);
          // Compensate outgoing transition overlap so every scene begins at start * fps
          const durationInFrames = isLast
            ? baseDuration
            : baseDuration + transitionFrames;

          return (
            <React.Fragment key={scene.id}>
              <TransitionSeries.Sequence
                durationInFrames={durationInFrames}
                name={scene.id}
              >
                {SceneComponent ? <SceneComponent /> : null}
              </TransitionSeries.Sequence>

              {!isLast && (
                <TransitionSeries.Transition
                  presentation={crackWipe({ seed: scene.id })}
                  timing={linearTiming({ durationInFrames: transitionFrames })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      <Vignette />
      <Grain />
      <Caption />
    </AbsoluteFill>
  );
};
