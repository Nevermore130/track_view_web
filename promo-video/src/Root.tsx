import { Composition } from "remotion";

import {
  DEFAULT_PROMO_PROPS,
  PROMO_DURATION_FRAMES,
  PROMO_FPS,
  TraceAtlasPromo,
} from "./TraceAtlasPromo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="TraceAtlas-16x9"
      component={TraceAtlasPromo}
      durationInFrames={PROMO_DURATION_FRAMES}
      fps={PROMO_FPS}
      width={1920}
      height={1080}
      defaultProps={{ ...DEFAULT_PROMO_PROPS, format: "landscape" }}
    />
    <Composition
      id="TraceAtlas-9x16"
      component={TraceAtlasPromo}
      durationInFrames={PROMO_DURATION_FRAMES}
      fps={PROMO_FPS}
      width={1080}
      height={1920}
      defaultProps={{ ...DEFAULT_PROMO_PROPS, format: "portrait" }}
    />
    <Composition
      id="TraceAtlas-1x1"
      component={TraceAtlasPromo}
      durationInFrames={PROMO_DURATION_FRAMES}
      fps={PROMO_FPS}
      width={1080}
      height={1080}
      defaultProps={{ ...DEFAULT_PROMO_PROPS, format: "square" }}
    />
  </>
);
