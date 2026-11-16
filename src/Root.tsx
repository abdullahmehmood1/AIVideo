import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./config";
import { Main } from "./Main";
import { Test3DGrid } from "./scenes/Test3DGrid";

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
    </>
  );
};
