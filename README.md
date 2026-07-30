# 迹线 · Trace Atlas

隐私优先的 Apple 健康路线查看器。用户在浏览器中导入 `export.zip`，应用在
本地解析运动记录和 GPX 路线，只把必要的派生数据保存到当前浏览器的
IndexedDB；原始健康文件和路线不会上传到业务服务器。

## 技术结构

- React + TypeScript + Vite
- MapLibre GL + OpenFreeMap
- Web Worker 流式解析 Apple 健康 ZIP
- Dexie/IndexedDB 保存设备本地路线
- 标准静态构建产物，可部署到任意静态托管平台

应用没有服务端业务逻辑，因此不再使用 Next.js、Vinext、GPT Sites 或
Cloudflare Worker。部署适配器位于托管平台的 Git 集成，不进入应用运行时。

## 环境要求

- Node.js 22（见 `.nvmrc`）
- npm，安装版本以 `package-lock.json` 为准

首次安装：

```bash
nvm use
npm ci
```

## 本地开发

```bash
npm run dev
```

开发地址固定为 `http://127.0.0.1:5173`。端口被占用时会直接报错，避免误把
另一个进程当成当前应用。

## 质量检查

```bash
npm run check
```

该命令依次执行 ESLint、TypeScript 检查、生产构建和构建产物测试。构建产物
测试会确认地图 worker 与 Apple 健康导入 worker 已被正确打包和引用。

单独运行：

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 生产预览

```bash
npm run build
npm run preview
```

预览地址固定为 `http://127.0.0.1:4173`。Vite Preview 仅用于检查 `dist/`，
不能作为线上生产服务器。

## 发布

推荐使用 Git PR → CI → 预览部署 → 合并 `main` → 生产部署的流程。详细配置见
[发布流程](docs/deployment.md)。

地图底图由 OpenFreeMap 提供。地图服务会收到常规瓦片请求，但完整运动路线和
Apple 健康文件不会发送给地图服务。
