import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
} from "remotion";

import {
  BrowserFrame,
  Pop,
  SceneHeader,
  Wordmark,
  easeOut,
} from "./components";
import { FILTERS, ROUTES, STATS, TOTAL_DISTANCE_KM } from "./data";
import { COLORS, FONT } from "./theme";
import { BASE_FPS, useBaseFrame } from "./timing";
import type { PromoProps } from "./TraceAtlasPromo";

type SceneProps = Pick<PromoProps, "format">;
type BrowserSceneProps = Pick<PromoProps, "format" | "productUrl">;

const Shell = ({
  children,
  format,
  dark = false,
}: SceneProps & {
  children: ReactNode;
  dark?: boolean;
}) => {
  const portrait = format === "portrait";
  return (
    <AbsoluteFill
      style={{
        background: dark ? COLORS.forest : COLORS.paper,
        color: dark ? COLORS.paper : COLORS.ink,
        padding: portrait ? "120px 74px" : "64px 82px",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const MapArtwork = ({
  activeRoute,
  progress = 1,
  quiet = false,
  showEndpoints = false,
}: {
  activeRoute?: string;
  progress?: number;
  quiet?: boolean;
  showEndpoints?: boolean;
}) => (
  <svg
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1080 720"
    style={{ height: "100%", width: "100%" }}
  >
    <rect width="1080" height="720" fill="#f0efe5" />
    <path
      d="M-30 82 C178 40 301 92 466 70 C666 44 816 106 1110 52 L1110 0 L-30 0Z"
      fill="#dce9d7"
    />
    <path
      d="M-20 520 C153 486 276 503 401 473 C552 437 672 454 805 420 C928 388 1017 405 1110 378 L1110 470 C1001 493 921 482 812 508 C671 541 555 529 421 558 C266 591 147 571 -20 610Z"
      fill="#c7dde4"
      opacity={0.72}
    />
    <g fill="#e3e1d5" opacity={0.95} stroke="#d1d2c8" strokeWidth={2}>
      <path d="M31 124 L138 110 L151 178 L42 190Z" />
      <path d="M404 116 L516 104 L523 171 L418 181Z" />
      <path d="M534 118 L625 111 L637 178 L545 187Z" />
      <path d="M70 301 L147 294 L155 362 L77 371Z" />
      <path d="M415 251 L511 238 L519 290 L427 307Z" />
      <path d="M882 96 L1005 111 L991 177 L873 160Z" />
      <path d="M896 529 L1021 506 L1032 577 L909 596Z" />
    </g>
    <g fill="none" stroke="#c6c9c2" strokeLinecap="round">
      <path d="M0 215 C184 221 304 198 455 207 C638 218 814 192 1080 202" strokeWidth={9} />
      <path d="M0 384 C202 377 338 406 507 379 C687 350 871 359 1080 336" strokeWidth={10} />
      <path d="M104 0 C98 137 121 233 116 356 C110 501 132 610 148 720" strokeWidth={8} />
      <path d="M399 0 C388 139 410 251 403 385 C396 511 418 622 430 720" strokeWidth={8} />
      <path d="M690 0 C704 131 681 261 698 380 C712 480 697 596 713 720" strokeWidth={8} />
      <path d="M946 0 C929 129 950 254 934 375 C920 492 949 603 929 720" strokeWidth={8} />
    </g>
    <g fill="none" stroke="#ffffff" strokeLinecap="round">
      <path d="M0 215 C184 221 304 198 455 207 C638 218 814 192 1080 202" strokeWidth={4} />
      <path d="M0 384 C202 377 338 406 507 379 C687 350 871 359 1080 336" strokeWidth={5} />
      <path d="M104 0 C98 137 121 233 116 356 C110 501 132 610 148 720" strokeWidth={4} />
      <path d="M399 0 C388 139 410 251 403 385 C396 511 418 622 430 720" strokeWidth={4} />
      <path d="M690 0 C704 131 681 261 698 380 C712 480 697 596 713 720" strokeWidth={4} />
      <path d="M946 0 C929 129 950 254 934 375 C920 492 949 603 929 720" strokeWidth={4} />
    </g>
    <path
      d="M-40 88 C207 44 341 96 510 70 C716 38 878 102 1120 48"
      fill="none"
      opacity={0.58}
      stroke="#a9d4b8"
      strokeWidth={34}
    />
    <g fill="#747d76" fontFamily="Arial, sans-serif" fontSize={13} fontWeight={700} opacity={0.8}>
      <text x="214" y="108">西湖景区</text>
      <text x="468" y="438">钱塘江绿道</text>
      <text x="766" y="113">北高峰</text>
      <text x="548" y="611">九溪</text>
    </g>
    {ROUTES.map((route, index) => {
      const selected = !activeRoute || activeRoute === route.id;
      const stagger = activeRoute ? 0 : index * 0.08;
      const drawnProgress = Math.max(0, Math.min(1, progress - stagger));
      return (
        <g key={route.id}>
          {selected ? (
            <path
              d={route.path}
              fill="none"
              opacity={activeRoute ? 1 : 0.7}
              pathLength={1}
              stroke={COLORS.white}
              strokeDasharray={1}
              strokeDashoffset={1 - drawnProgress}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={activeRoute === route.id ? 20 : 14}
            />
          ) : null}
          <path
            d={route.path}
            fill="none"
            opacity={
              activeRoute === route.id ? 1 : selected ? (quiet ? 0.55 : 1) : 0.12
            }
            pathLength={1}
            stroke={route.color}
            strokeDasharray={1}
            strokeDashoffset={1 - drawnProgress}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={activeRoute === route.id ? 10 : 7}
          />
          {showEndpoints && activeRoute === route.id && drawnProgress > 0 ? (
            <g fontFamily={FONT} fontSize={15} fontWeight={900} textAnchor="middle">
              <circle cx={route.start[0]} cy={route.start[1]} fill={COLORS.forest} r={20} stroke={COLORS.white} strokeWidth={5} />
              <text x={route.start[0]} y={route.start[1] + 5} fill={COLORS.white}>起</text>
              {drawnProgress > 0.96 ? (
                <>
                  <circle cx={route.end[0]} cy={route.end[1]} fill={COLORS.orange} r={20} stroke={COLORS.white} strokeWidth={5} />
                  <text x={route.end[0]} y={route.end[1] + 5} fill={COLORS.white}>终</text>
                </>
              ) : null}
            </g>
          ) : null}
        </g>
      );
    })}
  </svg>
);

const sceneTitleStyle = (
  portrait: boolean,
  size = 92,
): CSSProperties => ({
  fontFamily: FONT,
  fontSize: portrait ? size * 0.78 : size,
  fontWeight: 900,
  letterSpacing: "-0.065em",
  lineHeight: 0.98,
  margin: 0,
  maxWidth: portrait ? 880 : 1250,
});

export const OpeningScene = ({ format }: SceneProps) => {
  const frame = useBaseFrame();
  const portrait = format === "portrait";
  const lineProgress = easeOut(frame, 0, 90);
  return (
    <Shell format={format}>
      <div
        style={{
          alignItems: portrait ? "flex-start" : "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <Pop>
          <div className="eyebrow" style={{ marginBottom: 28 }}>
            YOUR ROUTES · YOUR MAP
          </div>
        </Pop>
        <Pop delay={8}>
          <h1 style={sceneTitleStyle(portrait, 112)}>
            你走过的路，
            <br />
            不该只留在
            <span style={{ color: COLORS.orange }}>健康数据</span>里。
          </h1>
        </Pop>
        <svg
          viewBox="0 0 1000 180"
          style={{
            bottom: portrait ? 240 : 70,
            height: portrait ? 220 : 160,
            left: portrait ? 20 : "auto",
            position: "absolute",
            right: portrait ? "auto" : 60,
            width: portrait ? 930 : 820,
          }}
        >
          <path
            d="M20 119 C136 25 240 159 346 73 C470 -27 568 160 700 68 C808 -8 884 36 980 16"
            fill="none"
            pathLength={1}
            stroke={COLORS.forest}
            strokeDasharray={1}
            strokeDashoffset={1 - lineProgress}
            strokeLinecap="round"
            strokeWidth={14}
          />
          {lineProgress > 0.94 ? (
            <circle
              cx="980"
              cy="16"
              fill={COLORS.orange}
              r="18"
              stroke={COLORS.ink}
              strokeWidth="6"
            />
          ) : null}
        </svg>
      </div>
    </Shell>
  );
};

export const ImportScene = ({ format }: SceneProps) => {
  const frame = useBaseFrame();
  const portrait = format === "portrait";
  const drop = spring({
    fps: BASE_FPS,
    frame: frame - 22,
    config: { damping: 13, stiffness: 135 },
  });
  const scan = interpolate(frame, [70, 145], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Shell format={format}>
      <SceneHeader index="01">导入 Apple 健康</SceneHeader>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: portrait ? 60 : 90,
          gridTemplateColumns: portrait ? "1fr" : "0.8fr 1.2fr",
          height: "calc(100% - 48px)",
        }}
      >
        <Pop delay={5}>
          <div>
            <h2 style={sceneTitleStyle(portrait, 86)}>
              一个 ZIP，
              <br />
              找回所有出发。
            </h2>
            <p
              style={{
                fontSize: portrait ? 28 : 26,
                fontWeight: 700,
                lineHeight: 1.5,
                marginTop: 30,
              }}
            >
              跑步、骑行、徒步与登山轨迹
              <br />
              在浏览器中完成解析。
            </p>
          </div>
        </Pop>
        <div
          className="brutal-panel"
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            height: portrait ? 610 : 570,
            justifyContent: "center",
            padding: 50,
            position: "relative",
          }}
        >
          <div
            style={{
              background: COLORS.orange,
              border: `5px solid ${COLORS.ink}`,
              boxShadow: `9px 9px 0 ${COLORS.ink}`,
              fontFamily: FONT,
              fontSize: portrait ? 34 : 30,
              fontWeight: 900,
              padding: "30px 42px",
              transform: `translateY(${(1 - drop) * -170}px) rotate(${(1 - drop) * -9}deg)`,
            }}
          >
             export.zip
          </div>
          <div
            style={{
              border: `4px solid ${COLORS.ink}`,
              height: 34,
              marginTop: 62,
              padding: 5,
              width: "78%",
            }}
          >
            <div
              style={{
                background: COLORS.forest,
                height: "100%",
                width: `${scan}%`,
              }}
            />
          </div>
          <strong
            style={{
              fontFamily: FONT,
              fontSize: 22,
              marginTop: 18,
            }}
          >
            {Math.round(scan)}% · 本地解析中
          </strong>
        </div>
      </div>
    </Shell>
  );
};

export const AtlasScene = ({ format, productUrl }: BrowserSceneProps) => {
  const frame = useBaseFrame();
  const portrait = format === "portrait";
  const routeProgress = easeOut(frame, 12, 150) * 1.3;
  const scale = interpolate(frame, [0, 210], [1.08, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <Shell format={format}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <SceneHeader index="02">让轨迹重新回到地图</SceneHeader>
        {!portrait ? <Wordmark /> : null}
      </div>
      <BrowserFrame
        url={productUrl}
        style={{
          height: portrait ? 1420 : 850,
          marginTop: portrait ? 60 : 0,
          transform: `scale(${scale})`,
        }}
      >
        <div style={{ height: "calc(100% - 64px)", position: "relative" }}>
          <MapArtwork progress={routeProgress} />
          <div
            className="brutal-panel"
            style={{
              left: 32,
              padding: portrait ? 24 : 18,
              position: "absolute",
              top: 28,
              width: portrait ? 380 : 340,
            }}
          >
            <strong style={{ fontFamily: FONT, fontSize: 23 }}>
              {ROUTES.length} 条路线 · {TOTAL_DISTANCE_KM.toFixed(1)} KM
            </strong>
            <div
              style={{
                display: "grid",
                gap: 12,
                marginTop: 18,
              }}
            >
              {ROUTES.map((route, index) => (
                <div
                  key={route.id}
                  style={{
                    alignItems: "center",
                    display: "flex",
                    fontSize: 17,
                    fontWeight: 800,
                    gap: 12,
                    opacity: easeOut(frame, 45 + index * 12, 20),
                  }}
                >
                  <span
                    style={{
                      background: route.color,
                      border: `2px solid ${COLORS.ink}`,
                      height: 10,
                      width: 28,
                    }}
                  />
                  <span>
                    {route.name}
                    <small
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 2,
                        opacity: 0.62,
                      }}
                    >
                      {route.label} · {route.distanceKm.toFixed(1)} km
                    </small>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BrowserFrame>
    </Shell>
  );
};

export const FilterScene = ({ format, productUrl }: BrowserSceneProps) => {
  const frame = useBaseFrame();
  const portrait = format === "portrait";
  if (portrait) {
    const sportFilters = ["跑步", "骑行", "徒步", "登山", "其他"];
    const activeSport =
      frame < 32 ? undefined : frame < 68 ? "跑步" : frame < 103 ? "骑行" : "跑步";
    const activeRoute =
      activeSport === "跑步" ? "run" : activeSport === "骑行" ? "ride" : undefined;
    const detailProgress = easeOut(frame, 142, 18);
    const clickFrames = [32, 68, 103, 138];
    const isPressing = Math.min(...clickFrames.map((click) => Math.abs(frame - click))) < 3;
    const cursorX = interpolate(
      frame,
      [0, 24, 32, 58, 68, 93, 103, 126, 138],
      [390, 155, 155, 355, 355, 155, 155, 115, 115],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    const cursorY = interpolate(
      frame,
      [0, 24, 32, 58, 68, 93, 103, 126, 138],
      [30, 146, 146, 146, 146, 146, 146, 420, 420],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

    return (
      <Shell format={format}>
        <SceneHeader index="03">筛选 · 点击 · 查看详情</SceneHeader>
        <h2 style={{ ...sceneTitleStyle(true, 78), marginTop: 38 }}>
          从八十条路线里，
          <br />
          找回那一天。
        </h2>
        <BrowserFrame
          url={productUrl}
          style={{ height: 1370, marginTop: 54, width: "100%" }}
        >
          <div style={{ height: "calc(100% - 64px)", position: "relative" }}>
            <MapArtwork
              activeRoute={activeRoute}
              progress={activeRoute ? 1 : easeOut(frame, 0, 30)}
              quiet
              showEndpoints={frame >= 138}
            />
            <div
              className="brutal-panel"
              style={{
                left: 24,
                padding: 22,
                position: "absolute",
                top: 24,
                width: 430,
              }}
            >
              <strong style={{ fontFamily: FONT, fontSize: 25 }}>筛选路线</strong>
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "1fr 1fr",
                  marginTop: 18,
                }}
              >
                {sportFilters.map((filter, index) => (
                  <div
                    key={filter}
                    style={{
                      background:
                        filter === activeSport
                          ? [COLORS.orange, COLORS.blue, COLORS.yellow, COLORS.mint, "#b6a5f5"][index]
                          : COLORS.white,
                      border: `3px solid ${COLORS.ink}`,
                      boxShadow:
                        filter === activeSport ? `5px 5px 0 ${COLORS.ink}` : "none",
                      fontFamily: FONT,
                      fontSize: 18,
                      fontWeight: 900,
                      padding: "13px 15px",
                    }}
                  >
                    {filter}
                  </div>
                ))}
              </div>
              <strong
                style={{
                  display: "block",
                  fontFamily: FONT,
                  fontSize: 17,
                  marginTop: 20,
                }}
              >
                年份
              </strong>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                {["全部", "2026", "2025"].map((year, index) => (
                  <span
                    key={year}
                    style={{
                      background: index === 0 ? COLORS.yellow : COLORS.white,
                      border: `3px solid ${COLORS.ink}`,
                      borderRadius: 30,
                      fontSize: 16,
                      fontWeight: 900,
                      padding: "8px 15px",
                    }}
                  >
                    {year}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                filter: "drop-shadow(5px 5px 0 rgba(0,0,0,.35))",
                left: cursorX,
                position: "absolute",
                top: cursorY,
                transform: `scale(${isPressing ? 0.82 : 0.9 + easeOut(frame, 0, 12) * 0.1})`,
                zIndex: 8,
              }}
            >
              <svg height="56" viewBox="0 0 48 56" width="48">
                <path
                  d="M5 3 L39 33 L25 36 L34 51 L25 55 L16 39 L5 48Z"
                  fill={COLORS.ink}
                  stroke={COLORS.white}
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
              </svg>
            </div>
            <div
              className="brutal-panel"
              style={{
                bottom: 28,
                opacity: detailProgress,
                padding: 24,
                position: "absolute",
                right: 24,
                transform: `translateY(${(1 - detailProgress) * 90}px)`,
                width: 500,
              }}
            >
              <div className="eyebrow">路线详情 · 跑步</div>
              <h3
                style={{
                  fontFamily: FONT,
                  fontSize: 38,
                  margin: "14px 0 20px",
                }}
              >
                西湖晨跑
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                {STATS.map((stat, index) => (
                  <div
                    key={stat.label}
                    style={{
                      background: [COLORS.orange, COLORS.yellow, "#b6a5f5", COLORS.mint][index],
                      border: `2px solid ${COLORS.ink}`,
                      minHeight: 84,
                      padding: 12,
                    }}
                  >
                    <small style={{ fontWeight: 900 }}>{stat.label}</small>
                    <div
                      style={{
                        fontFamily: FONT,
                        fontSize: 23,
                        fontWeight: 900,
                        marginTop: 7,
                      }}
                    >
                      {stat.value} {stat.unit}
                    </div>
                  </div>
                ))}
              </div>
              <svg
                viewBox="0 0 440 96"
                style={{
                  background: COLORS.paper,
                  border: `3px solid ${COLORS.ink}`,
                  marginTop: 18,
                  width: "100%",
                }}
              >
                <path
                  d="M0 65 L28 59 L52 74 L76 70 L84 25 L97 44 L120 39 L146 51 L170 76 L198 81 L226 75 L254 66 L282 64 L310 58 L336 66 L365 55 L394 61 L420 52 L440 58"
                  fill="none"
                  stroke={COLORS.orange}
                  strokeWidth="6"
                />
              </svg>
            </div>
          </div>
        </BrowserFrame>
      </Shell>
    );
  }

  const activeIndex = Math.min(4, Math.floor(frame / 32));
  return (
    <Shell format={format}>
      <div
        style={{
          display: "grid",
          gap: portrait ? 70 : 90,
          gridTemplateColumns: portrait ? "1fr" : "0.74fr 1.26fr",
          height: "100%",
          placeItems: "center",
        }}
      >
        <div>
          <SceneHeader index="03">筛选与发现</SceneHeader>
          <h2 style={{ ...sceneTitleStyle(portrait, 90), marginTop: 50 }}>
            按你的方式，
            <br />
            找回那一天。
          </h2>
          <p style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.5 }}>
            运动类型 · 年份 · 日期 · 来源
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 42,
            }}
          >
            {FILTERS.map((filter, index) => (
              <div
                key={filter}
                style={{
                  background:
                    index === activeIndex ? COLORS.yellow : COLORS.white,
                  border: `4px solid ${COLORS.ink}`,
                  boxShadow:
                    index === activeIndex ? `6px 6px 0 ${COLORS.ink}` : "none",
                  fontFamily: FONT,
                  fontSize: 20,
                  fontWeight: 900,
                  padding: "14px 19px",
                  transform:
                    index === activeIndex ? "translate(-3px, -3px)" : "none",
                }}
              >
                {filter}
              </div>
            ))}
          </div>
        </div>
        <BrowserFrame
          url={productUrl}
          style={{
            height: portrait ? 720 : 760,
            width: "100%",
          }}
        >
          <div style={{ height: "calc(100% - 64px)" }}>
            <MapArtwork
              activeRoute={
                activeIndex === 1
                  ? "run"
                  : activeIndex === 2
                    ? "ride"
                    : activeIndex === 3
                      ? "walk"
                      : activeIndex === 4
                        ? "hike"
                        : undefined
              }
              quiet
            />
          </div>
        </BrowserFrame>
      </div>
    </Shell>
  );
};

export const DetailScene = ({ format, productUrl }: BrowserSceneProps) => {
  const frame = useBaseFrame();
  const portrait = format === "portrait";
  const routeProgress = easeOut(frame, 6, 90);
  return (
    <Shell format={format}>
      <SceneHeader index="04">每一条轨迹，都有自己的故事</SceneHeader>
      <div
        style={{
          display: "grid",
          gap: portrait ? 50 : 70,
          gridTemplateColumns: portrait ? "1fr" : "1.3fr 0.7fr",
          height: "calc(100% - 50px)",
          marginTop: portrait ? 70 : 30,
        }}
      >
        <BrowserFrame
          url={productUrl}
          style={{ height: portrait ? 890 : 790 }}
        >
          <div style={{ height: "calc(100% - 64px)", position: "relative" }}>
            <MapArtwork
              activeRoute="run"
              progress={routeProgress}
              quiet
              showEndpoints
            />
          </div>
        </BrowserFrame>
        <div
          className="brutal-panel"
          style={{
            alignSelf: "center",
            padding: portrait ? 42 : 34,
          }}
        >
          <div className="eyebrow">2026 · WEST LAKE</div>
          <h2
            style={{
              fontFamily: FONT,
              fontSize: portrait ? 54 : 42,
              lineHeight: 1.05,
              margin: "24px 0 34px",
            }}
          >
            西湖晨跑
          </h2>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            {STATS.map((stat, index) => (
              <Pop key={stat.label} delay={45 + index * 8}>
                <div
                  style={{
                    background:
                      index === 0 ? COLORS.yellow : COLORS.paper,
                    border: `3px solid ${COLORS.ink}`,
                    minHeight: 112,
                    padding: 16,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 800 }}>
                    {stat.label}
                  </span>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: portrait ? 31 : 27,
                      fontWeight: 900,
                      marginTop: 10,
                    }}
                  >
                    {stat.value}
                    <small style={{ fontSize: 13, marginLeft: 5 }}>
                      {stat.unit}
                    </small>
                  </div>
                </div>
              </Pop>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
};

export const PrivacyScene = ({ format }: SceneProps) => {
  const frame = useBaseFrame();
  const compact = format !== "landscape";
  const lock = spring({
    fps: BASE_FPS,
    frame: frame - 18,
    config: { damping: 12, stiffness: 125 },
  });
  return (
    <Shell dark format={format}>
      <div
        style={{
          alignItems: "center",
          display: "grid",
          gap: compact ? 72 : 160,
          gridTemplateColumns: compact ? "1fr" : "0.72fr 1.28fr",
          height: "100%",
        }}
      >
        <div
          style={{
            height: compact ? 300 : 460,
            position: "relative",
            transform: `scale(${0.72 + lock * 0.28}) rotate(${(1 - lock) * -8}deg)`,
            width: compact ? 260 : 390,
          }}
        >
          <div
            style={{
              border: `18px solid ${COLORS.paper}`,
              borderBottom: 0,
              height: "45%",
              left: "21%",
              position: "absolute",
              top: 0,
              width: "58%",
            }}
          />
          <div
            style={{
              alignItems: "center",
              background: COLORS.yellow,
              border: `8px solid ${COLORS.paper}`,
              bottom: 0,
              display: "flex",
              height: "62%",
              justifyContent: "center",
              left: 0,
              position: "absolute",
              width: "100%",
            }}
          >
            <div
              style={{
                background: COLORS.ink,
                borderRadius: "50%",
                height: 48,
                width: 48,
              }}
            />
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ color: COLORS.mint }}>
            PRIVACY BY DEFAULT
          </div>
          <h2
            style={{
              ...sceneTitleStyle(compact, 102),
              color: COLORS.paper,
              marginTop: 30,
            }}
          >
            健康数据，
            <br />
            只留在你的浏览器。
          </h2>
          <Pop delay={45}>
            <div
              style={{
                background: COLORS.paper,
                border: `5px solid ${COLORS.ink}`,
                boxShadow: `10px 10px 0 ${COLORS.orange}`,
                color: COLORS.ink,
                display: "inline-block",
                fontFamily: FONT,
                fontSize: compact ? 24 : 25,
                fontWeight: 900,
                marginTop: 48,
                padding: "22px 30px",
              }}
            >
              不上传 · 不建账号 · 当前设备保存
            </div>
          </Pop>
        </div>
      </div>
    </Shell>
  );
};

export const EndScene = ({
  format,
  productUrl,
}: SceneProps & { productUrl: string }) => {
  const frame = useBaseFrame();
  const portrait = format === "portrait";
  const wipe = easeOut(frame, 0, 28);
  return (
    <Shell format={format}>
      <div
        style={{
          alignItems: portrait ? "flex-start" : "center",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          textAlign: portrait ? "left" : "center",
        }}
      >
        <Pop>
          <Wordmark />
        </Pop>
        <Pop delay={10}>
          <h2
            style={{
              ...sceneTitleStyle(portrait, 112),
              marginTop: 65,
              textAlign: portrait ? "left" : "center",
            }}
          >
            你的路线，
            <br />
            你的地图。
          </h2>
        </Pop>
        <Pop delay={22}>
          <div
            style={{
              background: COLORS.orange,
              border: `5px solid ${COLORS.ink}`,
              boxShadow: `10px 10px 0 ${COLORS.ink}`,
              fontFamily: FONT,
              fontSize: portrait ? 28 : 26,
              fontWeight: 900,
              marginTop: 60,
              padding: "22px 34px",
            }}
          >
            {productUrl}
          </div>
        </Pop>
        <div
          style={{
            background: COLORS.forest,
            bottom: 0,
            height: 22,
            left: 0,
            position: "absolute",
            transform: `scaleX(${wipe})`,
            transformOrigin: "left",
            width: "100%",
          }}
        />
      </div>
    </Shell>
  );
};
