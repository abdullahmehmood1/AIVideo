import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { colors } from "../design/tokens";
import { getPerfScale } from "../config";

export interface NeuralNet3DProps {
  layers?: number[];
  spacing?: number;
  /** Layers travelled per frame by pulses. */
  pulseSpeed?: number;
  startFrame?: number;
  /** Frame at which everything collapses into one point of light. */
  compressAt?: number;
  compressFrames?: number;
  seed?: string;
}

const DEFAULT_LAYERS = [4, 6, 8, 8, 6, 4];
const dummy = new THREE.Object3D();
const X_AXIS = new THREE.Vector3(1, 0, 0);
const cDim = new THREE.Color(colors.slateLight);
const cSteel = new THREE.Color(colors.steel);
const cAmber = new THREE.Color(colors.amber);
const cCream = new THREE.Color(colors.cream);
const tmpColor = new THREE.Color();
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpDir = new THREE.Vector3();

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeIO = (x: number) => Easing.inOut(Easing.cubic)(clamp01(x));

/** Camera distance helper: slow push-in. */
export const netCameraZ = (frame: number): number =>
  interpolate(frame, [0, 240], [15, 9], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

const useGlowTexture = (): THREE.CanvasTexture =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const g = c.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255,244,214,1)");
      grad.addColorStop(0.18, "rgba(217,164,65,0.7)");
      grad.addColorStop(0.55, "rgba(217,164,65,0.14)");
      grad.addColorStop(1, "rgba(217,164,65,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

export const NeuralNet3D: React.FC<NeuralNet3DProps> = ({
  layers = DEFAULT_LAYERS,
  spacing = 2.4,
  pulseSpeed = 0.075,
  startFrame = 0,
  compressAt = 1e9,
  compressFrames = 40,
  seed = "neural",
}) => {
  const frame = useCurrentFrame();
  const perf = getPerfScale();
  const glowTex = useGlowTexture();
  const L = layers.length;

  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const edgeMesh = useRef<THREE.InstancedMesh>(null);
  const pulseMesh = useRef<THREE.InstancedMesh>(null);

  const net = useMemo(() => {
    const nodes: { p: THREE.Vector3; layer: number }[] = [];
    const layerStart: number[] = [];
    layers.forEach((n, li) => {
      layerStart.push(nodes.length);
      for (let k = 0; k < n; k++) {
        nodes.push({
          layer: li,
          p: new THREE.Vector3(
            (li - (L - 1) / 2) * spacing,
            (k - (n - 1) / 2) * 0.78,
            (random(`${seed}-z-${li}-${k}`) - 0.5) * 2.6,
          ),
        });
      }
    });
    const cap = Math.round(600 * Math.min(1, perf.instanceScale));
    let total = 0;
    for (let li = 0; li < L - 1; li++) total += layers[li] * layers[li + 1];
    const prob = Math.min(0.7, cap / Math.max(1, total));
    const edges: [number, number][] = [];
    const out: number[][] = nodes.map(() => []);
    for (let li = 0; li < L - 1; li++) {
      for (let a = 0; a < layers[li]; a++) {
        let had = false;
        for (let b = 0; b < layers[li + 1]; b++) {
          if (random(`${seed}-e-${li}-${a}-${b}`) < prob) {
            edges.push([layerStart[li] + a, layerStart[li + 1] + b]);
            out[layerStart[li] + a].push(layerStart[li + 1] + b);
            had = true;
          }
        }
        if (!had) {
          const b = Math.floor(random(`${seed}-f-${li}-${a}`) * layers[li + 1]);
          edges.push([layerStart[li] + a, layerStart[li + 1] + b]);
          out[layerStart[li] + a].push(layerStart[li + 1] + b);
        }
      }
    }
    const pulseCount = Math.round(44 * Math.min(1, perf.instanceScale + 0.2));
    const pulses = Array.from({ length: pulseCount }, (_, i) => {
      const path: number[] = [
        layerStart[0] + Math.floor(random(`${seed}-ps-${i}`) * layers[0]),
      ];
      for (let li = 0; li < L - 1; li++) {
        const opts = out[path[li]];
        path.push(opts[Math.floor(random(`${seed}-pp-${i}-${li}`) * opts.length)]);
      }
      return { path, off: random(`${seed}-po-${i}`) * 0.55 };
    });
    return { nodes, edges: edges.slice(0, cap), pulses, layerStart };
  }, [layers, L, spacing, seed, perf.instanceScale]);

  const cycle = L - 1 + 2.2;
  const u = (frame - startFrame) * pulseSpeed;
  const c = easeIO((frame - compressAt) / compressFrames);
  const intro = clamp01((frame - startFrame) / 24);
  const layerGlow = (li: number): number => {
    const x = u - 0.28 - li;
    if (x < 0) return 0;
    const tt = ((x % cycle) + cycle) % cycle;
    return Math.exp(-tt * 1.5);
  };

  useLayoutEffect(() => {
    const nm = nodeMesh.current;
    const em = edgeMesh.current;
    const pm = pulseMesh.current;
    if (!nm || !em || !pm) return;
    net.nodes.forEach((n, i) => {
      const gl = layerGlow(n.layer);
      dummy.position.copy(n.p).multiplyScalar(1 - c);
      dummy.quaternion.identity();
      const s = (0.2 + 0.07 * gl) * intro * (1 - 0.55 * c) * (c > 0.995 ? 0.5 : 1);
      dummy.scale.setScalar(Math.max(s, 0.0001));
      dummy.updateMatrix();
      nm.setMatrixAt(i, dummy.matrix);
      tmpColor.copy(cSteel).lerp(cAmber, Math.min(1, gl * 0.9 + c));
      nm.setColorAt(i, tmpColor);
    });
    nm.instanceMatrix.needsUpdate = true;
    if (nm.instanceColor) nm.instanceColor.needsUpdate = true;

    net.edges.forEach(([a, b], i) => {
      tmpA.copy(net.nodes[a].p).multiplyScalar(1 - c);
      tmpB.copy(net.nodes[b].p).multiplyScalar(1 - c);
      tmpDir.subVectors(tmpB, tmpA);
      const len = tmpDir.length();
      if (len < 1e-3) {
        dummy.scale.setScalar(0.0001);
        dummy.position.set(0, 0, 0);
      } else {
        dummy.position.addVectors(tmpA, tmpB).multiplyScalar(0.5);
        dummy.quaternion.setFromUnitVectors(X_AXIS, tmpDir.normalize());
        const th = 0.012 * intro * (1 - c);
        dummy.scale.set(len, th, th);
      }
      dummy.updateMatrix();
      em.setMatrixAt(i, dummy.matrix);
      const gl = layerGlow(net.nodes[b].layer);
      tmpColor.copy(cDim).lerp(cSteel, 0.5).lerp(cAmber, gl * 0.55);
      em.setColorAt(i, tmpColor);
    });
    em.instanceMatrix.needsUpdate = true;
    if (em.instanceColor) em.instanceColor.needsUpdate = true;

    net.pulses.forEach((p, i) => {
      const t = (((u - p.off) % cycle) + cycle) % cycle;
      const visible = u > p.off && t <= L - 1 && c < 0.6;
      if (!visible) {
        dummy.scale.setScalar(0.0001);
        dummy.position.set(0, 0, 0);
      } else {
        const seg = Math.min(Math.floor(t), L - 2);
        const f = t - seg;
        tmpA.copy(net.nodes[p.path[seg]].p);
        tmpB.copy(net.nodes[p.path[seg + 1]].p);
        dummy.position.lerpVectors(tmpA, tmpB, f).multiplyScalar(1 - c);
        dummy.scale.setScalar(0.11 * (1 - c / 0.6));
      }
      dummy.quaternion.identity();
      dummy.updateMatrix();
      pm.setMatrixAt(i, dummy.matrix);
      tmpColor.copy(cAmber).lerp(cCream, 0.35);
      pm.setColorAt(i, tmpColor);
    });
    pm.instanceMatrix.needsUpdate = true;
    if (pm.instanceColor) pm.instanceColor.needsUpdate = true;
  });

  const glowScale = 1.2 + c * 9;
  const glowOpacity = Math.min(1, c * 1.2) * 0.95;

  return (
    <group>
      <instancedMesh
        ref={edgeMesh}
        args={[undefined, undefined, net.edges.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffffff" />
      </instancedMesh>
      <instancedMesh
        ref={nodeMesh}
        args={[undefined, undefined, net.nodes.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.1} />
      </instancedMesh>
      <instancedMesh
        ref={pulseMesh}
        args={[undefined, undefined, net.pulses.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#ffffff" fog={false} />
      </instancedMesh>
      <sprite scale={[glowScale, glowScale, 1]} position={[0, 0, 0.2]}>
        <spriteMaterial
          map={glowTex}
          transparent
          opacity={glowOpacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  );
};
