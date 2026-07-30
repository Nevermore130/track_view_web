# 发布流程

项目输出标准静态目录 `dist/`，不依赖 Node.js 服务、GPT Sites、Cloudflare
Workers 或其他专有运行时。

## 推荐流程：Git 集成

1. 在 GitHub/GitLab 创建仓库并添加为 `origin`。
2. 为 `main` 开启分支保护，要求 `CI / verify` 通过后才能合并。
3. 在静态托管平台连接仓库：
   - 构建命令：`npm ci && npm run build`
   - 输出目录：`dist`
   - Node.js：读取 `.nvmrc`，当前为 Node 22
4. 将 PR/非 `main` 分支用于预览环境，将 `main` 用于生产环境。
5. 自定义域名、HTTPS、回滚和缓存策略由托管平台管理。

Cloudflare Pages、Vercel、Netlify 和 GitHub Pages 都能直接托管该产物。
Cloudflare Pages 的 Git 集成会为 PR 创建预览部署，并在 `main` 更新时发布生产
版本；Vercel 和 Netlify 也支持同类流程。

## 腾讯云轻量应用服务器

需要自行管理服务器或希望使用腾讯云时，可采用项目内置的轻量应用服务器方案：

- GitHub Actions 只上传已经通过 CI 的 `dist/`。
- Caddy 容器负责静态文件、压缩和自动 HTTPS。
- 每次发布写入独立 Git SHA 目录，再原子切换 `current`。
- 默认保留最近 5 个版本，可在服务器上快速回滚。

完整的服务器初始化、防火墙、域名、GitHub Secrets、首次发布和回滚步骤见
[腾讯云轻量应用服务器部署](./tencent-lighthouse.md)。

## 发布前检查

```bash
npm ci
npm run check
npm run preview
```

`npm run preview` 只用于本地检查构建产物，不应作为生产服务器。

## 子路径部署

如果站点不是发布在域名根路径，构建时传入：

```bash
BASE_PATH=/repository-name/ npm run build
```

## 回滚

推荐使用不可变部署记录回滚到上一个成功版本，不在服务器上原地覆盖文件。腾讯云
轻量应用服务器方案使用 `/srv/trace-atlas/releases/<git-sha>` 保存版本，并通过
`current` 符号链接原子切换。每个线上版本都应能追溯到一个 Git commit 和一次
通过的 CI 构建。

## 环境变量

当前应用不需要业务环境变量。未来若增加公开配置，只使用 `VITE_` 前缀，并在
`.env.example` 中列出变量名。任何 `VITE_` 变量都会进入浏览器包，不能存放
密钥、令牌或 Apple 健康数据。
