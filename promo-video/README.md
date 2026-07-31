# 迹线宣发视频

独立的 Remotion 工程，用 React 程序化渲染 40 秒产品宣发片。视频使用贴近真实
运动形态的匿名合成路线，包括环湖跑、长距离骑行、山地折返和沿溪徒步；不会
读取主应用 IndexedDB、Apple 健康文件或其他用户数据。

## 环境要求

- Node.js 22
- npm
- 首次渲染时 Remotion 会准备兼容的浏览器运行环境

## 开始使用

```bash
cd promo-video
npm ci
npm run studio
```

Studio 中包含以下 Composition：

| Composition | 分辨率 | 用途 |
| --- | --- | --- |
| `TraceAtlas-16x9` | 1920×1080 | 官网、B 站、YouTube |
| `TraceAtlas-9x16` | 1080×1920 | 小红书、视频号、抖音 |
| `TraceAtlas-1x1` | 1080×1080 | 即刻、朋友圈、社交动态 |
| `TraceAtlas-XHS-40fps` | 1080×1920 | 小红书 40fps 视频笔记 |
| `TraceAtlas-XHS-Cover-3x4` | 1080×1440 | 小红书笔记封面 |

## 渲染

```bash
npm run render
npm run render:vertical
npm run render:square
npm run render:xhs
npm run render:xhs:assets
```

成片输出到 `promo-video/out/`，该目录不进入 Git。

`render:xhs` 输出 1080×1920、40fps、40 秒的竖屏 MP4。配套笔记文案与物料
说明见 [`materials/xiaohongshu-note.md`](materials/xiaohongshu-note.md)；
`render:xhs:assets` 可重新生成封面和三张竖屏配图。

渲染前检查：

```bash
npm run check
```

## 修改内容

- 文案、网址和默认格式：`src/TraceAtlasPromo.tsx`
- 分镜与动画：`src/scenes.tsx`
- 演示路线、筛选项和指标：`src/data.ts`
- 品牌颜色与字体：`src/theme.ts`
- Composition 尺寸：`src/Root.tsx`

所有动画都由帧数驱动，不使用随机数或线上地图服务，因此相同代码每次渲染结果
一致。后续可在 `public/` 中加入已取得授权的音乐和音效，再通过 Remotion 的
`<Audio>` 组件编排。
