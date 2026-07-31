import AMapLoader from "@amap/amap-jsapi-loader";

export { toAmapCoordinate } from "./amap-coordinate";

export const loadAmap = async () => {
  const key = import.meta.env.VITE_AMAP_KEY?.trim();
  if (!key) {
    throw new Error("Missing VITE_AMAP_KEY");
  }

  return (await AMapLoader.load({
    key,
    version: "2.0",
    plugins: ["AMap.ToolBar"],
  })) as typeof AMap;
};
