import React, { useCallback } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { formatFactValue, getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { ArcLines } from "../components/ArcLines";
import { Callout } from "../components/Callout";
import { GlobeDots, globeRotation, latLonToVec3 } from "../components/GlobeDots";
import { LowerThird } from "../components/LowerThird";
import { moatPositions, StackedMoats } from "../components/Monolith";
import {
  projectToScreen,
  SceneStage,
  type CameraPath,
} from "../design/SceneStage";
import { colors, easings, fonts, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S7_Moat")!;
const script = scriptData.scenes.find((s) => s.id === "S7_Moat")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_SUPPLY_CHAIN_FRAME = 180;
export const BEAT_STACKED_MOATS_FRAME = 1260;

const US_COORDS: [number, number] = [37.38, -121.96];
const TW_COORDS: [number, number] = [24.8, 120.97];
const GLOBE_R = 3.2;

// Orbit globe from US (-122 lon) across Pacific to Taiwan (+121 lon)
const moatGlobeRot = (f: number) => {
  const lon = interpolate(f, [0, BEAT_STACKED_MOATS_FRAME], [-115, 118], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });
  return globeRotation(0, 0, lon);
};

export const S7_Moat: React.FC = () => {
  const frame = useCurrentFrame();
  const mellanoxYear = getFact("mellanox_year");
  const mellanoxVal = getFact("mellanox_value");

  const inStack = frame >= BEAT_STACKED_MOATS_FRAME;

  const cameraPath: CameraPath = useCallback((f: number) => {
    if (f < BEAT_STACKED_MOATS_FRAME) {
      const p = interpolate(f, [0, BEAT_STACKED_MOATS_FRAME], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easings.inOut,
      });
      return {
        position: [
          Math.sin(p * Math.PI * 0.5) * 1.4,
          1.4 + Math.sin(p * Math.PI) * 0.8,
          10.2 - p * 0.8,
        ],
        lookAt: [0, 0.2, 0],
        fov: 40,
      };
    }
    const p = interpolate(
      f,
      [BEAT_STACKED_MOATS_FRAME, SCENE_DURATION_FRAMES],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: easings.inOut,
      },
    );
    return {
      position: [-5.2 + p * 3.2, 3.4 + p * 0.8, 12.2 - p * 1.4],
      lookAt: [0.6, 1.4, 0],
      fov: 42,
    };
  }, []);

  const cam = cameraPath(frame);
  const rY = moatGlobeRot(frame);
  const usScreen = projectToScreen(
    latLonToVec3(US_COORDS[0], US_COORDS[1], GLOBE_R, rY),
    cam,
  );
  const twScreen = projectToScreen(
    latLonToVec3(TW_COORDS[0], TW_COORDS[1], GLOBE_R, rY),
    cam,
  );

  const stackScreen0 = projectToScreen(moatPositions[0], cam);
  const stackScreen1 = projectToScreen(moatPositions[1], cam);
  const stackScreen2 = projectToScreen(moatPositions[2], cam);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage cameraPath={cameraPath} fogNear={12} fogFar={40} glow={0.35}>
        {!inStack ? (
          <>
            <GlobeDots
              radius={GLOBE_R}
              rotationY={moatGlobeRot}
              highlights={[
                { lat: US_COORDS[0], lon: US_COORDS[1], startFrame: 20 },
                {
                  lat: TW_COORDS[0],
                  lon: TW_COORDS[1],
                  startFrame: BEAT_SUPPLY_CHAIN_FRAME + 90,
                },
              ]}
            />
            <ArcLines
              radius={GLOBE_R}
              rotationY={moatGlobeRot}
              arcs={[
                {
                  from: US_COORDS,
                  to: TW_COORDS,
                  startFrame: BEAT_SUPPLY_CHAIN_FRAME,
                  drawFrames: 260,
                  color: colors.amber,
                },
              ]}
            />
          </>
        ) : (
          <StackedMoats
            startFrame={BEAT_STACKED_MOATS_FRAME}
            stackFrames={380}
          />
        )}
      </SceneStage>

      {/* Top Section Title */}
      <div
        style={{
          position: "absolute",
          top: 72,
          left: 112,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: typeScale.heading,
            fontWeight: 700,
            color: colors.cream,
          }}
        >
          {script.title}
        </div>
      </div>

      {/* Globe Supply-Chain Callouts vs Stacked Moats Callouts */}
      {!inStack ? (
        <>
          {frame < 720 && (
            <Callout
              x={Math.max(360, Math.min(1380, usScreen.x))}
              y={Math.max(320, Math.min(720, usScreen.y))}
              label={scriptData.moatLabels.design}
              side="right"
              startFrame={40}
            />
          )}
          {frame >= BEAT_SUPPLY_CHAIN_FRAME + 120 && (
            <Callout
              x={Math.max(360, Math.min(1380, twScreen.x))}
              y={Math.max(320, Math.min(720, twScreen.y))}
              label={scriptData.moatLabels.manufacturing}
              side="left"
              startFrame={BEAT_SUPPLY_CHAIN_FRAME + 120}
            />
          )}
          <LowerThird
            label={`Mellanox (${String(mellanoxYear.value)})`}
            sublabel={formatFactValue(mellanoxVal)}
            startFrame={520}
            durationInFrames={680}
          />
        </>
      ) : (
        <>
          <Callout
            x={Math.max(640, Math.min(1360, stackScreen0.x))}
            y={Math.max(580, Math.min(820, stackScreen0.y))}
            label={scriptData.moatLabels.layers[0]}
            side="right"
            startFrame={BEAT_STACKED_MOATS_FRAME + 60}
          />
          <Callout
            x={Math.max(640, Math.min(1360, stackScreen1.x))}
            y={Math.max(430, Math.min(660, stackScreen1.y))}
            label={scriptData.moatLabels.layers[1]}
            side="right"
            startFrame={BEAT_STACKED_MOATS_FRAME + 160}
          />
          <Callout
            x={Math.max(640, Math.min(1360, stackScreen2.x))}
            y={Math.max(280, Math.min(500, stackScreen2.y))}
            label={scriptData.moatLabels.layers[2]}
            side="right"
            startFrame={BEAT_STACKED_MOATS_FRAME + 260}
          />
        </>
      )}
    </AbsoluteFill>
  );
};
