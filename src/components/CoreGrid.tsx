import React, { useLayoutEffect, useMemo, useRef } from "react";
import { random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { getPerfScale } from "../config";
import { colors } from "../design/tokens";

type Vec3 = [number, number, number];
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface CoreGridProps {
  size?: number;
  /** Grid cells traversed per second-ish: wave front speed in "grid widths per 100 frames". */
  waveSpeed?: number;
  mode?: "sweep" | "radial" | "paint";
  baseColor?: string;
  activeColor?: string;
  startFrame?: number;
  position?: Vec3;
  rotation?: Vec3;
  /** Override grid dimension (default 64, scaled by perf; low = 32). */
  cells?: number;
}

export const CoreGrid: React.FC<CoreGridProps> = ({
  size = 4,
  waveSpeed = 40,
  mode = "sweep",
  baseColor = colors.slateLight,
  activeColor = colors.amber,
  startFrame = 0,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  cells,
}) => {
  const frame = useCurrentFrame();
  const { instanceScale } = getPerfScale();
  const n = cells ?? (instanceScale < 0.75 ? 32 : 64);
  const ref = useRef<THREE.InstancedMesh>(null);
  const order = useMemo(() => {
    const a = new Float32Array(n * n);
    for (let i = 0; i < a.length; i++) a[i] = random(`paint-${n}-${i}`);
    return a;
  }, [n]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const cell = size / n;
    for (let i = 0; i < n * n; i++) {
      o.position.set(
        ((i % n) + 0.5) * cell - size / 2,
        (Math.floor(i / n) + 0.5) * cell - size / 2,
        0,
      );
      o.scale.setScalar(cell * 0.78);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [n, size]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const base = new THREE.Color(baseColor);
    const act = new THREE.Color(activeColor);
    const c = new THREE.Color();
    const t = Math.max(0, frame - startFrame);
    const front = (t * waveSpeed) / 100; // in grid widths
    for (let i = 0; i < n * n; i++) {
      const gx = (i % n) / (n - 1);
      const gy = Math.floor(i / n) / (n - 1);
      let v = 0;
      if (mode === "sweep") {
        const p = (gx * 0.8 + gy * 0.2) * 1.4;
        const d = (((front - p) % 1.4) + 1.4) % 1.4;
        v = d < 0.22 ? 1 - d / 0.22 : 0;
        v = Math.max(v, d < 0.9 ? 0.12 * (1 - d / 0.9) : 0);
      } else if (mode === "radial") {
        const r = Math.hypot(gx - 0.5, gy - 0.5) * 2;
        const d = (((front * 0.8 - r) % 1.3) + 1.3) % 1.3;
        v = d < 0.2 ? 1 - d / 0.2 : 0;
      } else {
        const prog = clamp01(t * waveSpeed * 0.0004 * 1.0);
        const age = prog - order[i] * 0.85;
        v = age < 0 ? 0 : 0.35 + 0.65 * clamp01(1 - age * 6);
      }
      c.copy(base).lerp(act, clamp01(v));
      m.setColorAt(i, c);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -size * 0.01]}>
        <boxGeometry args={[size * 1.03, size * 1.03, size * 0.01]} />
        <meshBasicMaterial color={colors.slate} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n * n]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
    </group>
  );
};

export interface CpuBlocksProps {
  width?: number;
  height?: number;
  position?: Vec3;
  startFrame?: number;
  framesPerBlock?: number;
  activeColor?: string;
}

/** 8 large blocks (2 columns x 4 rows) that light up one at a time, sequentially. */
export const CpuBlocks: React.FC<CpuBlocksProps> = ({
  width = 2.6,
  height = 4.4,
  position = [0, 0, 0],
  startFrame = 0,
  framesPerBlock = 24,
  activeColor = colors.amber,
}) => {
  const frame = useCurrentFrame();
  const t = frame - startFrame;
  const idx = t < 0 ? -1 : Math.floor(t / framesPerBlock) % 8;
  const local = t < 0 ? 0 : (t % framesPerBlock) / framesPerBlock;
  const bw = width / 2 - width * 0.05;
  const bh = height / 4 - height * 0.05;
  return (
    <group position={position}>
      {Array.from({ length: 8 }, (_, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const active = i === idx;
        const k = active ? 1 - Math.pow(local, 3) * 0.4 : 0;
        return (
          <mesh
            key={i}
            position={[
              (col - 0.5) * (width / 2),
              (1.5 - row) * (height / 4),
              active ? 0.12 : 0,
            ]}
          >
            <boxGeometry args={[bw, bh, 0.25]} />
            <meshStandardMaterial
              color={active ? activeColor : colors.slateLight}
              emissive={activeColor}
              emissiveIntensity={active ? 0.75 * k : 0}
              roughness={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export interface WireSphereProps {
  radius?: number;
  position?: Vec3;
  startFrame?: number;
  /** Radians per frame. */
  spin?: number;
  /** Frames for the paint wave to cover the whole sphere. */
  paintFrames?: number;
  color?: string;
  paintColor?: string;
}

/** Rotating low-poly wireframe sphere "painted" by dots that light up in wave order. */
export const WireSphere: React.FC<WireSphereProps> = ({
  radius = 1.6,
  position = [0, 0, 0],
  startFrame = 0,
  spin = 0.012,
  paintFrames = 150,
  color = colors.steel,
  paintColor = colors.amber,
}) => {
  const frame = useCurrentFrame();
  const { instanceScale } = getPerfScale();
  const count = Math.round(700 * instanceScale);
  const ref = useRef<THREE.InstancedMesh>(null);
  const pts = useMemo(() => {
    const a: Vec3[] = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - ((i + 0.5) / count) * 2;
      const r = Math.sqrt(1 - y * y);
      a.push([Math.cos(i * g) * r, y, Math.sin(i * g) * r]);
    }
    return a;
  }, [count]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const s = radius * 0.028;
    pts.forEach((p, i) => {
      o.position.set(p[0] * radius, p[1] * radius, p[2] * radius);
      o.scale.setScalar(s);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [pts, radius]);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const base = new THREE.Color(colors.slateLight);
    const act = new THREE.Color(paintColor);
    const cream = new THREE.Color(colors.cream);
    const c = new THREE.Color();
    const t = Math.max(0, frame - startFrame);
    const front = clamp01(t / paintFrames) * 1.25 - 0.1;
    pts.forEach((p, i) => {
      const pos = (p[1] + 1) / 2; // painted bottom to top
      const age = front - pos;
      c.copy(base);
      if (age > 0) {
        c.lerp(act, clamp01(0.55 + age * 2));
        if (age < 0.08) c.lerp(cream, 1 - age / 0.08);
      }
      m.setColorAt(i, c);
    });
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  const segs = Math.max(10, Math.round(getPerfScale().segments / 2));
  return (
    <group position={position} rotation={[0.25, frame * spin, 0]}>
      <mesh>
        <sphereGeometry args={[radius, segs, Math.round(segs * 0.75)]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
    </group>
  );
};
