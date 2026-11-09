// Central Timeline Data, Coordinates, Metrics, and Transcripts for
// "Chokepoint Escalation: From the Twelve-Day War to the 2026 Hormuz Crisis"

import type { ExtendedFeature, GeoGeometryObjects } from "d3-geo";

export interface GeoCountryProperties {
  name?: string;
  [key: string]: unknown;
}

export type GeoCountryFeature = ExtendedFeature<GeoGeometryObjects | null, GeoCountryProperties>;

export interface GeoCountryCollection {
  type: string;
  features: GeoCountryFeature[];
}

export interface CoordinatePoint {
  name: string;
  coords: [number, number]; // [lon, lat]
  role?: string;
  country?: string;
}

export interface ChokepointLocation {
  name: string;
  coords: [number, number];
  dailyVolume: string;
  status: "CRITICAL" | "HIGH" | "DISRUPTED";
}

// ----------------------------------------------------------------------
// Geographic Coordinate Sets
// ----------------------------------------------------------------------

export const HORMUZ_COORDINATES: CoordinatePoint[] = [
  { name: "Strait of Hormuz", coords: [56.25, 26.56], role: "Chokepoint Funnel" },
  { name: "Bandar Abbas", coords: [56.27, 27.18], role: "IRGC Navy 1st Naval Region", country: "Iran" },
  { name: "Qeshm Island", coords: [55.82, 26.85], role: "Coastal Missile Base", country: "Iran" },
  { name: "Hormuz Island", coords: [56.45, 27.06], role: "Radar & Artillery", country: "Iran" },
  { name: "Larak Island", coords: [56.35, 26.85], role: "Anti-Ship Battery", country: "Iran" },
  { name: "Musandam Peninsula", coords: [56.25, 26.15], role: "Omani Headland", country: "Oman" },
  { name: "Fujairah Anchorage", coords: [56.35, 25.12], role: "Offshore Tanker Hub", country: "UAE" },
  { name: "Abu Dhabi", coords: [54.37, 24.45], country: "UAE" },
  { name: "Dubai", coords: [55.27, 25.20], country: "UAE" },
  { name: "Tehran", coords: [51.38, 35.68], country: "Iran" },
];

export const SHIPPING_LANES = {
  // Inbound lane (2 miles wide)
  inbound: [
    [56.80, 25.80],
    [56.55, 26.30],
    [56.32, 26.58],
    [55.95, 26.75],
    [55.30, 26.65],
    [54.50, 26.40],
  ] as [number, number][],
  // Outbound lane (2 miles wide)
  outbound: [
    [54.50, 26.25],
    [55.30, 26.50],
    [55.95, 26.60],
    [56.25, 26.45],
    [56.45, 26.20],
    [56.70, 25.70],
  ] as [number, number][],
};

export const TWELVE_DAY_WAR_SITES: CoordinatePoint[] = [
  { name: "Tel Aviv", coords: [34.78, 32.08], role: "IDF Air Command", country: "Israel" },
  { name: "Natanz", coords: [51.72, 33.72], role: "Centrifuge Enrichment Plant", country: "Iran" },
  { name: "Fordow", coords: [50.99, 34.88], role: "Underground Enrichment Hall", country: "Iran" },
  { name: "Isfahan", coords: [51.68, 32.65], role: "Uranium Conversion Facility", country: "Iran" },
  { name: "Karaj", coords: [51.00, 35.83], role: "Centrifuge Workshop", country: "Iran" },
  { name: "Arak / Khondab", coords: [49.24, 34.37], role: "Heavy Water Complex", country: "Iran" },
  { name: "Al Udeid Air Base", coords: [51.31, 25.11], role: "US Central Command Forward HQ", country: "Qatar" },
];

