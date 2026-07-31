import { AbsoluteFill, Series } from "remotion";

import {
  AtlasScene,
  DetailScene,
  EndScene,
  FilterScene,
  ImportScene,
  OpeningScene,
  PrivacyScene,
} from "./scenes";
import "./styles.css";
import { COLORS } from "./theme";

export const PROMO_FPS = 30;

const SCENE_DURATIONS = {
  opening: 120,
  import: 180,
  atlas: 240,
  filters: 180,
  detail: 210,
  privacy: 150,
  end: 120,
} as const;

export const PROMO_DURATION_FRAMES = Object.values(SCENE_DURATIONS).reduce(
  (total, duration) => total + duration,
  0,
);

export type PromoProps = {
  format: "landscape" | "portrait" | "square";
  productUrl: string;
};

export const DEFAULT_PROMO_PROPS: PromoProps = {
  format: "landscape",
  productUrl: "trackview.cpolar.top",
};

export const TraceAtlasPromo = ({ format, productUrl }: PromoProps) => (
  <AbsoluteFill
    className="promo-root"
    style={{
      background: COLORS.paper,
      overflow: "hidden",
    }}
  >
    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.opening}>
        <OpeningScene format={format} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.import}>
        <ImportScene format={format} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.atlas}>
        <AtlasScene format={format} productUrl={productUrl} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.filters}>
        <FilterScene format={format} productUrl={productUrl} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.detail}>
        <DetailScene format={format} productUrl={productUrl} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.privacy}>
        <PrivacyScene format={format} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.end}>
        <EndScene format={format} productUrl={productUrl} />
      </Series.Sequence>
    </Series>
    <div className="promo-grain" />
  </AbsoluteFill>
);
