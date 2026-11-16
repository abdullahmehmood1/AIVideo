import React, { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "./tokens";

export type Vec3 = [number, number, number];

export interface CameraState {
  position: Vec3;
  lookAt: Vec3;
  fov?: number;
}

export type CameraPath = (frame: number) => CameraState;

const CameraRig: React.FC<{ path: CameraPath }> = ({ path }) => {
  const frame = useCurrentFrame();
  const { camera } = useThree();
  const state = path(frame);
  useLayoutEffect(() => {
    camera.position.set(...state.position);
    camera.lookAt(...state.lookAt);
    if (camera instanceof THREE.PerspectiveCamera && state.fov) {
      camera.fov = state.fov;
    }
    camera.updateProjectionMatrix();
  });
  return null;
};

export interface SceneStageProps {
  cameraPath: CameraPath;
  children: React.ReactNode;
  fogNear?: number;
  fogFar?: number;
  /** Warm accent for the single point light (red only for rupture beats). */
  accent?: string;
  /** 0..1 strength of the soft radial glow behind the hero object. */
  glow?: number;
}

/**
 * Shared deterministic 3D stage: fixed 3 lights, fog, dpr=1, no shadows.
 * Camera is a pure function of the frame (CameraPath).
 */
export const SceneStage: React.FC<SceneStageProps> = ({
  cameraPath,
  children,
  fogNear = 14,
  fogFar = 46,
  accent = colors.amber,
  glow = 0.35,
}) => {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const initial = useMemo(() => cameraPath(0), [cameraPath]);
  void frame;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{
          position: initial.position,
          fov: initial.fov ?? 42,
          near: 0.1,
          far: 220,
        }}
      >
        <color attach="background" args={[colors.bgDeep]} />
        <fog attach="fog" args={[colors.bgDeep, fogNear, fogFar]} />
        <CameraRig path={cameraPath} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 14, 10]} intensity={1.5} color={colors.cream} />
        <pointLight position={[-9, 3, 8]} intensity={1.1} color={accent} />
        {children}
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background: `radial-gradient(ellipse 46% 42% at 50% 50%, rgba(217,164,65,${0.16 * glow}) 0%, rgba(22,27,34,0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Project a world-space point to 1920x1080 pixel coordinates for DOM overlays (Callout). */
export const projectToScreen = (
  world: Vec3,
  cam: CameraState,
  width = 1920,
  height = 1080,
): { x: number; y: number; visible: boolean } => {
  const camera = new THREE.PerspectiveCamera(cam.fov ?? 42, width / height, 0.1, 220);
  camera.position.set(...cam.position);
  camera.lookAt(...cam.lookAt);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  const v = new THREE.Vector3(...world).project(camera);
  return {
    x: (v.x * 0.5 + 0.5) * width,
    y: (-v.y * 0.5 + 0.5) * height,
    visible: v.z > -1 && v.z < 1,
  };
};
