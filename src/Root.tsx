import React from "react";
import { Composition } from "remotion";
import { ChokepointEscalationMaster } from "./Composition";
import { HormuzChokepointMap } from "./components/Hormuz/HormuzChokepointMap";
import { TwelveDayWarTimeline } from "./components/TwelveDayWar/TwelveDayWarTimeline";
import { MissileEnvelopeHUD } from "./components/MissileEnvelope/MissileEnvelopeHUD";
import { BypassPipelineVsTanker } from "./components/Pipelines/BypassPipelineVsTanker";
import { CapeGoodHopeReroute } from "./components/CapeReroute/CapeGoodHopeReroute";
import { WeaponizedGeographyOutro } from "./components/Outro/WeaponizedGeographyOutro";
import { ACT_TIMINGS } from "./data/timelineData";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Full 14-Minute Master Documentary (25,650 frames | 14m 15s) */}
      <Composition
        id="ChokepointEscalationMaster"
        component={ChokepointEscalationMaster}
        durationInFrames={25650}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Individual Act Compositions (Fast Colab GPU Renders & Previews) */}
      <Composition
        id="Act0-TheHook"
        component={HormuzChokepointMap}
        durationInFrames={ACT_TIMINGS.hook.duration}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Act1-TwelveDayWar"
        component={TwelveDayWarTimeline}
        durationInFrames={ACT_TIMINGS.act1.duration}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Act2-HormuzLockdown"
        component={MissileEnvelopeHUD}
        durationInFrames={ACT_TIMINGS.act2.duration}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Act3-BypassPipelines"
        component={BypassPipelineVsTanker}
        durationInFrames={ACT_TIMINGS.act3.duration}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Act4-CapeGoodHope"
        component={CapeGoodHopeReroute}
        durationInFrames={ACT_TIMINGS.act4.duration}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="Act5-WeaponizedGeography"
        component={WeaponizedGeographyOutro}
        durationInFrames={ACT_TIMINGS.outro.duration}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
