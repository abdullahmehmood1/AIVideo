import { Easing } from "remotion";
import { loadFont as loadSourceSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { PALETTE } from "../config";

const serifFont = loadSourceSerif("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

const sansFont = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

const monoFont = loadJetBrainsMono("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

export const colors = PALETTE;

export const fonts = {
  serif: `${serifFont.fontFamily}, Georgia, serif`,
  sans: `${sansFont.fontFamily}, system-ui, -apple-system, sans-serif`,
  mono: `${monoFont.fontFamily}, "Courier New", monospace`,
} as const;

export const spacing = {
  safeX: 120,
  safeY: 84,
  cardPadding: 32,
  gapSm: 16,
  gapMd: 28,
  gapLg: 48,
} as const;

export const typeScale = {
  minText: 44,
  caption: 56,
  subtitle: 48,
  heading: 72,
  hero: 96,
  stat: 108,
} as const;

export const easings = {
  outExpo: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

export const springs = {
  smooth: { damping: 200 },
  snappy: { damping: 20, stiffness: 120 },
} as const;
