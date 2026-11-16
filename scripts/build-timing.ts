import type { Caption } from "@remotion/captions";
import captionsData from "../src/data/captions.json";
import scriptData from "../src/data/script.json";
import timingData from "../src/data/timing.json";

export interface SceneTimingEntry {
  id: string;
  start: number;
  end: number;
}

export interface TimingConfig {
  fps: number;
  scenes: SceneTimingEntry[];
  transitionFrames: number;
}

// Cue phrases marking the start of each scene in captions.json
export const SCENE_CUE_PHRASES: Record<string, string[]> = {
  S0_ColdOpen: ["on november 12"],
  S1_Promise: ["this isn't about", "how did one company"],
  S2_Origins: ["it began in 1993"],
  S3_GPU: ["to understand why", "a gpu flips"],
  S4_CUDA: ["in november 2006"],
  S5_DeepLearning: ["then came 2012", "alexnet proved"],
  S6_GoldRush: ["demand exploded", "hyperscalers filled"],
  S7_Moat: ["why can't rivals", "three barriers"],
  S8_Geopolitics: ["starting in october", "export controls"],
  S9_WhatNow: ["now interim ceo", "can a company"],
};

const normalizeWord = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9']/g, "");

export const alignTimingFromCaptions = (
  captions: Caption[],
  currentTiming: TimingConfig,
): TimingConfig => {
  const words = captions.map((c) => ({
    norm: normalizeWord(c.text),
    startSec: Math.round((c.startMs / 1000) * 10) / 10,
  }));

  const updatedScenes = currentTiming.scenes.map((s) => ({ ...s }));

  for (let i = 1; i < updatedScenes.length - 1; i++) {
    const scene = updatedScenes[i];
    const cues = SCENE_CUE_PHRASES[scene.id] ?? [];
    for (const cue of cues) {
      const cueTokens = cue.split(/\s+/).map(normalizeWord).filter(Boolean);
      if (cueTokens.length === 0) continue;

      let matchedSec: number | null = null;
      for (let w = 0; w <= words.length - cueTokens.length; w++) {
        let ok = true;
        for (let k = 0; k < cueTokens.length; k++) {
          if (words[w + k].norm !== cueTokens[k]) {
            ok = false;
            break;
          }
        }
        if (ok) {
          matchedSec = Math.floor(words[w].startSec);
          break;
        }
      }

      if (
        matchedSec !== null &&
        matchedSec > updatedScenes[i - 1].start + 5 &&
        matchedSec < scene.end - 5
      ) {
        updatedScenes[i - 1].end = matchedSec;
        scene.start = matchedSec;
        break;
      }
    }
  }

  return {
    ...currentTiming,
    scenes: updatedScenes,
  };
};

// CLI runner when invoked via `npx tsx scripts/build-timing.ts`
const runCli = () => {
  const aligned = alignTimingFromCaptions(
    captionsData as Caption[],
    timingData as TimingConfig,
  );
  void scriptData;
  const g = globalThis as unknown as {
    require?: (mod: string) => {
      writeFileSync: (p: string, data: string) => void;
    };
  };
  if (typeof g.require === "function") {
    const fs = g.require("fs");
    fs.writeFileSync(
      "src/data/timing.json",
      `${JSON.stringify(aligned, null, 2)}\n`,
    );
    console.log("Updated src/data/timing.json from captions.json cues.");
  }
};

runCli();
