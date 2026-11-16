import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Easing, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { colors } from "../design/tokens";
import { getPerfScale } from "../config";
import type { Vec3 } from "../design/SceneStage";

const dummy = new THREE.Object3D();
const tmp = new THREE.Color();
const cRed = new THREE.Color(colors.red);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeIO = (x: number) => Easing.inOut(Easing.cubic)(clamp01(x));
const easeOut = (x: number) => Easing.out(Easing.cubic)(clamp01(x));

const useGlowTexture = (): THREE.CanvasTexture =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,255,255,0.9)");
      grad.addColorStop(0.35, "rgba(255,255,255,0.3)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(c);
  }, []);

/* ------------------------------------------------------------------ */
/* Monolith                                                            */
/* ------------------------------------------------------------------ */

const MONO_W = 2.6;
const MONO_H = 6.4;
const MONO_D = 0.9;

export const competitorPositions = (count = 4, heights?: number[]): Vec3[] =>
  Array.from({ length: count }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (4.6 + Math.floor(i / 2) * 3.4);
    const z = -4.5 - (i % 3) * 1.4;
    const h = heights?.[i] ?? 2.0 + random(`comp-h-${i}`) * 2.6;
    return [x, h, z];
  });

export interface MonolithProps {
  crackStartFrame: number;
  splitFrame: number;
  splitFrames: number;
  competitors?: number;
  competitorHeights?: number[];
  /** Frame where the competitor blocks start rising (default crackStartFrame - 30). */
  riseStart?: number;
}

interface CrackSeg {
  x: number;
  y: number;
  ang: number;
  len: number;
}

const buildCracks = (): { paths: CrackSeg[][]; starts: number[] } => {
  const paths: CrackSeg[][] = [];
  const starts: number[] = [];
  const N = 20;
  for (let p = 0; p < 5; p++) {
    let x = p === 0 ? 0 : (random(`cx-${p}`) - 0.5) * 2.0;
    let y = p === 0 ? MONO_H - 0.05 : MONO_H * (0.45 + random(`cy-${p}`) * 0.5);
    let dir = -Math.PI / 2 + (random(`cd-${p}`) - 0.5) * 0.7;
    const segs: CrackSeg[] = [];
    for (let s = 0; s < N; s++) {
      dir += (random(`cj-${p}-${s}`) - 0.5) * (p === 0 ? 0.9 : 1.3);
      dir = -Math.PI / 2 + Math.max(-0.9, Math.min(0.9, dir + Math.PI / 2));
      const len = (p === 0 ? 0.34 : 0.22) + random(`cl-${p}-${s}`) * 0.14;
      let nx = x + Math.cos(dir) * len;
      const ny = y + Math.sin(dir) * len;
      const lim = MONO_W / 2 - 0.06;
      if (nx > lim || nx < -lim) {
        dir = -Math.PI / 2;
        nx = Math.max(-lim, Math.min(lim, nx));
      }
      const dx = nx - x;
      const dy = ny - y;
      segs.push({
        x: (x + nx) / 2,
        y: (y + ny) / 2,
        ang: Math.atan2(dy, dx),
        len: Math.hypot(dx, dy),
      });
      x = nx;
      y = ny;
      if (y < 0.1) break;
    }
    paths.push(segs);
    starts.push(p === 0 ? 0 : 0.1 + p * 0.1);
  }
  return { paths, starts };
};

