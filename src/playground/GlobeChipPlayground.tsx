import React, { useCallback } from "react";
import { interpolate } from "remotion";
import { SceneStage, type CameraPath } from "../design/SceneStage";
import { colors } from "../design/tokens";
import { GlobeDots, globeRotation, latLonToVec3 } from "../components/GlobeDots";
import { ArcLines } from "../components/ArcLines";
import { ChipDie } from "../components/ChipDie";
import { CoreGrid, CpuBlocks, WireSphere } from "../components/CoreGrid";
import { useCurrentFrame } from "remotion";

const US: [number, number] = [37, -98];
const TW: [number, number] = [24, 121];
const CN: [number, number] = [31, 121.5];

const rotY = (f: number) => globeRotation(f, 0.003, -40);

export const GlobePlayground: React.FC = () => {
  const path: CameraPath = useCallback((f) => {
    const a = interpolate(f, [0, 240], [-0.35, 0.35]);
    return {
      position: [Math.sin(a) * 9.5, 1.8, Math.cos(a) * 9.5],
      lookAt: [0, 0, 0],
      fov: 40,
    };
  }, []);
  void latLonToVec3;
  return (
    <SceneStage cameraPath={path} fogNear={12} fogFar={40}>
      <GlobeDots
        radius={3}
        rotationY={rotY}
        highlights={[
          { lat: US[0], lon: US[1], startFrame: 10 },
          { lat: TW[0], lon: TW[1], startFrame: 70 },
          { lat: CN[0], lon: CN[1] + 3, startFrame: 130, color: colors.red },
        ]}
      />
      <ArcLines
        radius={3}
        rotationY={rotY}
        arcs={[
          { from: US, to: TW, startFrame: 20, drawFrames: 60, colorFrom: colors.amber },
          {
            from: TW,
            to: CN,
            startFrame: 100,
            drawFrames: 50,
            height: 0.12,
            colorFrom: colors.amber,
            colorTo: colors.red,
            switchFrame: 150,
          },
        ]}
      />
    </SceneStage>
  );
};

export const ChipPlayground: React.FC = () => {
  const frame = useCurrentFrame();
  const path: CameraPath = useCallback((f) => {
    const a = interpolate(f, [0, 240], [-0.3, 0.3]);
    return { position: [Math.sin(a) * 8, 5.5, Math.cos(a) * 8], lookAt: [0, 0, 0], fov: 40 };
  }, []);
  const density = interpolate(frame, [10, 200], [0.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <SceneStage cameraPath={path} fogNear={14} fogFar={40}>
      <ChipDie density={density} size={5} glow={0.5 + density * 0.3} rotation={[0, 0.0, 0]} />
    </SceneStage>
  );
};

export const CoreGridPlayground: React.FC = () => {
  const path: CameraPath = useCallback(
    () => ({ position: [0, 0, 11], lookAt: [0, 0, 0], fov: 40 }),
    [],
  );
  return (
    <SceneStage cameraPath={path} fogNear={16} fogFar={40}>
      <CpuBlocks position={[-4.6, 0, 0]} width={2.6} height={4.4} framesPerBlock={28} />
      <CoreGrid position={[0.6, 0, 0]} size={4.4} mode="sweep" waveSpeed={30} />
      <WireSphere position={[5.0, 0, 0]} radius={1.35} paintFrames={200} />
    </SceneStage>
  );
};
