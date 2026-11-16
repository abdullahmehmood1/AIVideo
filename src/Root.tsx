import React from "react";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { ThreeDAnimation, threeDAnimationSchema } from "./compositions/ThreeDAnimation";
import { GeoMotionScene } from "./compositions/GeoMotionScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyComposition}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="ThreeDAnimation"
        component={ThreeDAnimation}
        schema={threeDAnimationSchema}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          title: "3D MOTION UNIVERSE",
          subtitle: "Rendered in Cloud GPU with Remotion & Three.js",
        }}
      />

      <Composition
        id="GeoMotion"
        component={GeoMotionScene}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
