import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";
import { SubtitlesOverlay } from "./components/Subtitles/SubtitlesOverlay";

export const Composition: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0A0A0A",
        overflow: "hidden",
      }}
    >
      {/* Voiceover Audio Track (User can replace public/voiceover.mp3) */}
      <Audio src={staticFile("voiceover.mp3")} />

      {/* Scene 1: 0:00 - 0:10 (Frames 0 - 300) */}
      <Sequence durationInFrames={300} name="Scene 1: Orbital Night View">
        <Scene1 />
      </Sequence>

      {/* Scene 2: 0:10 - 0:20 (Frames 300 - 600) */}
      <Sequence from={300} durationInFrames={300} name="Scene 2: Satellite Dive">
        <Scene2 />
      </Sequence>

      {/* Scene 3: 0:20 - 0:34 (Frames 600 - 1020) */}
      <Sequence from={600} durationInFrames={420} name="Scene 3: Terrain Tracking Pan">
        <Scene3 />
      </Sequence>

      {/* Scene 4: 0:34 - 0:47 (Frames 1020 - 1410) */}
      <Sequence from={1020} durationInFrames={390} name="Scene 4: Tactical Fence Blueprint">
        <Scene4 />
      </Sequence>

      {/* Scene 5: 0:47 - 1:00 (Frames 1410 - 1800) */}
      <Sequence from={1410} durationInFrames={390} name="Scene 5: Orbit Pullback Payoff">
        <Scene5 />
      </Sequence>

      {/* Word-by-Word Highlight Subtitles Overlay */}
      <SubtitlesOverlay />
    </AbsoluteFill>
  );
};
