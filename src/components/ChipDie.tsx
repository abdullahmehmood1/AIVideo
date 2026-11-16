import React, { useLayoutEffect, useMemo, useRef } from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { getPerfScale } from "../config";
import { colors } from "../design/tokens";

export interface ChipDieProps {
  /** 0..1: how many cores/traces are populated. Can be animated. */
  density: number;
  size?: number;
  /** 0..1 amber emissive accent strength. */
  glow?: number;
  rotation?: [number, number, number];
  /** Frame at which the chip scales in (20 frame pop). */
  startFrame?: number;
}

const PINS_PER_SIDE = 28;
const TRACES = 96;

export const ChipDie: React.FC<ChipDieProps> = ({
  density,
  size = 4,
  glow = 0.5,
  rotation = [-0.9, 0, 0],
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { instanceScale } = getPerfScale();
  const grid = Math.max(12, Math.round(40 * Math.min(instanceScale, 1.2)));
  const coreRef = useRef<THREE.InstancedMesh>(null);
  const traceRef = useRef<THREE.InstancedMesh>(null);
  const pinRef = useRef<THREE.InstancedMesh>(null);

  const dieSize = size * 0.56;
  const pkgH = size * 0.06;
  const dieH = size * 0.035;
  const topY = pkgH / 2 + dieH;
  const cell = dieSize / grid;

  const thresholds = useMemo(() => {
    const a = new Float32Array(grid * grid);
    for (let i = 0; i < a.length; i++) a[i] = random(`core-${i}`);
    return a;
  }, [grid]);
  const traceT = useMemo(() => {
    const a = new Float32Array(TRACES);
    for (let i = 0; i < TRACES; i++) a[i] = random(`trace-${i}`);
    return a;
  }, []);

  const d = Math.min(1, Math.max(0, density));
  const pop = interpolate(frame - startFrame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Static pins
  useLayoutEffect(() => {
    const m = pinRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    let k = 0;
    const edge = size / 2;
    const w = size * 0.012;
    for (let s = 0; s < 4; s++) {
      for (let i = 0; i < PINS_PER_SIDE; i++) {
        const u = ((i + 0.5) / PINS_PER_SIDE - 0.5) * size * 0.9;
        const horizontal = s < 2;
        const sign = s % 2 === 0 ? 1 : -1;
        o.position.set(
          horizontal ? u : sign * (edge - w * 1.2),
          pkgH / 2 + w * 0.2,
          horizontal ? sign * (edge - w * 1.2) : u,
        );
        o.scale.set(w, w * 0.4, w * 2.2);
        o.updateMatrix();
        m.setMatrixAt(k++, o.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  }, [size, pkgH]);

  // Cores
  useLayoutEffect(() => {
    const m = coreRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const cA = new THREE.Color(colors.amber);
    const cS = new THREE.Color(colors.steel);
    for (let i = 0; i < grid * grid; i++) {
      const gx = i % grid;
      const gz = Math.floor(i / grid);
      const t = thresholds[i];
      const on = t < d;
      // Newly appearing cells grow in softly.
      const grow = on ? Math.min(1, (d - t) * 8) : 0;
      o.position.set(
        (gx + 0.5) * cell - dieSize / 2,
        topY + dieH * 0.2,
        (gz + 0.5) * cell - dieSize / 2,
      );
      const s = cell * 0.62 * grow;
      o.scale.set(s, Math.max(1e-5, dieH * 0.7 * grow), s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      c.copy(cS).lerp(cA, Math.min(1, (random(`c-${i}`) * 0.5 + d * 0.5) * glow * 1.4));
      m.setColorAt(i, c);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [d, grid, cell, dieSize, topY, dieH, thresholds, glow]);

  // Traces: thin boxes from die edge to package edge, radiating from the center.
  useLayoutEffect(() => {
    const m = traceRef.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const inner = dieSize / 2;
    const outer = size / 2 - size * 0.03;
    for (let i = 0; i < TRACES; i++) {
      const side = i % 4;
      const lane = Math.floor(i / 4);
      const lanes = TRACES / 4;
      const u = ((lane + 0.5) / lanes - 0.5) * dieSize * 0.95;
      const len = outer - inner;
      const mid = (outer + inner) / 2;
      const horizontal = side < 2;
      const sign = side % 2 === 0 ? 1 : -1;
      const on = traceT[i] < d;
      const gr = on ? Math.min(1, (d - traceT[i]) * 6) : 0;
      o.position.set(
        horizontal ? u : sign * mid,
        pkgH / 2 + size * 0.002,
        horizontal ? sign * mid : u,
      );
      const w = size * 0.0035;
      o.scale.set(
        horizontal ? w : Math.max(1e-5, len * gr),
        size * 0.002,
        horizontal ? Math.max(1e-5, len * gr) : w,
      );
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [d, dieSize, size, pkgH, traceT]);

  return (
    <group rotation={rotation} scale={pop}>
      <mesh>
        <boxGeometry args={[size, pkgH, size]} />
        <meshStandardMaterial color={colors.slate} roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, pkgH / 2 + dieH / 2, 0]}>
        <boxGeometry args={[dieSize, dieH, dieSize]} />
        <meshStandardMaterial color={colors.slateLight} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Amber accent frame around the die */}
      <mesh position={[0, pkgH / 2 + dieH * 0.3, 0]}>
        <boxGeometry args={[dieSize * 1.05, dieH * 0.4, dieSize * 1.05]} />
        <meshStandardMaterial
          color={colors.amber}
          emissive={colors.amber}
          emissiveIntensity={0.9 * glow}
          roughness={0.7}
        />
      </mesh>
      <instancedMesh ref={coreRef} args={[undefined, undefined, grid * grid]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={colors.cream}
          emissive={colors.amber}
          emissiveIntensity={0.35 * glow}
          roughness={0.5}
        />
      </instancedMesh>
      <instancedMesh ref={traceRef} args={[undefined, undefined, TRACES]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors.steel} roughness={0.5} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={pinRef} args={[undefined, undefined, PINS_PER_SIDE * 4]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors.creamDim} roughness={0.4} metalness={0.6} />
      </instancedMesh>
    </group>
  );
};
