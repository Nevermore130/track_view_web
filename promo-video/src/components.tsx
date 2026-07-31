import type { CSSProperties, ReactNode } from "react";
import {
  interpolate,
  spring,
} from "remotion";

import { COLORS, FONT } from "./theme";
import { BASE_FPS, useBaseFrame } from "./timing";

export const easeOut = (
  frame: number,
  start: number,
  duration: number,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const Pop = ({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: CSSProperties;
}) => {
  const frame = useBaseFrame();
  const progress = spring({
    frame: frame - delay,
    fps: BASE_FPS,
    config: { damping: 16, stiffness: 160, mass: 0.8 },
  });
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 45}px) scale(${0.94 + progress * 0.06})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Wordmark = ({ inverse = false }: { inverse?: boolean }) => (
  <div
    style={{
      alignItems: "center",
      color: inverse ? COLORS.paper : COLORS.ink,
      display: "flex",
      fontFamily: FONT,
      fontSize: 28,
      fontWeight: 900,
      gap: 15,
      letterSpacing: "-0.04em",
    }}
  >
    <span
      style={{
        background: COLORS.orange,
        border: `4px solid ${inverse ? COLORS.paper : COLORS.ink}`,
        display: "grid",
        height: 42,
        placeItems: "center",
        transform: "rotate(-4deg)",
        width: 42,
      }}
    >
      迹
    </span>
    迹线 · TRACE ATLAS
  </div>
);

export const SceneHeader = ({
  index,
  children,
}: {
  index: string;
  children: ReactNode;
}) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      fontFamily: FONT,
      fontSize: 22,
      fontWeight: 900,
      gap: 16,
      letterSpacing: "0.08em",
    }}
  >
    <span
      style={{
        background: COLORS.yellow,
        border: `4px solid ${COLORS.ink}`,
        display: "grid",
        height: 48,
        placeItems: "center",
        width: 48,
      }}
    >
      {index}
    </span>
    {children}
  </div>
);

export const BrowserFrame = ({
  children,
  style,
  url,
}: {
  children: ReactNode;
  style?: CSSProperties;
  url: string;
}) => (
  <div
    className="brutal-panel"
    style={{ overflow: "hidden", position: "relative", ...style }}
  >
    <div
      style={{
        alignItems: "center",
        background: COLORS.paper,
        borderBottom: `5px solid ${COLORS.ink}`,
        display: "flex",
        gap: 11,
        height: 64,
        padding: "0 22px",
      }}
    >
      {[COLORS.orange, COLORS.yellow, COLORS.mint].map((color) => (
        <span
          key={color}
          style={{
            background: color,
            border: `3px solid ${COLORS.ink}`,
            height: 20,
            width: 20,
          }}
        />
      ))}
      <div
        style={{
          background: COLORS.white,
          border: `3px solid ${COLORS.ink}`,
          flex: 1,
          fontSize: 15,
          fontWeight: 700,
          marginLeft: 12,
          padding: "8px 16px",
        }}
      >
        {url}
      </div>
    </div>
    {children}
  </div>
);
