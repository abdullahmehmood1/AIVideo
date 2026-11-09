// Offline SVG Geo-coordinates and vector paths for India, Pakistan & the Border Frontier

export interface CityLocation {
  id: string;
  name: string;
  coords: [number, number]; // [lon, lat]
  labelPos?: "top" | "bottom" | "left" | "right";
  role?: string;
}

export const CITIES: CityLocation[] = [
  { id: "karachi", name: "Karachi", coords: [67.0, 24.86], labelPos: "left", role: "Port" },
  { id: "lahore", name: "Lahore", coords: [74.35, 31.52], labelPos: "left", role: "City" },
  { id: "delhi", name: "New Delhi", coords: [77.2, 28.61], labelPos: "right", role: "Capital" },
  { id: "islamabad", name: "Islamabad", coords: [73.04, 33.68], labelPos: "top", role: "Capital" },
  { id: "kutch", name: "Rann of Kutch", coords: [69.2, 23.9], labelPos: "bottom", role: "Salt Flats" },
  { id: "thar", name: "Thar Desert", coords: [71.2, 27.0], labelPos: "right", role: "Desert Sector" },
  { id: "kashmir", name: "Line of Control", coords: [74.8, 34.1], labelPos: "top", role: "Himalayas" },
];

// Projected Equirectangular coordinate mapper (Lon: 60-88, Lat: 18-38) to SVG viewbox (0 0 1920 1080)
export function geoToSvg(lon: number, lat: number, viewBoxWidth = 1920, viewBoxHeight = 1080): [number, number] {
  // Mapping bounds focused on South Asia / Indo-Pak corridor
  const minLon = 60.0;
  const maxLon = 88.0;
  const minLat = 18.0;
  const maxLat = 38.0;

  const x = ((lon - minLon) / (maxLon - minLon)) * viewBoxWidth;
  const y = (1 - (lat - minLat) / (maxLat - minLat)) * viewBoxHeight;
  return [x, y];
}

// 1,200+ mile border line coordinate waypoints (From Rann of Kutch / Arabian Sea up to Kashmir)
export const BORDER_COORDINATES: [number, number][] = [
  [68.16, 23.71], // Sir Creek / Arabian Sea coast
  [68.78, 24.15], // Rann of Kutch
  [69.65, 24.45], // Kutch border
  [70.25, 24.95], // Barmer entrance
  [70.85, 25.75], // Munabao (Thar desert)
  [70.92, 26.45], // Jaisalmer sector
  [71.35, 27.35], // Bikaner sector
  [71.85, 27.95], // Desert edge
  [72.55, 28.75], // Rajasthan-Punjab boundary
  [73.35, 29.85], // Fazilka / Ganganagar
  [73.95, 30.75], // Firozpur sector
  [74.57, 31.60], // Wagah / Attari (Amritsar-Lahore)
  [74.88, 32.10], // Gurdaspur sector
  [74.92, 32.55], // Jammu international border
  [74.65, 33.15], // LoC start (Rajouri sector)
  [74.25, 33.75], // Poonch sector
  [74.15, 34.25], // Uri sector
  [74.85, 34.65], // Tithwal / Keran sector
  [75.85, 34.95], // Kargil sector
  [76.85, 35.35], // Siachen Glacier edge / NJ9842
];

// SVG Polyline Path for Border Line
export function getBorderSvgPath(): string {
  const points = BORDER_COORDINATES.map(([lon, lat]) => geoToSvg(lon, lat));
  return "M " + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
}

// General landmass outline of South Asia / Indian subcontinent
export const SOUTH_ASIA_COASTLINE_COORDS: [number, number][] = [
  [61.5, 25.2], // Iranian border / Makran coast
  [64.5, 25.3],
  [66.9, 24.8], // Karachi
  [68.2, 23.7], // Rann of Kutch
  [69.0, 22.3], // Kathiawar peninsula
  [71.5, 20.8], // Gulf of Khambhat
  [72.8, 18.9], // Mumbai coast
  [73.8, 15.5], // Goa
  [75.0, 13.0], // Mangalore
  [76.3, 9.9],  // Kochi
  [77.5, 8.1],  // Cape Comorin (southern tip)
  [78.5, 9.2],  // Gulf of Mannar
  [79.8, 10.3], // Point Calimere
  [80.3, 13.1], // Chennai
  [82.0, 16.5], // Andhra coast
  [85.8, 19.8], // Odisha
  [88.2, 21.6], // Ganges delta
];

// Northern mountainous boundary line (Hindu Kush -> Himalayas -> Tibetan plateau)
export const NORTHERN_RANGE_COORDS: [number, number][] = [
  [61.5, 25.2],
  [61.8, 29.5], // Afghan-Pak border (Chaman / Quetta)
  [66.5, 32.0],
  [69.5, 34.0], // Khyber Pass
  [71.5, 36.5], // Hindu Kush / Pamir knot
  [74.5, 37.0], // Karakoram north
  [77.5, 35.8], // Ladakh / Aksai Chin edge
  [80.0, 31.0], // Western Tibet
  [84.0, 28.5], // Nepal Himalayas
  [88.0, 27.5], // Sikkim / Bhutan gate
  [88.2, 21.6],
];

