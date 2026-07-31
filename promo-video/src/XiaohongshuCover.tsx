import { AbsoluteFill } from "remotion";

import { Wordmark } from "./components";
import { COLORS, FONT } from "./theme";

export const XiaohongshuCover = () => (
  <AbsoluteFill
    className="promo-root"
    style={{
      background: COLORS.paper,
      color: COLORS.ink,
      padding: "92px 74px",
    }}
  >
    <Wordmark />
    <div style={{ marginTop: 200 }}>
      <div className="eyebrow">APPLE 健康路线查看器</div>
      <h1
        style={{
          fontFamily: FONT,
          fontSize: 112,
          fontWeight: 900,
          letterSpacing: "-0.07em",
          lineHeight: 0.94,
          margin: "42px 0 56px",
        }}
      >
        把走过的路，
        <br />
        重新放回
        <span style={{ color: COLORS.orange }}>地图</span>。
      </h1>
      <p style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.45 }}>
        跑步 · 骑行 · 徒步 · 登山
        <br />
        数据只在浏览器本地处理
      </p>
    </div>
    <svg
      viewBox="0 0 920 230"
      style={{ bottom: 80, left: 74, position: "absolute", width: 932 }}
    >
      <path
        d="M18 175 L65 151 L108 143 L151 151 L201 166 L252 169 L300 158 L340 132 L383 92 L428 73 L475 78 L523 99 L569 124 L616 138 L661 137 L705 121 L747 94 L789 67 L836 59 L895 68"
        fill="none"
        stroke={COLORS.white}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={28}
      />
      <path
        d="M18 175 L65 151 L108 143 L151 151 L201 166 L252 169 L300 158 L340 132 L383 92 L428 73 L475 78 L523 99 L569 124 L616 138 L661 137 L705 121 L747 94 L789 67 L836 59 L895 68"
        fill="none"
        stroke={COLORS.forest}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={14}
      />
      <circle cx="18" cy="175" fill={COLORS.yellow} r="17" stroke={COLORS.ink} strokeWidth="6" />
      <circle cx="895" cy="68" fill={COLORS.orange} r="17" stroke={COLORS.ink} strokeWidth="6" />
    </svg>
    <div className="promo-grain" />
  </AbsoluteFill>
);
