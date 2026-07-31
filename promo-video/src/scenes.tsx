import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  BrowserFrame,
  Pop,
  SceneHeader,
  Wordmark,
  easeOut,
} from "./components";
import { FILTERS, ROUTES, STATS } from "./data";
import { COLORS, FONT } from "./theme";
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
}: {
  activeRoute?: string;
  progress?: number;
  quiet?: boolean;
}) => (
  <svg
    preserveAspectRatio="xMidYMid slice"
    viewBox="0 0 1080 720"
    style={{ height: "100%", width: "100%" }}
  >
    <rect width="1080" height="720" fill="#f0efe5" />
    <g opacity={0.38} stroke="#9aa29c" strokeWidth={2}>
      {Array.from({ length: 14 }, (_, index) => (
        <path
          key={`road-h-${index}`}
          d={`M0 ${40 + index * 52} C240 ${15 + index * 57} 620 ${
            72 + index * 43
          } 1080 ${28 + index * 51}`}
          fill="none"
        />
      ))}
      {Array.from({ length: 12 }, (_, index) => (
        <path
          key={`road-v-${index}`}
          d={`M${25 + index * 95} 0 C${84 + index * 83} 230 ${
            5 + index * 100
          } 470 ${72 + index * 87} 720`}
          fill="none"
        />
      ))}
    </g>
    <path
      d="M-40 136 C250 62 364 154 548 105 C746 52 922 123 1120 66"
      fill="none"
      opacity={0.45}
      stroke="#a9d4b8"
      strokeWidth={60}
    />
    {ROUTES.map((route, index) => {
      const selected = !activeRoute || activeRoute === route.id;
      return (
        <g key={route.id}>
          {activeRoute === route.id ? (
            <path
              d={route.path}
              fill="none"
              stroke={COLORS.white}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={22}
            />
          ) : null}
          <path
            d={route.path}
            fill="none"
            opacity={selected ? (quiet ? 0.55 : 1) : 0.12}
            pathLength={1}
            stroke={route.color}
            strokeDasharray={1}
            strokeDashoffset={1 - Math.max(0, Math.min(1, progress - index * 0.08))}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={activeRoute === route.id ? 11 : 8}
          />
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
  const frame = useCurrentFrame();
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
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const portrait = format === "portrait";
  const drop = spring({
    fps,
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
  const frame = useCurrentFrame();
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
              width: portrait ? 360 : 285,
            }}
          >
            <strong style={{ fontFamily: FONT, fontSize: 23 }}>
              {ROUTES.length} 条路线 · 83.6 KM
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
                  {route.label}
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
  const frame = useCurrentFrame();
  const portrait = format === "portrait";
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
  const frame = useCurrentFrame();
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
            <MapArtwork activeRoute="run" progress={routeProgress} quiet />
            <div
              style={{
                background: COLORS.forest,
                border: `5px solid ${COLORS.white}`,
                borderRadius: "50%",
                color: COLORS.white,
                display: "grid",
                fontFamily: FONT,
                fontSize: 16,
                height: 44,
                left: "18%",
                placeItems: "center",
                position: "absolute",
                top: "29%",
                width: 44,
              }}
            >
              A
            </div>
            <div
              style={{
                background: COLORS.orange,
                border: `5px solid ${COLORS.white}`,
                borderRadius: "50%",
                color: COLORS.white,
                display: "grid",
                fontFamily: FONT,
                fontSize: 16,
                height: 44,
                left: "38%",
                placeItems: "center",
                position: "absolute",
                top: "27%",
                width: 44,
              }}
            >
              B
            </div>
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
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const compact = format !== "landscape";
  const lock = spring({
    fps,
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
  const frame = useCurrentFrame();
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
