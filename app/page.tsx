import type { Metadata } from "next";
import { TrackViewer } from "./track-viewer";

export const metadata: Metadata = {
  title: { absolute: "迹线 · Trace Atlas" },
  description: "把 Apple 健康里的跑步、骑行与徒步路线，变成只属于你的运动地图。",
};

export default function Home() {
  return <TrackViewer />;
}
