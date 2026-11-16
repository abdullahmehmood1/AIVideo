import React, { useLayoutEffect, useMemo, useRef } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { colors, easings, fonts } from "../design/tokens";
import { getPerfScale } from "../config";

export type RibbonVec = [number, number, number];

const RIBBON_CTRL: RibbonVec[] = [
  [0, 0, 4],
  [1.6, 0.3, -4],
  [-1.4, 0.8, -12],
  [1.2, 0.2, -20],
  [-1.0, 0.9, -28],
  [0.8, 0.3, -36],
  [0, 0.6, -46],
];

const curve = new THREE.CatmullRomCurve3(
  RIBBON_CTRL.map((p) => new THREE.Vector3(...p)),
  false,
  "catmullrom",
  0.5,
);

/** Point on the ribbon for t in [0,1] (pure, deterministic). */
export const ribbonPoint = (t: number): RibbonVec => {
  const p = curve.getPoint(Math.min(1, Math.max(0, t)));
  return [p.x, p.y, p.z];
};

export interface TimelineRibbon3DProps {
  /** t positions (0..1) for milestone markers. */
  milestones: number[];
  startFrame?: number;
  drawFrames?: number;
  width?: number;
  color?: string;
  markerColor?: string;
}

const SEG = 96;

export const TimelineRibbon3D: React.FC<TimelineRibbon3DProps> = ({
  milestones,
  startFrame = 0,
  drawFrames = 90,
  width = 0.9,
  color = colors.steel,
  markerColor = colors.amber,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const perf = getPerfScale();
  const seg = Math.max(24, Math.round((SEG * perf.segments) / 32));
  const markerRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => {
    const pos: number[] = [];
    const idx: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i <= seg; i++) {
      const t = i / seg;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t);
      const side = new THREE.Vector3().crossVectors(tan, up).normalize().multiplyScalar(width / 2);
      pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z);
      if (i < seg) {
        const a = i * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [seg, width]);

  const draw = interpolate(local, [0, drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });
  geometry.setDrawRange(0, Math.floor(draw * seg) * 6);

  useLayoutEffect(() => {
    const mesh = markerRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const pv = new THREE.Vector3();
    milestones.forEach((t, i) => {
      const reached = draw >= t ? 1 : 0;
      const pop = reached
        ? interpolate(draw - t, [0, 0.05], [0, 1], {
            extrapolateRight: "clamp",
            easing: easings.outExpo,
          })
        : 0;
      const p = curve.getPoint(t);
      pv.set(p.x, p.y + 0.35 * pop, p.z);
      const k = Math.max(0.0001, pop);
      s.set(0.5 * k, 0.9 * k, 0.5 * k);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
      m.compose(pv, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.7} metalness={0.2} />
      </mesh>
      <instancedMesh
        key={milestones.length}
        ref={markerRef}
        args={[undefined, undefined, Math.max(1, milestones.length)]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={markerColor} roughness={0.5} />
      </instancedMesh>
    </group>
  );
};

export interface MilestoneCardProps {
  date: string;
  title: string;
  startFrame?: number;
  x?: number;
  y?: number;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  date,
  title,
  startFrame = 0,
  x = 120,
  y = 120,
}) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  if (local < 0) return null;
  const p = interpolate(local, [0, 26], [0, 1], {
    extrapolateRight: "clamp",
    easing: easings.outExpo,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        padding: "24px 36px",
        background: colors.slate,
        borderLeft: `8px solid ${colors.amber}`,
        opacity: p,
        transform: `translateY(${(1 - p) * 32}px) scale(${0.96 + 0.04 * p})`,
        transformOrigin: "left top",
      }}
    >
      <div style={{ fontFamily: fonts.mono, fontWeight: 700, fontSize: 44, color: colors.amber }}>
        {date}
      </div>
      <div style={{ fontFamily: fonts.serif, fontWeight: 700, fontSize: 56, color: colors.cream }}>
        {title}
      </div>
    </div>
  );
};