export const PIPELINES = {
  petroline: {
    name: "Saudi East-West Pipeline (Petroline)",
    capacityBpd: 7.0, // Million BPD
    effectiveSpareBpd: 1.8,
    lengthMiles: 746,
    path: [
      [50.19, 26.27], // Abqaiq (Eastern Province)
      [48.0, 25.5],
      [45.0, 24.8],
      [42.0, 24.3],
      [38.06, 24.08], // Yanbu (Red Sea Terminal)
    ] as [number, number][],
  },
  habshan: {
    name: "UAE Habshan–Fujairah Pipeline",
    capacityBpd: 1.8, // Million BPD
    effectiveSpareBpd: 0.8,
    lengthMiles: 230,
    path: [
      [53.75, 23.75], // Habshan Field (Abu Dhabi)
      [55.0, 24.5],
      [56.35, 25.12], // Fujairah Port (Gulf of Oman)
    ] as [number, number][],
  },
};

export const TANKER_CASUALTIES = [
  {
    name: "Tanker Skylight",
    date: "MARCH 01, 2026",
    coords: [56.28, 26.48] as [number, number],
    status: "STRUCK & ABANDONED",
    type: "VLCC (2M Barrels)",
  },
  {
    name: "MKD Vyom",
    date: "MARCH 01, 2026",
    coords: [56.42, 26.32] as [number, number],
    status: "BALLISTIC MISSILE HIT",
    type: "Suezmax Crude",
  },
  {
    name: "Safesea Vishnu",
    date: "MARCH 11, 2026",
    coords: [56.18, 26.62] as [number, number],
    status: "SET ABLAZE BY DRONE",
    type: "Chemical & Product Tanker",
  },
];

export const GLOBAL_CHOKEPOINTS: ChokepointLocation[] = [
  { name: "Strait of Hormuz", coords: [56.25, 26.56], dailyVolume: "20.5M bpd", status: "DISRUPTED" },
  { name: "Bab el-Mandeb", coords: [43.33, 12.58], dailyVolume: "8.8M bpd", status: "DISRUPTED" },
  { name: "Suez Canal", coords: [32.34, 30.70], dailyVolume: "9.0M bpd", status: "HIGH" },
  { name: "Strait of Malacca", coords: [101.40, 2.50], dailyVolume: "16.0M bpd", status: "CRITICAL" },
  { name: "Panama Canal", coords: [-79.91, 9.10], dailyVolume: "1.0M bpd", status: "CRITICAL" },
];

// Cape of Good Hope Transit Waypoints
export const CAPE_ROUTE = {
  suezBlocked: [
    [56.25, 26.56], // Hormuz
    [52.0, 18.0],
    [43.33, 12.58], // Bab el-Mandeb
    [38.0, 20.0],
    [32.34, 30.70], // Suez
    [25.0, 35.0],   // Med
    [4.0, 51.9],    // Rotterdam
  ] as [number, number][],
  capeDetour: [
    [56.25, 26.56], // Hormuz
    [58.0, 20.0],   // Arabian Sea
    [52.0, 5.0],    // East Africa
    [45.0, -15.0],  // Mozambique Channel
    [32.0, -28.0],  // South Africa coast
    [18.47, -34.35], // CAPE OF GOOD HOPE
    [10.0, -20.0],  // South Atlantic
    [-15.0, 10.0],  // West Africa
    [-10.0, 38.0],  // Portugal
    [4.0, 51.9],    // Rotterdam
  ] as [number, number][],
};

// ----------------------------------------------------------------------
// Timing & Act Breakdowns
// ----------------------------------------------------------------------

export const ACT_TIMINGS = {
  hook: { startFrame: 0, endFrame: 2700, duration: 2700, title: "THE HOOK: 21 Miles That Broke the Global Economy" },
  act1: { startFrame: 2700, endFrame: 7650, duration: 4950, title: "ACT I: The Fuse — The June 2025 Twelve-Day War" },
  act2: { startFrame: 7650, endFrame: 13500, duration: 5850, title: "ACT II: The 2026 Hormuz Lockdown & Missile Envelopes" },
  act3: { startFrame: 13500, endFrame: 18450, duration: 4950, title: "ACT III: Why Bypass Pipelines Couldn't Save the Market" },
  act4: { startFrame: 18450, endFrame: 23400, duration: 4950, title: "ACT IV: The Cape of Good Hope Detour & The Price Shock" },
  outro: { startFrame: 23400, endFrame: 25650, duration: 2250, title: "OUTRO: The Era of Weaponized Geography" },
};
