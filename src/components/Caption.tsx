import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption as RemotionCaption,
} from "@remotion/captions";
import captionsData from "../data/captions.json";
import { colors, fonts, typeScale } from "../design/tokens";

export interface CaptionOverlayProps {
  captions?: RemotionCaption[];
}

export const Caption: React.FC<CaptionOverlayProps> = ({
  captions = captionsData as RemotionCaption[],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const { pages } = useMemo(() => {
    // Remotion requires leading space to evaluate breakOnSilenceAfterMilliseconds
    const normalized = captions.map((c, idx) =>
      idx > 0 && !c.text.startsWith(" ") ? { ...c, text: ` ${c.text}` } : c,
    );
    return createTikTokStyleCaptions({
      captions: normalized,
      combineTokensWithinMilliseconds: 2600,
      breakOnSilenceAfterMilliseconds: 500,
    });
  }, [captions]);

  const activePage = useMemo(() => {
    return pages.find((page) => {
      const lastToken = page.tokens[page.tokens.length - 1];
      const pageEndMs = lastToken ? lastToken.toMs : page.startMs + page.durationMs;
      return currentMs >= page.startMs && currentMs <= pageEndMs + 220;
    });
  }, [pages, currentMs]);

  if (!activePage || activePage.tokens.length === 0) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 68,
        paddingLeft: 140,
        paddingRight: 140,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(34, 42, 53, 0.72)",
          borderRadius: 20,
          border: "1px solid rgba(143, 163, 184, 0.25)",
          padding: "16px 34px",
          maxWidth: 1520,
          textAlign: "center",
          lineHeight: 1.28,
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.38)",
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontSize: typeScale.caption,
            fontWeight: 600,
            color: colors.cream,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "normal",
          }}
        >
          {activePage.tokens.map((token, idx) => {
            const isActive =
              currentMs >= token.fromMs && currentMs < token.toMs;
            return (
              <span
                key={`${token.fromMs}-${idx}`}
                style={{
                  color: isActive ? colors.amber : colors.cream,
                }}
              >
                {token.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
