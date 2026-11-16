import React, { useLayoutEffect, useMemo, useRef } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { geoBounds, geoContains } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import landTopo from "world-atlas/land-110m.json";
import { getPerfScale } from "../config";
import { colors } from "../design/tokens";

/**
 * COORDINATE CONVENTIONS (documented for scenes that project labels)
 * - Local globe space: lat/lon -> x = r cosφ sinλ, y = r sinφ, z = r cosφ cosλ.
 *   So lon 0 / lat 0 faces +Z (towards the default camera), lon +90 faces +X.
 * - The globe group is rotated about Y by `rotationY(frame)` (radians). A point at
 *   longitude λ then sits at longitude λ + θ. To face longitude L towards +Z, use θ = -L.
 * - `latLonToVec3(lat, lon, r, rotY)` returns the WORLD position (group at origin) when rotY
 *   is given, otherwise the local position.
 * - `globeRotation(frame, spinSpeed, faceLon)` is the default rotation function.
 */
export const globeRotation = (
  frame: number,
  spinSpeed = 0.004,
  faceLon = -40,
): number => (-faceLon * Math.PI) / 180 + frame * spinSpeed;

export const latLonToVec3 = (
  lat: number,
  lon: number,
  radius: number,
  rotY = 0,
): [number, number, number] => {
  const phi = (lat * Math.PI) / 180;
  const lam = (lon * Math.PI) / 180 + rotY;
  return [
    radius * Math.cos(phi) * Math.sin(lam),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.cos(lam),
  ];
};

export interface GlobeHighlight {
  lat: number;
  lon: number;
  label?: string;
  color?: string;
  startFrame?: number;
}

export interface GlobeDotsProps {
  radius?: number;
  /** Rotation about Y in radians as a function of frame. Defaults to globeRotation(frame, spinSpeed). */
  rotationY?: (frame: number) => number;
  spinSpeed?: number;
  highlights?: GlobeHighlight[];
  children?: React.ReactNode;
}

type Ring = [number, number][];
interface LandPoly {
  feature: GeoJSON.Feature<GeoJSON.Polygon>;
  bbox: [number, number, number, number] | null;
}

const landPolys = (() => {
  const topo = landTopo as unknown as Topology;
  const land = feature(topo, topo.objects.land as never) as unknown as
    | GeoJSON.Feature
    | GeoJSON.FeatureCollection;
  const geoms: GeoJSON.Geometry[] =
    land.type === "FeatureCollection"
      ? land.features.map((f) => f.geometry)
      : [land.geometry];
  const polys: LandPoly[] = [];
  const push = (coords: Ring[]) => {
    const f: GeoJSON.Feature<GeoJSON.Polygon> = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: coords },
    };
    const b = geoBounds(f);
    const wraps = b[0][0] > b[1][0];
    polys.push({
      feature: f,
      bbox: wraps ? null : [b[0][0], b[0][1], b[1][0], b[1][1]],
    });
  };
  for (const g of geoms) {
    if (g.type === "Polygon") push(g.coordinates as Ring[]);
    else if (g.type === "MultiPolygon")
      for (const p of g.coordinates) push(p as Ring[]);
  }
  return polys;
})();

const isLand = (lon: number, lat: number): boolean => {
  for (const p of landPolys) {
    const b = p.bbox;
    if (b && (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3])) continue;
    if (geoContains(p.feature, [lon, lat])) return true;
  }
  return false;
};

const cache = new Map<number, Float32Array>();
/** Returns flat [lat, lon, ...] of land dots on a Fibonacci grid. */
const sampleLand = (total: number): Float32Array => {
  const hit = cache.get(total);
  if (hit) return hit;
  const out: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < total; i++) {
    const y = 1 - ((i + 0.5) / total) * 2;
    const lat = (Math.asin(y) * 180) / Math.PI;
    let lon = (((i * golden) % (Math.PI * 2)) * 180) / Math.PI;
    lon = ((lon + 540) % 360) - 180;
    if (isLand(lon, lat)) out.push(lat, lon);
  }
  const arr = new Float32Array(out);
  cache.set(total, arr);
  return arr;
};

const Z = new THREE.Vector3(0, 0, 1);

export const GlobeDots: React.FC<GlobeDotsProps> = ({
  radius = 3,
  rotationY,
  spinSpeed = 0.004,
  highlights = [],
  children,
}) => {
  const frame = useCurrentFrame();
  const { instanceScale } = getPerfScale();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const total = Math.round(19000 * Math.min(instanceScale, 1.2));
  const land = useMemo(() => sampleLand(total), [total]);
  const count = land.length / 2;

  useLayoutEffect(() => {
    const m = meshRef.current;
    if (!m) return;
    const dotR = Math.sqrt((4 * Math.PI) / total) * radius * 0.36;
    const o = new THREE.Object3D();
    const n = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const [x, y, zc] = latLonToVec3(land[i * 2], land[i * 2 + 1], 1);
      n.set(x, y, zc);
      o.position.copy(n).multiplyScalar(radius * 1.004);
      o.quaternion.setFromUnitVectors(Z, n);
      o.scale.setScalar(dotR);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.count = count;
    m.instanceMatrix.needsUpdate = true;
  }, [land, count, radius, total]);

  const rotY = rotationY ? rotationY(frame) : globeRotation(frame, spinSpeed);
  const segs = getPerfScale().segments;

  return (
    <group rotation={[0, rotY, 0]}>
      <mesh>
        <sphereGeometry args={[radius, segs * 2, segs]} />
        <meshBasicMaterial color="#1B222B" />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[radius, segs * 2, segs]} />
        <meshBasicMaterial
          color={colors.steel}
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <circleGeometry args={[1, 6]} />
        <meshBasicMaterial color={colors.creamDim} />
      </instancedMesh>
      {highlights.map((h, i) => (
        <Marker key={i} h={h} radius={radius} />
      ))}
      {children}
    </group>
  );
};

const Marker: React.FC<{ h: GlobeHighlight; radius: number }> = ({
  h,
  radius,
}) => {
  const frame = useCurrentFrame();
  const start = h.startFrame ?? 0;
  const t = frame - start;
  const quat = useMemo(() => {
    const [x, y, z] = latLonToVec3(h.lat, h.lon, 1);
    return new THREE.Quaternion().setFromUnitVectors(
      Z,
      new THREE.Vector3(x, y, z),
    );
  }, [h.lat, h.lon]);
  if (t < 0) return null;
  const pop = Math.min(1, t / 12);
  const phase = (t % 54) / 54;
  const color = h.color ?? colors.amber;
  const pos = latLonToVec3(h.lat, h.lon, radius * 1.01);
  const ringR = radius * (0.03 + phase * 0.11);
  return (
    <group position={pos} quaternion={quat}>
      <mesh scale={pop}>
        <circleGeometry args={[radius * 0.028, 20]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh scale={pop}>
        <ringGeometry args={[ringR, ringR + radius * 0.006, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={(1 - phase) * 0.9}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};
