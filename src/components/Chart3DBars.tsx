import React, { useLayoutEffect, useMemo, useRef } from "react";
import { interpolate, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { colors, easings } from "../design/tokens";

export interface Chart3DBarsProps {
  values: number[];
  buildFrames: number;
  maxHeight: number;
  startFrame?: number;
  collapse?: { atFrame: number; staggerFrames: number };
  crackBarIndex?: number;
  /** Frames the crack takes to travel up the bar (starts at collapse.atFrame - crackFrames). */
  crackFrames?: number;
  barColor?: string;
}

const BAR_W = 0.8;
const BAR_GAP = 1.25;
const CRACK_SEGS = 10;
const FALL_FRAMES = 24;

export const Chart3DBars: React.FC<Chart3DBarsProps> = ({
  values,
  buildFrames,
  maxHeight,
  startFrame = 0,
  collapse,
  crackBarIndex,
  crackFrames = 24,
  barColor = colors.steel,
}) => {
  const frame = useCurrentFrame();
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const capsRef = useRef<THREE.InstancedMesh>(null);
  const crackRef = useRef<THREE.InstancedMesh>(null);
  const n = values.length;
  const max = Math.max(...values, 1e-6);
  const tallest = useMemo(() => values.indexOf(Math.max(...values)), [values]);
  const crackIdx = crackBarIndex ?? tallest;

  const zig = useMemo(
    () => Array.from({ length: CRACK_SEGS + 1 }, (_, k) => (random(`crack-${k}`) - 0.5) * BAR_W * 0.6),
    [],
  );

  useLayoutEffect(() => {
    const bars = barsRef.current;
    const caps = capsRef.current;
    const crack = crackRef.current;
    if (!bars || !caps) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const x0 = (-(n - 1) * BAR_GAP) / 2;
    const heights: number[] = [];
    for (let i = 0; i < n; i++) {
      const rise = interpolate(frame - startFrame - i * (buildFrames / (n * 2.2)), [0, buildFrames * 0.55], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easings.outExpo,
      });
      let fall = 0;
      if (collapse) {
        fall = interpolate(frame - collapse.atFrame - i * collapse.staggerFrames, [0, FALL_FRAMES], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: (t) => t * t,
        });
      }
      const h = Math.max(0.001, (values[i] / max) * maxHeight * rise * (1 - 0.92 * fall));
      heights.push(h);
      pos.set(x0 + i * BAR_GAP, h / 2, 0);
      scl.set(BAR_W, h, BAR_W);
      m.compose(pos, q, scl);
      bars.setMatrixAt(i, m);
      pos.set(x0 + i * BAR_GAP, h, 0);
      scl.set(BAR_W + 0.06, 0.07, BAR_W + 0.06);
      m.compose(pos, q, scl);
      caps.setMatrixAt(i, m);
    }
    bars.instanceMatrix.needsUpdate = true;
    caps.instanceMatrix.needsUpdate = true;

    if (crack) {
      const crackStart = (collapse ? collapse.atFrame : startFrame + buildFrames) - crackFrames;
      const prog = crackBarIndex === undefined && !collapse ? 0 : interpolate(frame - crackStart, [0, crackFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easings.inOut,
      });
      const hTop = heights[crackIdx] ?? 0;
      const cx = x0 + crackIdx * BAR_GAP;
      const zq = new THREE.Quaternion();
      const zAxis = new THREE.Vector3(0, 0, 1);
      for (let k = 0; k < CRACK_SEGS; k++) {
        const y0 = (k / CRACK_SEGS) * hTop;
        const y1 = ((k + 1) / CRACK_SEGS) * hTop;
        const a = new THREE.Vector2(cx + zig[k], y0);
        const b = new THREE.Vector2(cx + zig[k + 1], y1);
        const grow = Math.min(1, Math.max(0, prog * CRACK_SEGS - k));
        const len = a.distanceTo(b) * grow;
        const ang = Math.atan2(b.y - a.y, b.x - a.x);
        zq.setFromAxisAngle(zAxis, ang);
        const mid = a.clone().lerp(b, grow / 2);
        pos.set(mid.x, mid.y, BAR_W / 2 + 0.02);
        scl.set(Math.max(0.0001, len), grow > 0 ? 0.07 : 0.0001, 0.04);
        m.compose(pos, zq, scl);
        crack.setMatrixAt(k, m);
      }
      crack.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh key={`b${n}`} ref={barsRef} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={barColor} roughness={0.6} metalness={0.15} />
      </instancedMesh>
      <instancedMesh key={`c${n}`} ref={capsRef} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors.cream} roughness={0.4} />
      </instancedMesh>
      {(crackBarIndex !== undefined || collapse) && (
        <instancedMesh ref={crackRef} args={[undefined, undefined, CRACK_SEGS]} frustumCulled={false}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={colors.red} />
        </instancedMesh>
      )}
    </group>
  );
};
