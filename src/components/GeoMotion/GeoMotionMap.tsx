import React, { useEffect, useRef, useState } from "react";
import {
  continueRender,
  delayRender,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface GeoMotionEngine {
  render: (spec: Record<string, unknown>, t: number) => void;
  elements?: string[];
  icons?: string[];
  colors?: Record<string, string>;
}

export interface GeoMotionMapProps {
  spec?: Record<string, unknown>;
}

declare global {
  interface Window {
    GeoMotion?: GeoMotionEngine;
    KZ?: GeoMotionEngine;
    KZGEO?: Record<string, unknown>;
  }
}

export const defaultNeonSpec = {
  title: "GeoMotion Studio - Cyber Neon",
  width: 1080,
  height: 1920,
  fps: 30,
  projection: "equirect",
  basemap: {
    style: "flat",
    ocean: "#050c18",
    oceanDeep: "#02050b",
    shelf: "#0f243d",
    land: "#0e1a2f",
  },
  borders: {
    countries: true,
    states: true,
    color: "rgba(0, 240, 255, 0.5)",
    width: 2,
    stateColor: "rgba(0, 240, 255, 0.22)",
  },
  shots: [
    {
      start: 0,
      end: 4.0,
      fadeIn: 0.3,
      cam: {
        from: { lon: -98, lat: 38, span: 75 },
        to: { lon: -118, lat: 36, span: 24 },
        ease: "inOut",
      },
      elements: [
        {
          type: "telemetry",
          title: "GEOMOTION // TARGET LOCK",
          lat: 34.05,
          lon: -118.24,
          alt: "640 KM",
          target: "PACIFIC CORRIDOR",
          t0: 0.1,
        },
        {
          type: "title",
          text: "PACIFIC HUB",
          y: 620,
          size: 90,
          color: "#00f0ff",
          t0: 0.3,
        },
        {
          type: "region",
          set: "states",
          names: ["California"],
          style: "cyberGlow",
          fill: "neonCyan",
          label: "CALIFORNIA",
          t0: 0.6,
        },
        {
          type: "radar",
          lon: -118.24,
          lat: 34.05,
          color: "neonCyan",
          radius: 140,
          t0: 1.2,
        },
        {
          type: "caption",
          text: "Initiating high-speed *Pacific transit route*",
          t0: 0.4,
        },
      ],
    },
    {
      start: 4.0,
      end: 8.0,
      flash: true,
      cam: {
        from: { lon: -105, lat: 35, span: 55 },
        to: { lon: -85, lat: 32, span: 48 },
        ease: "inOut",
      },
      elements: [
        {
          type: "telemetry",
          title: "GEOMOTION // FLIGHT VECTORS",
          lat: 29.76,
          lon: -95.36,
          alt: "480 KM",
          target: "GULF NETWORK",
          t0: 0.1,
        },
        {
          type: "region",
          set: "states",
          names: ["Texas"],
          style: "hazardGlow",
          fill: "neonAmber",
          label: "TEXAS CORRIDOR",
          t0: 0.3,
        },
        {
          type: "region",
          set: "states",
          names: ["Florida"],
          style: "hotspot",
          fill: "neonMagenta",
          label: "FLORIDA GATEWAY",
          t0: 0.8,
        },
        {
          type: "flight",
          from: [-118.24, 34.05],
          to: [-95.36, 29.76],
          color: "neonCyan",
          width: 4,
          vehicle: "plane",
          t0: 0.5,
          dur: 2.2,
        },
        {
          type: "radar",
          lon: -95.36,
          lat: 29.76,
          color: "neonAmber",
          radius: 130,
          t0: 2.2,
        },
        {
          type: "caption",
          text: "Direct connection between *Los Angeles* and *Houston*",
          t0: 0.2,
        },
      ],
    },
  ],
};

export const GeoMotionMap: React.FC<GeoMotionMapProps> = ({
  spec = defaultNeonSpec,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const [isLoaded, setIsLoaded] = useState(false);
  const [handle] = useState(() => delayRender("Loading GeoMotion Engine"));

  useEffect(() => {
    let isCancelled = false;

    const loadScripts = async () => {
      // Helper to dynamically load script tag
      const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const script = document.createElement("script");
          script.src = src;
          script.async = false;
          script.onload = () => resolve();
          script.onerror = (e) => reject(e);
          document.body.appendChild(script);
        });
      };

      try {
        if (!window.KZGEO) {
          await loadScript(staticFile("geomotion/geo.js"));
        }
        if (!window.GeoMotion) {
          await loadScript(staticFile("geomotion/engine.js"));
        }

        if (!isCancelled) {
          setIsLoaded(true);
          continueRender(handle);
        }
      } catch (err) {
        console.error("Failed to load GeoMotion Engine scripts", err);
        if (!isCancelled) {
          continueRender(handle);
        }
      }
    };

    loadScripts();

    return () => {
      isCancelled = true;
    };
  }, [handle]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.GeoMotion) {
      return;
    }

    const t = frame / fps;
    const finalSpec = {
      ...spec,
      width,
      height,
    };

    // GeoMotion looks for #stage in document
    try {
      window.GeoMotion.render(finalSpec, t);
    } catch (e) {
      console.error("GeoMotion render error at frame " + frame, e);
    }
  }, [frame, fps, isLoaded, spec, width, height]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#02050b",
        overflow: "hidden",
      }}
    >
      <div
        id="stage"
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      />
    </div>
  );
};

