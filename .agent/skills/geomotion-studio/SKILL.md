---
name: geomotion-studio
description: GeoMotion Studio. Creates cinematic map-explainer and motion-graphics videos in the viral geography/geopolitics Shorts style (dark neon aesthetics, satellite maps, smooth camera zooms, cyber telemetry HUDs, glowing radar pulses, highlighted countries/states/zones, transit routes, pins, animated icons, and sync captions). Use it whenever the user asks for a map animation, geography or politics explainer short, flight/transit map, or GeoMotion video.
---

# 🌐 GeoMotion Studio

**GeoMotion Studio** is a motion-graphics map animation engine tailored for **heroi**. It renders map explainer videos from a **scene JSON** file with a signature **Cinematic Dark & Neon** aesthetic (or natural satellite/editorial look).

It features:
- **Dual Rendering Modes**:
  1. **Remotion React Engine**: Renderable locally with Remotion Studio or on **Google Colab Cloud GPUs**.
  2. **Playwright SVG Engine**: Deterministic standalone rendering with headless Chromium & FFmpeg.
- **Real Geographic Boundaries**: Bundles Natural Earth vector borders (countries, US states, and provinces for US, Canada, Australia, Brazil, China, India, Indonesia, Russia, South Africa).
- **Custom Image Georeferencing**: Warps user-uploaded map images (screenshots from Esri, Google, Mapbox, satellite photography) so all highlights land accurately on real terrain.
- **Cyber & Tech Overlays**: Live GPS telemetry HUD, concentric radar/sonar waves, flight routes with moving vehicle icons, and glowing bloom vectors.
- **Synthesized SFX**: Automatic sound-design cues (whooshes, pops, dings, risers, swishes).

---

## 🎨 Visual Signature: Cinematic Dark & Neon

1. **Ocean & Land**:
   - Deep void oceans (`#050c18`, `#02050b`) with shelf gradients.
   - Dark slate terrain (`#0e1a2f`) with neon cyan vector borders (`rgba(0, 240, 255, 0.5)`).
2. **Highlight Rules**:
   - **Subject / Context**: `style: "tint"` (neon cyan translucent fill `#00d2ff`, 50% opacity, cyan borders).
   - **Active Key Location**: `style: "solid"` (punchy electric amber `#ffb703`).
   - **Hero Feature / Focus**: `style: "cyberGlow"` or `"glow"` (glowing neon cyan or electric amber with multi-pass Gaussian bloom).
   - **Hotspot / Disputed / Threat**: `style: "hotspot"` (neon magenta `#f72585`).
   - **Categories & Alliances**: `zones` with alternating neon colors (`neonCyan`, `neonLime`, `neonAmber`, `neonMagenta`, `cyberViolet`).
   - **Transit & Routes**: `flight` or `path` with dashed trajectory and moving vehicle icon (`plane`, `ship`, `dot`).
   - **Telemetry**: Corner brackets, coordinate readouts (LAT/LON), altitude, and target lock.

---

## 🚀 Workflows

### Mode A: Remotion & Cloud GPU (Google Colab)
The project includes native Remotion integration:
1. Preview in Remotion Studio:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to preview `GeoMotion` live.
2. Render locally or in Colab:
   ```bash
   npx remotion render GeoMotion out/geomotion.mp4 --gl=angle --concurrency=4
   ```

### Mode B: Standalone Playwright Engine
1. Test a single frame:
   ```bash
   node skills/geomotion-studio/scripts/render.mjs skills/geomotion-studio/examples/neon-cyber-demo.json out/frame.png --still 2.0
   ```
2. Render full MP4 video:
   ```bash
   node skills/geomotion-studio/scripts/render.mjs scene.json out.mp4 --scale 1 --fps 30
   ```
3. Generate contact sheet:
   ```bash
   node skills/geomotion-studio/scripts/render.mjs scene.json out/contact.png --contact
   ```

---

## 📐 Scene JSON Reference

```json
{
  "title": "Short Title",
  "width": 1080, "height": 1920, "fps": 30,
  "projection": "equirect",
  "basemap": {
    "style": "flat",
    "ocean": "#050c18",
    "oceanDeep": "#02050b",
    "shelf": "#0f243d",
    "land": "#0e1a2f"
  },
  "borders": {
    "countries": true,
    "states": true,
    "color": "rgba(0, 240, 255, 0.5)",
    "width": 2
  },
  "shots": [
    {
      "start": 0, "end": 4.0, "fadeIn": 0.3,
      "cam": {
        "from": { "lon": -98, "lat": 38, "span": 75 },
        "to": { "lon": -118, "lat": 36, "span": 24 }
      },
      "elements": [
        { "type": "telemetry", "lat": 34.05, "lon": -118.24, "alt": "640 KM", "target": "PACIFIC", "t0": 0.1 },
        { "type": "title", "text": "PACIFIC HUB", "y": 620, "size": 90, "color": "#00f0ff", "t0": 0.3 },
        { "type": "region", "set": "states", "names": ["California"], "style": "cyberGlow", "label": "CALIFORNIA", "t0": 0.6 },
        { "type": "radar", "lon": -118.24, "lat": 34.05, "color": "neonCyan", "radius": 140, "t0": 1.2 },
        { "type": "caption", "text": "Initiating high-speed *Pacific transit route*", "t0": 0.4 }
      ]
    }
  ]
}
```

### Supported Elements:
- `telemetry` / `hud`: GPS coordinates, altitude, corner brackets, target reticle.
- `radar`: Concentric sonar/radar rings radiating from coordinates.
- `flight`: Trajectory line with moving vehicle icon (`plane`, `ship`, `dot`).
- `region`: Highlighted country/state with styles: `cyberGlow`, `hazardGlow`, `hotspot`, `tint`, `solid`, `zone`.
- `path` / `arrow` / `ruler`: Animated drawing line, distance ruler in km/miles.
- `pin` / `dot` / `label`: Place marker with text callouts and pills.
- `icon`: Pop-in SVG icons (`person`, `lock`, `clock`, `check`, `star`, `plane`, `ship`).
- `blueprint` / `section`: High-tech cutaway diagrams and geological cross-sections.

---

## 👤 Ownership & License
Owned and customized for **heroi** (GeoMotion Studio v3). Third-party data (Natural Earth, TopoJSON) remain under their respective public domain and ISC licenses. See `rights/OWNERSHIP_AND_RIGHTS.txt`.
