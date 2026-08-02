export type PublicPage = "ios" | "privacy" | "support";

type PageMeta = {
  title: string;
  description: string;
};

export const publicPageForPath = (pathname: string): PublicPage | null => {
  const normalized = pathname !== "/" ? pathname.replace(/\/+$/, "") : pathname;
  if (normalized === "/ios") return "ios";
  if (normalized === "/privacy") return "privacy";
  if (normalized === "/support") return "support";
  return null;
};

export const publicPageMeta: Record<PublicPage, PageMeta> = {
  ios: {
    title: "迹线 iOS · Trace Atlas",
    description: "用 MapKit 查看 Apple 健康里的运动路线，数据保留在 iPhone 本地。",
  },
  privacy: {
    title: "隐私政策 · 迹线 Trace Atlas",
    description: "了解迹线 iOS 如何在设备本地读取、保存和展示 Apple 健康路线。",
  },
  support: {
    title: "帮助与支持 · 迹线 Trace Atlas",
    description: "迹线 iOS 的健康权限、路线同步、地图、分享与本地数据帮助。",
  },
};
