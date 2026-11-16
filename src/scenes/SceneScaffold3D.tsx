import React, { useLayoutEffect, useMemo, useRef } from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { formatFactValue, getFact, getPerfScale } from "../config";
import { CrackLine } from "../design/CrackWipe";
import { colors, easings, fonts, springs, typeScale } from "../design/tokens";

export type ScaffoldVariant =
  | "bars"
  | "globe"
  | "ribbon"
  | "cores"
  | "tower"
  | "net"
  | "racks"
  | "monolith";

export interface SceneScaffoldProps {
  sceneId: string;
  sceneTag: string;
  title: string;
  subtitle?: string;
  factIds?: string[];
  variant: ScaffoldVariant;
  showCrack?: boolean;
  seed?: string;
}

const CameraRig: React.FC<{
  position: [number, number, number];
  lookAt: [number, number, number];
}> = ({ position, lookAt }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(lookAt[0], lookAt[1], lookAt[2]);
    camera.updateProjectionMatrix();
  }, [camera, position, lookAt]);
  return null;
};

const VariantMesh: React.FC<{
  variant: ScaffoldVariant;
  frame: number;
  fps: number;
  seed: string;
}> = ({ variant, frame, fps, seed }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { instanceScale } = getPerfScale();

  const count = useMemo(() => {
    switch (variant) {
      case "cores":
        return Math.max(64, Math.round(256 * instanceScale));
      case "globe":
        return Math.max(96, Math.round(320 * instanceScale));
      case "racks":
        return Math.max(24, Math.round(64 * instanceScale));
      case "bars":
        return Math.max(30, Math.round(60 * instanceScale));
      case "ribbon":
        return Math.max(20, Math.round(48 * instanceScale));
      case "net":
        return Math.max(36, Math.round(90 * instanceScale));
      case "tower":
        return 16;
      case "monolith":
        return 12;
      default:
        return 48;
    }
  }, [variant, instanceScale]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const t = frame / fps;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) {
      return;
    }

    for (let i = 0; i < count; i++) {
      const r1 = random(`${seed}-a-${i}`);
      const r2 = random(`${seed}-b-${i}`);

      if (variant === "bars") {
        const cols = 10;
        const gx = (i % cols) - cols / 2 + 0.5;
        const gz = Math.floor(i / cols) - Math.ceil(count / cols) / 2;
        const h = 1.4 + r1 * 5.2 + Math.sin(t * 0.7 + i * 0.4) * 0.25;
        dummy.position.set(gx * 1.65, h / 2 - 2.6, gz * 1.65 - 1);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(0.92, h, 0.92);
      } else if (variant === "globe") {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i + t * 0.14;
        const radius = 5.4;
        dummy.position.set(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta),
        );
        dummy.rotation.set(phi, theta, 0);
        const pulse = 0.16 + 0.06 * Math.sin(t * 1.6 + r1 * 6.28);
        dummy.scale.set(pulse, pulse, pulse);
      } else if (variant === "ribbon") {
        const ratio = i / count;
        const z = -22 + ratio * 38;
        const x = Math.sin(ratio * Math.PI * 2.2 + t * 0.12) * 3.8;
        const y = -1.2 + ratio * 2.4 + Math.cos(t * 0.9 + i * 0.3) * 0.12;
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, ratio * 0.5, 0);
        dummy.scale.set(1.5, 0.18, 0.55);
      } else if (variant === "cores") {
        const side = Math.ceil(Math.sqrt(count));
        const gx = (i % side) - side / 2 + 0.5;
        const gy = Math.floor(i / side) - side / 2 + 0.5;
        const wave = Math.sin(t * 1.8 - (gx * gx + gy * gy) * 0.08);
        dummy.position.set(gx * 0.72, gy * 0.72, wave * 0.55);
        dummy.rotation.set(0, 0, wave * 0.18);
        const s = 0.45 + 0.14 * (wave * 0.5 + 0.5);
        dummy.scale.set(s, s, 0.3);
      } else if (variant === "tower") {
        const layer = Math.floor(i / 4);
        const sub = i % 4;
        const angle = (sub * Math.PI) / 2 + t * 0.18 * (layer % 2 === 0 ? 1 : -1);
        dummy.position.set(
          Math.cos(angle) * 1.1,
          -2.4 + layer * 1.55,
          Math.sin(angle) * 1.1,
        );
        dummy.rotation.set(0, angle, 0);
        dummy.scale.set(2.4 - layer * 0.25, 0.72, 2.4 - layer * 0.25);
      } else if (variant === "net") {
        const layerIdx = i % 6;
        const rowIdx = Math.floor(i / 6);
        const rows = Math.ceil(count / 6);
        const lx = (layerIdx - 2.5) * 2.6;
        const ly = (rowIdx - rows / 2) * 0.72;
        const lz = Math.sin(t * 0.9 + layerIdx * 0.8 + r1 * 3) * 1.8;
        dummy.position.set(lx, ly, lz);
        dummy.rotation.set(t * 0.3, r2 * 2, 0);
        const s = 0.32 + 0.12 * Math.sin(t * 2.2 - layerIdx * 0.8);
        dummy.scale.set(s, s, s);
      } else if (variant === "racks") {
        const side = i % 2 === 0 ? -1 : 1;
        const depthIdx = Math.floor(i / 2);
        const z = 10 - depthIdx * 1.55;
        dummy.position.set(side * 3.8, 0, z);
        dummy.rotation.set(0, 0, 0);
        const wobble = 1 + Math.sin(t * 1.5 + r1 * 5) * 0.04;
        dummy.scale.set(1.2, 4.4 * wobble, 0.9);
      } else {
        // monolith
        if (i === 0) {
          dummy.position.set(0, 0.2, 0);
          dummy.rotation.set(0, t * 0.08, 0);
          dummy.scale.set(2.8, 7.6, 1.1);
        } else {
          const orbit = ((i - 1) / (count - 1)) * Math.PI * 1.4 - Math.PI * 0.7;
          const dist = 5.4 + r1 * 2.2;
          dummy.position.set(
            Math.sin(orbit) * dist,
            -2.1 + r2 * 1.4,
            -Math.cos(orbit) * 3.2 - 1.5,
          );
          dummy.rotation.set(0, orbit * 0.5, 0);
          dummy.scale.set(1.0, 2.0 + r1 * 1.6, 1.0);
        }
      }

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, variant, t, seed, dummy]);

  const accentColor =
    variant === "bars" || variant === "monolith" ? colors.red : colors.amber;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={colors.slateLight}
        emissive={accentColor}
        emissiveIntensity={0.18}
        roughness={0.42}
        metalness={0.45}
      />
    </instancedMesh>
  );
};

