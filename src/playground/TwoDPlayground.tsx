import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../design/tokens";
import { SceneStage, CameraPath } from "../design/SceneStage";
import { LowerThird } from "../components/LowerThird";
import { StatCounter } from "../components/StatCounter";
import { Callout } from "../components/Callout";
import { LineChart2D } from "../components/LineChart2D";
import { MilestoneCard, TimelineRibbon3D, ribbonPoint } from "../components/TimelineRibbon";
import { Chart3DBars } from "../components/Chart3DBars";

const SAMPLE_POINTS = [0, 1, 2, 3, 4, 5, 6, 7].map((x, i) => ({
  x,
  y: [2, 3, 3.5, 5, 4.6, 7, 6.2, 9][i],
}));

export const TwoDPlayground: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.slate }}>
    <MilestoneCard date="2026" title="Sample milestone" startFrame={10} x={120} y={90} />
    <div style={{ position: "absolute", left: 120, top: 380 }}>
      <StatCounter value={4.5} from={0} prefix="$" unit="T" decimals={1} label="Sample stat" startFrame={20} durationFrames={60} />
    </div>
    <div style={{ position: "absolute", left: 900, top: 330 }}>
      <LineChart2D points={SAMPLE_POINTS} width={800} height={380} drawFrames={80} startFrame={30} label="Sample series" />
    </div>
    <Callout x={1246} y={610} label="Peak" side="left" startFrame={120} />
    <LowerThird label="Sample label" sublabel="Sample sublabel" startFrame={5} durationInFrames={220} />
  </AbsoluteFill>
);

const barsCamera: CameraPath = (f) => {
  const t = Math.min(1, f / 240);
  const p = ribbonPoint(0.05 + t * 0.1);
  return {
    position: [p[0] + 2 - t * 4, 4.5 - t * 1, 13 - t * 3],
    lookAt: [0, 2, -6],
    fov: 42,
  };
};

export const Bars3DPlayground: React.FC = () => (
  <SceneStage cameraPath={barsCamera} fogNear={20} fogFar={60}>
    <Chart3DBars
      values={[3, 4, 5, 6, 8, 10, 7, 5]}
      buildFrames={60}
      maxHeight={5}
      startFrame={5}
      collapse={{ atFrame: 170, staggerFrames: 4 }}
      crackBarIndex={5}
    />
    <group position={[0, -0.4, -6]}>
      <TimelineRibbon3D milestones={[0.1, 0.3, 0.5, 0.7, 0.9]} startFrame={10} drawFrames={120} />
    </group>
  </SceneStage>
);


