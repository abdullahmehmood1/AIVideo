import React from "react";
import { Composition } from "remotion";
import { Composition as MyVideoComposition } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 60-second Map Animation Video (1800 frames, 30 fps, 1920x1080) */}
      <Composition
        id="MyVideo"
        component={MyVideoComposition}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
