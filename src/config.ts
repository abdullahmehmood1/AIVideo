import factsData from "./data/facts.json";

export type PerfMode = "low" | "med" | "high";

export const PERF_MODE: PerfMode = "med";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const TOTAL_FRAMES = 19350;

// Keep false during silent visual milestones until public/audio/vo.wav is supplied
export const ENABLE_AUDIO_PREVIEW = false;

export const PALETTE = {
  bgDeep: "#161B22",
  slate: "#222A35",
  slateLight: "#2E3846",
  cream: "#F2ECE0",
  creamDim: "#BDB7AB",
  red: "#B3261E",
  amber: "#D9A441",
  steel: "#8FA3B8",
} as const;

export interface PerfScale {
  instanceScale: number;
  segments: number;
  enableExtraGlow: boolean;
}

export const getPerfScale = (mode: PerfMode = PERF_MODE): PerfScale => {
  switch (mode) {
    case "low":
      return { instanceScale: 0.5, segments: 16, enableExtraGlow: false };
    case "high":
      return { instanceScale: 1.5, segments: 48, enableExtraGlow: true };
    case "med":
    default:
      return { instanceScale: 1.0, segments: 32, enableExtraGlow: false };
  }
};

export interface FactEntry {
  id: string;
  value: string | number;
  unit: string;
  label: string;
  source: string;
  verified: boolean;
}

const factsMap = new Map<string, FactEntry>(
  (factsData.facts as FactEntry[]).map((f) => [f.id, f]),
);

export const getFact = (id: string): FactEntry => {
  const found = factsMap.get(id);
  if (!found) {
    return {
      id,
      value: `TODO_FACT:${id}`,
      unit: "",
      label: `TODO_FACT: missing "${id}" in facts.json`,
      source: "UNVERIFIED_MISSING",
      verified: false,
    };
  }
  return found;
};

export const formatFactValue = (fact: FactEntry): string => {
  const valStr = String(fact.value);
  if (!fact.unit) {
    return valStr;
  }
  if (fact.unit === "$" || fact.unit === "$B" || fact.unit === "$T") {
    const suffix = fact.unit.length > 1 ? fact.unit.slice(1) : "";
    return `$${valStr}${suffix}`;
  }
  return `${valStr}${fact.unit}`;
};
