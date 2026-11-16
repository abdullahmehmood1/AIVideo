import React, { useMemo } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { getPerfScale } from "../config";
import { colors } from "../design/tokens";
import { globeRotation, latLonToVec3 } from "./GlobeDots";

export interface ArcSpec {
  from: [number, number];
  to: [number, number];
  color?: string;
  /** Optional color change over time: colorFrom -> colorTo at switchFrame (blended over 12 frames). */
  colorFrom?: string;
  colorTo?: string;
  switchFrame?: number;
  startFrame: number;
  drawFrames: number;
  /** Peak altitude as a fraction of radius (default scales with distance). */
  height?: number;
}

export interface ArcLinesProps {
  arcs: ArcSpec[];
  radius?: number;
  /** Must match the GlobeDots rotation to stay glued to it. */
  rotationY?: (frame: number) => number;
  spinSpeed?: number;
  /** Tube thickness as fraction of radius. */
  thickness?: number;
}

const RADIAL = 5;

const buildCurve = (
  a: [number, number],
  b: [number, number],
  radius: number,
  height: number | undefined,
  samples: number,
): THREE.CatmullRomCurve3 => {
  const va = new THREE.Vector3(...latLonToVec3(a[0], a[1], 1));
  const vb = new THREE.Vector3(...latLonToVec3(b[0], b[1], 1));
  const omega = Math.acos(THREE.MathUtils.clamp(va.dot(vb), -1, 1));
  const peak = height ?? 0.08 + (omega / Math.PI) * 0.45;
  const pts: THREE.Vector3[] = [];
  const so = Math.sin(omega) || 1;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const k1 = Math.sin((1 - t) * omega) / so;
    const k2 = Math.sin(t * omega) / so;
    const p = va.clone().multiplyScalar(k1).addScaledVector(vb, k2);
    p.normalize().multiplyScalar(radius * (1.006 + Math.sin(Math.PI * t) * peak));
    pts.push(p);
  }
  return new THREE.CatmullRomCurve3(pts);
};

const Arc: React.FC<{
  arc: ArcSpec;
  radius: number;
  thickness: number;
  samples: number;
}> = ({ arc, radius, thickness, samples }) => {
  const frame = useCurrentFrame();
  const { curve, geom, indexCount } = useMemo(() => {
    const c = buildCurve(arc.from, arc.to, radius, arc.height, samples);
    const g = new THREE.TubeGeometry(c, samples * 2, radius * thickness, RADIAL, false);
    return { curve: c, geom: g, indexCount: g.index ? g.index.count : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arc.from[0], arc.from[1], arc.to[0], arc.to[1], arc.height, radius, samples, thickness]);

  const p = interpolate(frame, [arc.startFrame, arc.startFrame + arc.drawFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const segCount = samples * 2;
  const drawn = Math.floor(p * segCount);
  geom.setDrawRange(0, Math.min(indexCount, drawn * RADIAL * 6));

  const base = arc.color ?? colors.amber;
  const c0 = new THREE.Color(arc.colorFrom ?? base);
  const c1 = new THREE.Color(arc.colorTo ?? arc.colorFrom ?? base);
  const mix =
    arc.switchFrame === undefined
      ? 0
      : interpolate(frame, [arc.switchFrame, arc.switchFrame + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const color = c0.clone().lerp(c1, mix);

  if (p <= 0) return null;
  const head = curve.getPointAt(Math.min(1, p));
  const pulse = 1 + 0.25 * Math.sin(frame * 0.4);
  const fadeHead = p >= 1 ? Math.max(0, 1 - (frame - arc.startFrame - arc.drawFrames) / 10) : 1;
  return (
    <group>
      <mesh geometry={geom} frustumCulled={false}>
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      {fadeHead > 0 && (
        <mesh position={head} scale={fadeHead * pulse}>
          <sphereGeometry args={[radius * 0.03, 12, 8]} />
          <meshBasicMaterial color={colors.cream} />
        </mesh>
      )}
    </group>
  );
};

export const ArcLines: React.FC<ArcLinesProps> = ({
  arcs,
  radius = 3,
  rotationY,
  spinSpeed = 0.004,
  thickness = 0.006,
}) => {
  const frame = useCurrentFrame();
  const { segments } = getPerfScale();
  const rotY = rotationY ? rotationY(frame) : globeRotation(frame, spinSpeed);
  return (
    <group rotation={[0, rotY, 0]}>
      {arcs.map((a, i) => (
        <Arc key={i} arc={a} radius={radius} thickness={thickness} samples={segments * 2} />
      ))}
    </group>
  );
};

