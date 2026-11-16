import React, { useLayoutEffect, useMemo, useRef } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getPerfScale } from "../config";
import { colors, easings, fonts, typeScale } from "../design/tokens";
import { Vignette } from "../design/Vignette";

interface CameraRigProps {
  position: [number, number, number];
  lookAt: [number, number, number];
}

const CameraRig: React.FC<CameraRigProps> = ({ position, lookAt }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    camera.updateProjectionMatrix();
  }, [camera, position, lookAt]);
  return null;
};

const InstancedCubeGrid: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { instanceScale } = getPerfScale();

  const cols = 8;
  const rows = 8;
  const layers = Math.max(2, Math.round(4 * instanceScale));
  const totalCount = cols * rows * layers;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const phase = (frame / fps) * Math.PI;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    let idx = 0;
    const spacing = 1.45;
    const offsetX = ((cols - 1) * spacing) / 2;
    const offsetY = ((rows - 1) * spacing) / 2;
    const offsetZ = ((layers - 1) * spacing) / 2;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        for (let z = 0; z < layers; z++) {
          const dist = Math.hypot(
            x - (cols - 1) / 2,
            y - (rows - 1) / 2,
            z - (layers - 1) / 2,
          );
          const wave = Math.sin(phase * 1.4 - dist * 0.7);
          const px = x * spacing - offsetX;
          const py = y * spacing - offsetY + wave * 0.28;
          const pz = z * spacing - offsetZ;

          dummy.position.set(px, py, pz);
          dummy.rotation.set(
            phase * 0.35 + x * 0.12,
            phase * 0.45 + y * 0.12,
            z * 0.1,
          );
          const s = 0.48 + wave * 0.14;
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          mesh.setMatrixAt(idx, dummy.matrix);
          idx++;
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [cols, rows, layers, phase, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, totalCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={colors.slateLight}
        emissive={colors.amber}
        emissiveIntensity={0.22}
        roughness={0.35}
        metalness={0.45}
      />
    </instancedMesh>
  );
};

export const Test3DGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });

  const angle = -0.55 + progress * 1.1;
  const radius = 15 - progress * 2.4;
  const camPos: [number, number, number] = [
    Math.sin(angle) * radius,
    3.8 + Math.sin(progress * Math.PI) * 1.6,
    Math.cos(angle) * radius,
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ position: camPos, fov: 44, near: 0.1, far: 100 }}
      >
        <color attach="background" args={[colors.bgDeep]} />
        <fog attach="fog" args={[colors.bgDeep, 12, 34]} />
        <CameraRig position={camPos} lookAt={[0, 0, 0]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[10, 14, 8]}
          intensity={1.6}
          color={colors.cream}
        />
        <pointLight
          position={[-8, -6, 6]}
          intensity={1.4}
          color={colors.amber}
        />
        <InstancedCubeGrid frame={frame} fps={fps} />
      </ThreeCanvas>

      <Vignette intensity={0.48} />

      <div
        style={{
          position: "absolute",
          top: 64,
          left: 84,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: typeScale.minText,
            color: colors.amber,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          M1 3D INSTANCED VERIFICATION
        </div>
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: typeScale.heading,
            fontWeight: 700,
            color: colors.cream,
            marginTop: 8,
          }}
        >
          WORLD RUPTURE
        </div>
      </div>
    </AbsoluteFill>
  );
};
