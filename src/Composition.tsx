import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { HormuzChokepointMap } from "./components/Hormuz/HormuzChokepointMap";
import { TwelveDayWarTimeline } from "./components/TwelveDayWar/TwelveDayWarTimeline";
import { MissileEnvelopeHUD } from "./components/MissileEnvelope/MissileEnvelopeHUD";
import { BypassPipelineVsTanker } from "./components/Pipelines/BypassPipelineVsTanker";
import { CapeGoodHopeReroute } from "./components/CapeReroute/CapeGoodHopeReroute";
import { WeaponizedGeographyOutro } from "./components/Outro/WeaponizedGeographyOutro";
import { ACT_TIMINGS } from "./data/timelineData";

export const ChokepointEscalationMaster: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#F8FAFC",
        overflow: "hidden",
      }}
    >
      {/* Primary Documentary Voiceover Audio Track */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* The Hook: 0:00 – 1:30 (Frames 0 – 2700) */}
      <Sequence
        durationInFrames={ACT_TIMINGS.hook.duration}
        name={ACT_TIMINGS.hook.title}
      >
        <HormuzChokepointMap />
      </Sequence>

      {/* Act I: 1:30 – 4:15 (Frames 2700 – 7650) */}
      <Sequence
        from={ACT_TIMINGS.act1.startFrame}
        durationInFrames={ACT_TIMINGS.act1.duration}
        name={ACT_TIMINGS.act1.title}
      >
        <TwelveDayWarTimeline />
      </Sequence>

      {/* Act II: 4:15 – 7:30 (Frames 7650 – 13500) */}
      <Sequence
        from={ACT_TIMINGS.act2.startFrame}
        durationInFrames={ACT_TIMINGS.act2.duration}
        name={ACT_TIMINGS.act2.title}
      >
        <MissileEnvelopeHUD />
      </Sequence>

      {/* Act III: 7:30 – 10:15 (Frames 13500 – 18450) */}
      <Sequence
        from={ACT_TIMINGS.act3.startFrame}
        durationInFrames={ACT_TIMINGS.act3.duration}
        name={ACT_TIMINGS.act3.title}
      >
        <BypassPipelineVsTanker />
      </Sequence>

      {/* Act IV: 10:15 – 13:00 (Frames 18450 – 23400) */}
      <Sequence
        from={ACT_TIMINGS.act4.startFrame}
        durationInFrames={ACT_TIMINGS.act4.duration}
        name={ACT_TIMINGS.act4.title}
      >
        <CapeGoodHopeReroute />
      </Sequence>

      {/* Outro: 13:00 – 14:15 (Frames 23400 – 25650) */}
      <Sequence
        from={ACT_TIMINGS.outro.startFrame}
        durationInFrames={ACT_TIMINGS.outro.duration}
        name={ACT_TIMINGS.outro.title}
      >
        <WeaponizedGeographyOutro />
      </Sequence>
    </AbsoluteFill>
  );
};