export const SceneScaffold3D: React.FC<SceneScaffoldProps> = ({
  sceneTag,
  title,
  subtitle,
  factIds = [],
  variant,
  showCrack = false,
  seed = "scaffold",
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Each scene variant defines its own subtle camera drift
  const camPos: [number, number, number] = useMemo(() => {
    switch (variant) {
      case "racks":
        return [Math.sin(progress * 1.5) * 0.6, 0.3, 13 - progress * 14];
      case "ribbon":
        return [-3 + progress * 4, 2.2, 16 - progress * 10];
      case "tower":
        return [6.5 * Math.cos(progress * 0.6), -1.5 + progress * 4.5, 8.5];
      case "monolith":
        return [progress * 1.8 - 0.9, 0.6, 9.5 + progress * 3.5];
      default:
        return [
          Math.sin(progress * 0.9 - 0.45) * 11,
          2.1 + Math.cos(progress * Math.PI) * 0.8,
          12.5 - progress * 2.2,
        ];
    }
  }, [variant, progress]);

  const headerIn = spring({
    frame,
    fps,
    config: springs.smooth,
  });

  const crackProgress = interpolate(frame, [20, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });

  const resolvedFacts = factIds.map((id) => getFact(id));

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <ThreeCanvas
        width={width}
        height={height}
        dpr={1}
        camera={{ position: camPos, fov: 44, near: 0.1, far: 140 }}
      >
        <color attach="background" args={[colors.bgDeep]} />
        <fog attach="fog" args={[colors.bgDeep, 10, 32]} />
        <CameraRig position={camPos} lookAt={[0, 0, 0]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[9, 14, 10]}
          intensity={1.55}
          color={colors.cream}
        />
        <pointLight
          position={[-8, -5, 6]}
          intensity={1.2}
          color={showCrack ? colors.red : colors.amber}
        />
        <VariantMesh variant={variant} frame={frame} fps={fps} seed={seed} />
      </ThreeCanvas>

      {showCrack && (
        <CrackLine
          progress={crackProgress}
          seed={`${seed}-line`}
          startX={74}
          endX={66}
          strokeWidth={4}
          opacity={0.78}
        />
      )}

      <div
        style={{
          position: "absolute",
          top: 76,
          left: 112,
          right: 112,
          pointerEvents: "none",
          opacity: headerIn,
          transform: `translateY(${(1 - headerIn) * 28}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: typeScale.minText,
            color: showCrack ? colors.red : colors.amber,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {sceneTag}
        </div>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: typeScale.hero,
            fontWeight: 700,
            color: colors.cream,
            margin: "12px 0 0 0",
            lineHeight: 1.06,
            maxWidth: 1420,
          }}
        >
          {title}
        </h1>

        {subtitle && (
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: typeScale.minText,
              color: colors.creamDim,
              marginTop: 18,
              maxWidth: 1320,
            }}
          >
            {subtitle}
          </div>
        )}

        {resolvedFacts.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              marginTop: 42,
            }}
          >
            {resolvedFacts.slice(0, 3).map((fact) => (
              <div
                key={fact.id}
                style={{
                  backgroundColor: "rgba(34, 42, 53, 0.86)",
                  border: `1px solid ${fact.id.includes("TODO_FACT") || String(fact.value).startsWith("TODO_FACT") ? colors.red : colors.steel}`,
                  borderRadius: 14,
                  padding: "18px 28px",
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: typeScale.subtitle,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color:
                      String(fact.value).startsWith("TODO_FACT")
                        ? colors.red
                        : colors.amber,
                  }}
                >
                  {formatFactValue(fact)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
