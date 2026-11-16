import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { colors } from "../design/tokens";
import { getPerfScale } from "../config";
import type { CameraState } from "../design/SceneStage";

export interface DataCenterAisleProps {
  length?: number;
  /** Racks per side. */
  rackCount?: number;
  startFrame?: number;
}

const dummy = new THREE.Object3D();
const tmp = new THREE.Color();
const cAmber = new THREE.Color(colors.amber);
const cCream = new THREE.Color(colors.cream);
const cSteel = new THREE.Color(colors.steel);
const cOff = new THREE.Color(colors.slateLight);

const AISLE_HALF = 2.1;
const RACK_W = 1.2;
const RACK_H = 3.4;
const RACK_D = 0.95;

export const aisleCamera = (frame: number, durationFrames: number): CameraState => {
  const t = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const z = 7 - t * 36;
  return {
    position: [Math.sin(t * Math.PI) * 0.25, 1.65, z],
    lookAt: [0, 1.7, z - 14],
    fov: 52,
  };
};

const useGlowTexture = (): THREE.CanvasTexture =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,240,205,1)");
      grad.addColorStop(0.3, "rgba(217,164,65,0.55)");
      grad.addColorStop(1, "rgba(217,164,65,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(c);
  }, []);

export const DataCenterAisle: React.FC<DataCenterAisleProps> = ({
  length = 60,
  rackCount = 20,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const perf = getPerfScale();
  const glowTex = useGlowTexture();
  const lightsRef = useRef<THREE.InstancedMesh>(null);
  const racksRef = useRef<THREE.InstancedMesh>(null);
  const panelsRef = useRef<THREE.InstancedMesh>(null);
  const gridRef = useRef<THREE.InstancedMesh>(null);

  const pitch = length / rackCount;
  const perRack = Math.max(4, Math.round(16 * perf.instanceScale));

  const layout = useMemo(() => {
    const racks: { x: number; z: number; side: number }[] = [];
    for (let s = 0; s < 2; s++) {
      for (let i = 0; i < rackCount; i++) {
        const side = s === 0 ? -1 : 1;
        racks.push({ side, x: side * (AISLE_HALF + RACK_D / 2), z: -i * pitch });
      }
    }
    const lights: {
      x: number;
      y: number;
      z: number;
      period: number;
      ph: number;
      kind: number;
      bias: number;
    }[] = [];
    racks.forEach((r, ri) => {
      for (let k = 0; k < perRack; k++) {
        for (let col = 0; col < 2; col++) {
          const key = `l-${ri}-${k}-${col}`;
          const kr = random(key + "k");
          lights.push({
            x: r.x - r.side * (RACK_D / 2 + 0.02),
            y: 0.35 + (k / (perRack - 1)) * (RACK_H - 0.8),
            z: r.z + (col - 0.5) * 0.4,
            period: 5 + Math.floor(random(key + "p") * 18),
            ph: Math.floor(random(key + "o") * 100),
            kind: kr < 0.12 ? 2 : kr < 0.55 ? 0 : 1,
            bias: 0.25 + random(key + "b") * 0.5,
          });
        }
      }
    });
    return { racks, lights };
  }, [rackCount, pitch, perRack]);

  const gridCount = Math.round(length / 2) + 1;

  useLayoutEffect(() => {
    const rm = racksRef.current;
    const pm = panelsRef.current;
    const lm = lightsRef.current;
    const gm = gridRef.current;
    if (!rm || !pm || !lm || !gm) return;
    layout.racks.forEach((r, i) => {
      dummy.quaternion.identity();
      dummy.position.set(r.x, RACK_H / 2, r.z);
      dummy.scale.set(RACK_D, RACK_H, RACK_W);
      dummy.updateMatrix();
      rm.setMatrixAt(i, dummy.matrix);
      dummy.position.set(r.x - r.side * (RACK_D / 2 + 0.005), RACK_H / 2, r.z);
      dummy.scale.set(0.02, RACK_H - 0.3, RACK_W - 0.16);
      dummy.updateMatrix();
      pm.setMatrixAt(i, dummy.matrix);
    });
    rm.instanceMatrix.needsUpdate = true;
    pm.instanceMatrix.needsUpdate = true;

    const f = Math.max(0, frame - startFrame);
    layout.lights.forEach((l, i) => {
      const step = Math.floor((f + l.ph) / l.period);
      const on = random(`blink-${i}-${step}`) < l.bias;
      dummy.position.set(l.x, l.y, l.z);
      dummy.scale.set(0.03, 0.05, 0.09);
      dummy.updateMatrix();
      lm.setMatrixAt(i, dummy.matrix);
      if (on) {
        tmp.copy(l.kind === 0 ? cAmber : l.kind === 1 ? cCream : cSteel);
      } else {
        tmp.copy(cOff);
      }
      lm.setColorAt(i, tmp);
    });
    lm.instanceMatrix.needsUpdate = true;
    if (lm.instanceColor) lm.instanceColor.needsUpdate = true;

    let gi = 0;
    for (let i = 0; i < gridCount; i++) {
      dummy.position.set(0, 0.005, -i * 2 + 1);
      dummy.scale.set(AISLE_HALF * 2, 0.004, 0.025);
      dummy.updateMatrix();
      gm.setMatrixAt(gi++, dummy.matrix);
    }
    for (const x of [-AISLE_HALF * 0.5, 0, AISLE_HALF * 0.5]) {
      dummy.position.set(x, 0.005, -length / 2);
      dummy.scale.set(0.025, 0.004, length + 4);
      dummy.updateMatrix();
      gm.setMatrixAt(gi++, dummy.matrix);
    }
    gm.instanceMatrix.needsUpdate = true;
  });

  const endZ = -length - 2;
  const fade = interpolate(frame - startFrame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -length / 2]}>
        <planeGeometry args={[AISLE_HALF * 2 + 2 * RACK_D, length + 8]} />
        <meshStandardMaterial color={colors.slateLight} roughness={0.9} />
      </mesh>
      <instancedMesh ref={gridRef} args={[undefined, undefined, gridCount + 3]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={colors.steel} transparent opacity={0.28} />
      </instancedMesh>
      <instancedMesh
        ref={racksRef}
        args={[undefined, undefined, layout.racks.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors.slate} roughness={0.75} metalness={0.2} />
      </instancedMesh>
      <instancedMesh
        ref={panelsRef}
        args={[undefined, undefined, layout.racks.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={colors.slateLight} roughness={0.6} metalness={0.3} />
      </instancedMesh>
      <instancedMesh
        ref={lightsRef}
        args={[undefined, undefined, layout.lights.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      <mesh position={[0, RACK_H, -length / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[AISLE_HALF * 2 + 2 * RACK_D, length + 8]} />
        <meshStandardMaterial color={colors.bgDeep} roughness={1} />
      </mesh>
      <sprite position={[0, 1.9, endZ]} scale={[11, 7, 1]}>
        <spriteMaterial
          map={glowTex}
          transparent
          opacity={0.75 * fade}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  );
};
