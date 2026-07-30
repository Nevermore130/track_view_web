# 迹线 · Trace Atlas

一个隐私优先的 Apple 健康路线查看器。用户在浏览器中导入完整的
`export.zip`，网页会在本地解析运动记录与 GPX 路线，并将必要的派生数据
保存到当前浏览器的 IndexedDB。原始健康 ZIP、完整 XML 和路线不会上传到
业务服务器。

## 功能

- Apple 健康 ZIP 本地流式解析
- 跑步、骑行、徒步、登山及其他路线分类
- 按运动类型、年份、日期范围和来源筛选
- 距离、时长、配速/速度和累计爬升
- 全部路线叠加、单条路线高亮、起终点标记
- 海拔剖面、中英双语、公英制与深浅主题
- 匿名示例路线和 Apple 健康导出教程

## 本地运行

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
```

验证：

```bash
npm run lint
npx tsc --noEmit
npm test
```

地图底图由 OpenFreeMap 提供。地图服务会收到常规瓦片请求，但完整运动路线
和 Apple 健康文件不会发送给地图服务。