export const Monolith: React.FC<MonolithProps> = ({
  crackStartFrame,
  splitFrame,
  splitFrames,
  competitors = 4,
  competitorHeights,
  riseStart,
}) => {
  const frame = useCurrentFrame();
  const perf = getPerfScale();
  const crackRef = useRef<THREE.InstancedMesh>(null);
  const glowTex = useGlowTexture();
  const cracks = useMemo(() => buildCracks(), []);
  const segTotal = useMemo(() => cracks.paths.reduce((a, p) => a + p.length, 0), [cracks]);
  const keep = Math.max(2, Math.round(5 * Math.min(1, perf.instanceScale + 0.4)));

  const e = easeIO((frame - splitFrame) / splitFrames);
  const offset = e * 1.25;
  const rot = e * 0.045;
  const prog = clamp01((frame - crackStartFrame) / Math.max(1, splitFrame - crackStartFrame));
  const crackFade = 1 - clamp01(e * 10);
  const seamGrow = easeOut((frame - (splitFrame - 24)) / 24);
  const seamW = 0.08 * (1 - clamp01((e - 0.35) * 1.4));
  const compPos = competitorPositions(competitors, competitorHeights);
  const rs = riseStart ?? crackStartFrame - 30;

  useLayoutEffect(() => {
    const m = crackRef.current;
    if (!m) return;
    let i = 0;
    cracks.paths.forEach((segs, p) => {
      const q = clamp01((prog - cracks.starts[p]) / 0.62);
      segs.forEach((s, si) => {
        const g = p >= keep ? 0 : clamp01(q * segs.length - si);
        const len = s.len * g;
        const c = Math.cos(s.ang);
        const sn = Math.sin(s.ang);
        // grow from segment start point
        const sx = s.x - (c * s.len) / 2;
        const sy = s.y - (sn * s.len) / 2;
        dummy.position.set(sx + (c * len) / 2, sy + (sn * len) / 2, MONO_D / 2 + 0.006);
        dummy.rotation.set(0, 0, s.ang);
        const th = (p === 0 ? 0.028 : 0.018) * crackFade;
        dummy.scale.set(Math.max(len, 0.0001), Math.max(th, 0.0001), 0.012);
        dummy.updateMatrix();
        m.setMatrixAt(i++, dummy.matrix);
      });
    });
    while (i < segTotal) {
      dummy.scale.setScalar(0.0001);
      dummy.updateMatrix();
      m.setMatrixAt(i++, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  void tmp;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -8]}>
        <planeGeometry args={[70, 50]} />
        <meshStandardMaterial color={colors.slate} roughness={1} />
      </mesh>
      {/* halves */}
      <group position={[-offset, 0, 0]} rotation={[0, 0, rot]}>
        <mesh position={[-MONO_W / 4, MONO_H / 2, 0]}>
          <boxGeometry args={[MONO_W / 2, MONO_H, MONO_D]} />
          <meshStandardMaterial color={colors.slateLight} roughness={0.55} metalness={0.25} />
        </mesh>
      </group>
      <group position={[offset, 0, 0]} rotation={[0, 0, -rot]}>
        <mesh position={[MONO_W / 4, MONO_H / 2, 0]}>
          <boxGeometry args={[MONO_W / 2, MONO_H, MONO_D]} />
          <meshStandardMaterial color={colors.slateLight} roughness={0.55} metalness={0.25} />
        </mesh>
      </group>
      {/* red seam */}
      <mesh
        position={[0, MONO_H - (MONO_H * seamGrow) / 2, 0]}
        scale={[seamW, Math.max(MONO_H * seamGrow, 0.0001), MONO_D * 0.9]}
        visible={seamGrow > 0.001}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={colors.red} />
      </mesh>
      <sprite
        position={[0, MONO_H / 2, 0.2]}
        scale={[seamW * 5 + 1.5, MONO_H * 1.05, 1]}
        visible={e > 0.001}
      >
        <spriteMaterial
          map={glowTex}
          color={colors.red}
          transparent
          opacity={0.45 * clamp01(e * 4)}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <instancedMesh
        ref={crackRef}
        args={[undefined, undefined, segTotal]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={cRed} />
      </instancedMesh>
      {/* competitors */}
      {compPos.map((p, i) => {
        const rise = easeOut((frame - rs - i * 14) / 46);
        const h = Math.max(p[1] * rise, 0.0001);
        return (
          <mesh
            key={i}
            position={[p[0], h / 2, p[2]]}
            scale={[1, h, 1]}
            visible={rise > 0.001}
          >
            <boxGeometry args={[1.5, 1, 1.5]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? colors.steel : colors.slateLight}
              roughness={0.7}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* StackedMoats                                                        */
/* ------------------------------------------------------------------ */

export const moatPositions: Vec3[] = [
  [3.0, 0.4, 0],
  [3.0, 1.4, 0],
  [3.0, 2.4, 0],
];

export const MOAT_NAMES = ["Software", "Networking", "Manufacturing"] as const;

export interface StackedMoatsProps {
  startFrame: number;
  stackFrames: number;
}

const MOAT_COLORS = [colors.slate, colors.slateLight, "#3A4656"];

export const StackedMoats: React.FC<StackedMoatsProps> = ({ startFrame, stackFrames }) => {
  const frame = useCurrentFrame();
  const slotLen = stackFrames / 3;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color={colors.bgDeep} roughness={1} />
      </mesh>
      {moatPositions.map((p, i) => {
        const t = easeOut((frame - startFrame - i * slotLen * 0.8) / (slotLen * 1.2));
        const y = p[1] + (1 - t) * 6;
        return (
          <group key={i} position={[0, y, 0]} visible={t > 0.001}>
            <mesh>
              <boxGeometry args={[5, 0.8, 3.2]} />
              <meshStandardMaterial color={MOAT_COLORS[i]} roughness={0.6} metalness={0.2} />
            </mesh>
            {[1.6, -1.6].map((z) => (
              <mesh key={z} position={[0, 0.4, z]}>
                <boxGeometry args={[5.04, 0.04, 0.04]} />
                <meshBasicMaterial color={colors.cream} />
              </mesh>
            ))}
            {[2.5, -2.5].map((x) => (
              <mesh key={x} position={[x, 0.4, 0]}>
                <boxGeometry args={[0.04, 0.04, 3.24]} />
                <meshBasicMaterial color={colors.cream} />
              </mesh>
            ))}
            <mesh position={[0, -0.4, 1.6]}>
              <boxGeometry args={[5.04, 0.03, 0.04]} />
              <meshBasicMaterial color={colors.creamDim} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* LayerTower                                                          */
/* ------------------------------------------------------------------ */

export const LAYER_NAMES = ["Games", "CUDA", "Libraries", "Research"] as const;
const LAYER_H = 0.95;
const BLOCK_COLS = 3;
const BLOCK_ROWS = 2;
const TOWER_HX = 4.4;
const TOWER_HZ = 3.7;
const WALL_MAX = 5.2;

/** Right-edge anchor per layer (bottom to top: Games, CUDA, Libraries, Research). */
export const layerPositions: Vec3[] = LAYER_NAMES.map((_, i) => [
  2.4,
  i * LAYER_H + LAYER_H / 2 + 0.05,
  0.8,
]);

export interface LayerTowerProps {
  startFrame: number;
  buildFrames: number;
  cudaGlowFrame: number;
  wallStartFrame: number;
  wallFrames: number;
}

const LAYER_COLORS = [colors.slate, colors.slateLight, colors.steel, colors.creamDim];

export const LayerTower: React.FC<LayerTowerProps> = ({
  startFrame,
  buildFrames,
  cudaGlowFrame,
  wallStartFrame,
  wallFrames,
}) => {
  const frame = useCurrentFrame();
  const ref = useRef<THREE.InstancedMesh>(null);
  const glowTex = useGlowTexture();
  const perLayer = BLOCK_COLS * BLOCK_ROWS;
  const total = LAYER_NAMES.length * perLayer;
  const glowT = easeOut((frame - cudaGlowFrame) / 24);
  const wallT = easeIO((frame - wallStartFrame) / wallFrames);
  const wallH = Math.max(wallT * WALL_MAX, 0.0001);
  const cAmber = useMemo(() => new THREE.Color(colors.amber), []);

  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let li = 0; li < LAYER_NAMES.length; li++) {
      for (let k = 0; k < perLayer; k++) {
        const b = li * perLayer + k;
        const col = k % BLOCK_COLS;
        const row = Math.floor(k / BLOCK_COLS);
        const t0 = startFrame + (b / total) * buildFrames * 0.85;
        const t = easeOut((frame - t0) / (buildFrames * 0.15 + 6));
        dummy.position.set(
          (col - 1) * 1.5,
          li * LAYER_H + LAYER_H / 2 + (1 - t) * 5,
          (row - 0.5) * 1.5,
        );
        dummy.quaternion.identity();
        dummy.scale.set(1.4, LAYER_H - 0.08, 1.4);
        if (t < 0.001) dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        m.setMatrixAt(b, dummy.matrix);
        tmp.set(LAYER_COLORS[li]);
        if (li === 1) tmp.lerp(cAmber, glowT);
        m.setColorAt(b, tmp);
      }
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  const walls: { p: Vec3; s: Vec3 }[] = [
    { p: [0, wallH / 2, TOWER_HZ], s: [TOWER_HX * 2, wallH, 0.18] },
    { p: [0, wallH / 2, -TOWER_HZ], s: [TOWER_HX * 2, wallH, 0.18] },
    { p: [TOWER_HX, wallH / 2, 0], s: [0.18, wallH, TOWER_HZ * 2] },
    { p: [-TOWER_HX, wallH / 2, 0], s: [0.18, wallH, TOWER_HZ * 2] },
  ];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color={colors.slate} roughness={1} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, total]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.55} metalness={0.2} />
      </instancedMesh>
      <sprite
        position={[0, LAYER_H * 1.5, 1.2]}
        scale={[9, 3.6, 1]}
        visible={glowT > 0.001}
      >
        <spriteMaterial
          map={glowTex}
          color={colors.amber}
          transparent
          opacity={0.55 * glowT}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      {walls.map((w, i) => (
        <group key={i} visible={wallT > 0.001}>
          <mesh position={w.p} scale={w.s}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={colors.slateLight} roughness={0.7} />
          </mesh>
          <mesh
            position={[w.p[0], wallH, w.p[2]]}
            scale={[w.s[0] + 0.02, 0.05, w.s[2] + 0.02]}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={colors.cream} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
