import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host ?? "localhost:3000"}/og.png`;

  return {
    title: {
      default: "迹线 · Trace Atlas",
      template: "%s · 迹线",
    },
    description:
      "在浏览器本地查看 Apple 健康中的跑步、骑行、徒步和登山路线。",
    openGraph: {
      title: "迹线 · Trace Atlas",
      description: "你的路线，你的地图。Apple 健康数据只在浏览器本地处理。",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1732,
          height: 909,
          alt: "Trace Atlas route map",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "迹线 · Trace Atlas",
      description: "你的路线，你的地图。Apple 健康数据只在浏览器本地处理。",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
