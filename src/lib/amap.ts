import AMapLoader from "@amap/amap-jsapi-loader";

export { toAmapCoordinate } from "./amap-coordinate";

export const loadAmap = async () => {
  const key = import.meta.env.VITE_AMAP_KEY?.trim();
  const securityCode = import.meta.env.VITE_AMAP_SECURITY_CODE?.trim();
  if (!key || !securityCode) {
    throw new Error("Missing VITE_AMAP_KEY or VITE_AMAP_SECURITY_CODE");
  }

  window._AMapSecurityConfig = { securityJsCode: securityCode };
  return (await AMapLoader.load({
    key,
    version: "2.0",
    plugins: ["AMap.ToolBar"],
  })) as typeof AMap;
};

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string;
    };
  }
}
