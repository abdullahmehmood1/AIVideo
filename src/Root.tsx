import React from "react";
import { Composition, Folder } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./config";
import { Main } from "./Main";
import { Test3DGrid } from "./scenes/Test3DGrid";
import {
  S0_ColdOpen,
  SCENE_DURATION_FRAMES as D0,
} from "./scenes/S0_ColdOpen";
import {
  S1_Promise,
  SCENE_DURATION_FRAMES as D1,
} from "./scenes/S1_Promise";
import {
  S2_Origins,
  SCENE_DURATION_FRAMES as D2,
} from "./scenes/S2_Origins";
import { S3_GPU, SCENE_DURATION_FRAMES as D3 } from "./scenes/S3_GPU";
import { S4_CUDA, SCENE_DURATION_FRAMES as D4 } from "./scenes/S4_CUDA";
import {
  S5_DeepLearning,
  SCENE_DURATION_FRAMES as D5,
} from "./scenes/S5_DeepLearning";
import {
  S6_GoldRush,
  SCENE_DURATION_FRAMES as D6,
} from "./scenes/S6_GoldRush";
import { S7_Moat, SCENE_DURATION_FRAMES as D7 } from "./scenes/S7_Moat";
import {
  S8_Geopolitics,
  SCENE_DURATION_FRAMES as D8,
} from "./scenes/S8_Geopolitics";
import { S9_WhatNow, SCENE_DURATION_FRAMES as D9 } from "./scenes/S9_WhatNow";
import {
  EndScreen,
  SCENE_DURATION_FRAMES as D10,
} from "./scenes/EndScreen";
import {
  Bars3DPlayground,
  TwoDPlayground,
} from "./playground/TwoDPlayground";
import {
  ChipPlayground,
  CoreGridPlayground,
  GlobePlayground,
} from "./playground/GlobeChipPlayground";
import {
  AislePlayground,
  MonolithPlayground,
  NeuralPlayground,
  TowerPlayground,
} from "./playground/ObjectsPlayground";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Composition
        id="Test3D"
        component={Test3DGrid}
        durationInFrames={60}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />

      <Folder name="Scenes">
        <Composition
          id="S0-ColdOpen"
          component={S0_ColdOpen}
          durationInFrames={D0}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S1-Promise"
          component={S1_Promise}
          durationInFrames={D1}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S2-Origins"
          component={S2_Origins}
          durationInFrames={D2}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S3-GPU"
          component={S3_GPU}
          durationInFrames={D3}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S4-CUDA"
          component={S4_CUDA}
          durationInFrames={D4}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S5-DeepLearning"
          component={S5_DeepLearning}
          durationInFrames={D5}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S6-GoldRush"
          component={S6_GoldRush}
          durationInFrames={D6}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S7-Moat"
          component={S7_Moat}
          durationInFrames={D7}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S8-Geopolitics"
          component={S8_Geopolitics}
          durationInFrames={D8}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="S9-WhatNow"
          component={S9_WhatNow}
          durationInFrames={D9}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="EndScreen"
          component={EndScreen}
          durationInFrames={D10}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>

      <Folder name="Playgrounds">
        <Composition
          id="Playground-2D"
          component={TwoDPlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-Bars3D"
          component={Bars3DPlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-Globe"
          component={GlobePlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-Chip"
          component={ChipPlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-CoreGrid"
          component={CoreGridPlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-Neural"
          component={NeuralPlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-Aisle"
          component={AislePlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-Monolith"
          component={MonolithPlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Playground-Tower"
          component={TowerPlayground}
          durationInFrames={240}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>
    </>
  );
};
