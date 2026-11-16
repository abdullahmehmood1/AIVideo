import React from "react";
import { interpolate } from "remotion";
import { SceneStage } from "../design/SceneStage";
import type { CameraState } from "../design/SceneStage";
import { NeuralNet3D, netCameraZ } from "../components/NeuralNet3D";
import { DataCenterAisle, aisleCamera } from "../components/DataCenterAisle";
import { LayerTower, Monolith } from "../components/Monolith";

const DUR = 240;

const neuralCam = (f: number): CameraState => ({
  position: [Math.sin(f / 120) * 2.2, 1.2, netCameraZ(f)],
  lookAt: [0, 0, 0],
  fov: 42,
});

const aisleCam = (f: number): CameraState => aisleCamera(f, DUR);

const monoCam = (f: number): CameraState => ({
  position: [interpolate(f, [0, DUR], [-2.5, 2.5]), 3.2, interpolate(f, [0, DUR], [15, 12.5])],
  lookAt: [0, 3.1, 0],
  fov: 42,
});

const towerCam = (f: number): CameraState => ({
  position: [interpolate(f, [0, DUR], [-7, -4]), 4.2, interpolate(f, [0, DUR], [14, 12])],
  lookAt: [0, 2.2, 0],
  fov: 42,
});

export const NeuralPlayground: React.FC = () => (
  <SceneStage cameraPath={neuralCam} fogNear={18} fogFar={40}>
    <NeuralNet3D startFrame={10} compressAt={170} compressFrames={50} />
  </SceneStage>
);

export const AislePlayground: React.FC = () => (
  <SceneStage cameraPath={aisleCam} fogNear={10} fogFar={50}>
    <DataCenterAisle startFrame={0} />
  </SceneStage>
);

export const MonolithPlayground: React.FC = () => (
  <SceneStage cameraPath={monoCam} fogNear={18} fogFar={46}>
    <Monolith crackStartFrame={40} splitFrame={170} splitFrames={50} competitors={5} />
  </SceneStage>
);

export const TowerPlayground: React.FC = () => (
  <SceneStage cameraPath={towerCam} fogNear={18} fogFar={46}>
    <LayerTower
      startFrame={10}
      buildFrames={100}
      cudaGlowFrame={130}
      wallStartFrame={150}
      wallFrames={70}
    />
  </SceneStage>
);
