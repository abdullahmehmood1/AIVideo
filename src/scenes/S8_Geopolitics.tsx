import React, { useCallback } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { formatFactValue, getFact } from "../config";
import scriptData from "../data/script.json";
import timingData from "../data/timing.json";
import { ArcLines } from "../components/ArcLines";
import { GlobeDots, globeRotation } from "../components/GlobeDots";
import { SceneStage, type CameraPath } from "../design/SceneStage";
import { colors, easings, fonts, springs, typeScale } from "../design/tokens";

const timing = timingData.scenes.find((s) => s.id === "S8_Geopolitics")!;
const script = scriptData.scenes.find((s) => s.id === "S8_Geopolitics")!;

export const SCENE_START_SEC = timing.start;
export const SCENE_END_SEC = timing.end;
export const SCENE_DURATION_FRAMES = (timing.end - timing.start) * timingData.fps;
export const BEAT_EXPORT_CONTROLS_FRAME = 320;
export const BEAT_LICENSE_FRAME = 820;
export const BEAT_ALLEGATION_FRAME = 1240;

const US_COORDS: [number, number] = [37.4, -122.0];
const TW_COORDS: [number, number] = [24.8, 121.0];
const CN_COORDS: [number, number] = [31.2, 121.5];
const GLOBE_R = 3.2;

const geoGlobeRot = (f: number) => {
  const lon = interpolate(f, [0, SCENE_DURATION_FRAMES], [95, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easings.inOut,
  });
  return globeRotation(0, 0, lon);
};

export const S8_Geopolitics: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const asOfFact = getFact("as_of_date");

  const cameraPath: CameraPath = useCallback((f: number) => {
    const p = interpolate(f, [0, SCENE_DURATION_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easings.inOut,
    });
    return {
      position: [
        -1.6 + p * 3.2,
        1.7 + Math.sin(p * Math.PI) * 0.6,
        10.2 - p * 0.9,
      ],
      lookAt: [0, 0.25, 0],
      fov: 40,
    };
  }, []);

  const bannerEnter = spring({
    frame: frame - BEAT_ALLEGATION_FRAME,
    fps,
    config: springs.smooth,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep }}>
      <SceneStage cameraPath={cameraPath} fogNear={12} fogFar={38} glow={0.3}>
        <GlobeDots
          radius={GLOBE_R}
          rotationY={geoGlobeRot}
          highlights={[
            { lat: US_COORDS[0], lon: US_COORDS[1], startFrame: 10 },
            { lat: TW_COORDS[0], lon: TW_COORDS[1], startFrame: 60 },
            {
              lat: CN_COORDS[0],
              lon: CN_COORDS[1],
              startFrame: 120,
              color:
                frame >= BEAT_EXPORT_CONTROLS_FRAME ? colors.steel : colors.amber,
            },
          ]}
        />
        <ArcLines
          radius={GLOBE_R}
          rotationY={geoGlobeRot}
          arcs={[
            {
              from: US_COORDS,
              to: TW_COORDS,
              startFrame: 20,
              drawFrames: 160,
              colorFrom: colors.cream,
              colorTo: colors.amber,
              switchFrame: BEAT_LICENSE_FRAME,
            },
            {
              from: TW_COORDS,
              to: CN_COORDS,
              startFrame: 140,
              drawFrames: 140,
              height: 0.14,
              colorFrom: colors.cream,
              colorTo: colors.steel,
              switchFrame: BEAT_EXPORT_CONTROLS_FRAME,
            },
            {
              from: US_COORDS,
              to: CN_COORDS,
              startFrame: BEAT_EXPORT_CONTROLS_FRAME,
              drawFrames: 180,
              height: 0.36,
              colorFrom: colors.steel,
              colorTo: colors.amber,
              switchFrame: BEAT_LICENSE_FRAME,
            },
          ]}
        />
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

      {/* Neutral Unproven-Allegation Banner (Strict Legal Guardrail) */}
      {frame >= BEAT_ALLEGATION_FRAME && (
        <div
          style={{
            position: "absolute",
            right: 112,
            top: 82,
            maxWidth: 880,
            padding: "24px 36px",
            backgroundColor: "rgba(34, 42, 53, 0.94)",
            borderLeft: `8px solid ${colors.steel}`,
            opacity: bannerEnter,
            transform: `translateY(${(1 - bannerEnter) * 24}px)`,
          }}
        >
          <div
            style={{
              fontFamily: fonts.sans,
              fontSize: typeScale.minText,
              fontWeight: 700,
              color: colors.cream,
            }}
          >
            {scriptData.unprovenBanner}
          </div>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: typeScale.minText,
              color: colors.steel,
              marginTop: 6,
            }}
          >
            {String(asOfFact.value)}
          </div>
        </div>
      )}

      {/* Bottom Dated Timeline Strip */}
      <div
        style={{
          position: "absolute",
          left: 112,
          right: 112,
          bottom: 195,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 28,
        }}
      >
        {scriptData.geopoliticsLabels.timeline.map((item, idx) => {
          const fact = getFact(item.factId);
          const trigger = idx === 0 ? 80 : idx === 1 ? BEAT_LICENSE_FRAME : BEAT_ALLEGATION_FRAME;
          const active = frame >= trigger;
          return (
            <div
              key={item.factId}
              style={{
                padding: "18px 26px",
                backgroundColor: active
                  ? "rgba(34, 42, 53, 0.9)"
                  : "rgba(22, 27, 34, 0.65)",
                borderTop: `6px solid ${active ? colors.amber : colors.slateLight}`,
                opacity: active ? 1 : 0.48,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.mono,
                  fontSize: typeScale.minText,
                  fontWeight: 700,
                  color: colors.amber,
                }}
              >
                {formatFactValue(fact)}
              </div>
              <div
                style={{
                  fontFamily: fonts.sans,
                  fontSize: typeScale.minText,
                  fontWeight: 600,
                  color: colors.cream,
                  marginTop: 4,
                }}
              >
                {item.tag}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
