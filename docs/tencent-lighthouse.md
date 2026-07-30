# 腾讯云轻量应用服务器部署

本方案把 CI 产出的 `dist/` 作为不可变版本上传到腾讯云轻量应用服务器，再通过
原子符号链接切换线上版本。服务器不安装 Node.js，也不接收或解析 Apple 健康
文件。公网入口支持两种模式：

- **cpolar 模式**：适合当前没有 ICP 备案的过渡阶段。Caddy 仅监听服务器回环
  地址，cpolar 建立出站隧道并提供公网 HTTPS。
- **公网直连模式**：备案完成后，由 Caddy 直接监听 80/443 并自动管理证书。

```text
GitHub Actions
  └─ npm run check
      └─ dist/ → SSH → /srv/trace-atlas/releases/<git-sha>
                            └─ current 原子切换
                                  └─ Caddy
                                      ├─ cpolar 隧道 → HTTPS
                                      └─ 公网直连 → HTTPS
```

## 方案特点

- 每个线上版本对应一个完整 Git commit，可快速回滚。
- 服务器不执行项目构建，不需要保存仓库或 npm 凭证。
- cpolar 模式由 cpolar 提供公网 HTTPS；直连模式由 Caddy 自动管理证书。
- Caddy 提供 gzip/zstd 压缩，两种入口共享同一静态站点。
- 带哈希的 `/assets/` 长期缓存，HTML 不缓存，避免新旧版本混用。
- SSH 校验固定的主机指纹，不在 CI 中临时信任 `ssh-keyscan` 结果。
- 默认保留最近 5 个版本；发布脚本只会清理受控版本目录。

## 1. 创建轻量应用服务器

推荐选择腾讯云的 Docker CE 应用镜像或 Ubuntu 24.04 LTS，并确认
`docker compose version` 可用。腾讯云当前的 Docker CE 应用镜像基于 Ubuntu
24.04 LTS，镜像内已配置腾讯云 Docker 镜像源。

为 Linux 实例绑定 SSH 密钥。腾讯云只保存公钥，平台生成的私钥仅能下载一次，
需要妥善保存。

### cpolar 模式防火墙

cpolar 客户端从服务器主动建立出站连接，因此不需要向公网开放网站端口：

| 协议 | 端口 | 来源 | 用途 |
| --- | --- | --- | --- |
| TCP | 22 | 见下方 SSH 策略 | SSH 发布 |

删除或关闭公网 80、443 规则。Caddy 只绑定 `127.0.0.1:8080`，无法通过服务器
公网 IP 直接访问。

### 公网直连模式防火墙

备案完成并切换直连模式后配置：

| 协议 | 端口 | 来源 | 用途 |
| --- | --- | --- | --- |
| TCP | 22 | 见下方 SSH 策略 | SSH 发布 |
| TCP | 80 | `0.0.0.0/0` | HTTP 跳转及 ACME 验证 |
| TCP | 443 | `0.0.0.0/0` | HTTPS |
| UDP | 443 | `0.0.0.0/0` | HTTP/3，可选 |

GitHub 托管 Runner 的出口 IP 会变化，不能直接套用“只允许固定办公 IP”的规则。
可以选择以下一种策略：

1. 默认工作流使用 `ubuntu-latest`：22 端口需要允许 GitHub Runner 访问。可向
   公网开放 22，但必须只允许密钥登录，使用无 `sudo` 权限的专用
   `trace-deploy` 用户，并用 UFW rate limiting 或 fail2ban 降低扫描风险。
2. 安全边界要求更高：使用带固定出口 IP 的 GitHub Larger Runner，或通过
   VPN/自托管 Runner 发布，再把 22 端口来源限制为对应固定 IP 或可信网段。

腾讯云轻量应用服务器的实例防火墙只管理入流量；操作系统自身启用 UFW 时也要
同步放行这些端口。

如果服务器位于中国大陆，通过服务器公网 IP 和自有域名直接提供网站服务前必须
完成 ICP 备案。cpolar 模式使用 cpolar 分配的公网入口作为过渡方案；若绑定自有
域名，仍需根据域名、接入地域和 cpolar 套餐确认备案要求。

腾讯云参考：

- [Docker CE 应用镜像](https://cloud.tencent.com/document/product/1207/60423)
- [管理 SSH 密钥](https://cloud.tencent.com/document/product/1207/44573)
- [管理实例防火墙](https://cloud.tencent.com/document/product/1207/44577)
- [添加域名解析](https://cloud.tencent.com/document/product/1207/81333)

## 2. 准备专用发布用户

在服务器上执行：

```bash
sudo adduser --disabled-password --gecos "" trace-deploy
sudo install -d -m 0700 -o trace-deploy -g trace-deploy \
  /home/trace-deploy/.ssh
sudo install -d -m 0755 -o trace-deploy -g trace-deploy \
  /srv/trace-atlas \
  /srv/trace-atlas/releases
sudo install -d -m 0755 /opt/trace-atlas
```

为 CI 单独生成一把 Ed25519 密钥，不复用个人登录密钥：

```bash
ssh-keygen -t ed25519 -C trace-atlas-deploy -f lighthouse-deploy
```

把 `lighthouse-deploy.pub` 的内容写入服务器：

```bash
sudo tee /home/trace-deploy/.ssh/authorized_keys > /dev/null
sudo chown trace-deploy:trace-deploy \
  /home/trace-deploy/.ssh/authorized_keys
sudo chmod 0600 /home/trace-deploy/.ssh/authorized_keys
```

上面的 `tee` 会等待标准输入；粘贴公钥后按 `Control-D`。确认新密钥可以登录后，
关闭 SSH 密码登录。`trace-deploy` 不应加入 `sudo` 或 Docker 用户组，它只需要
写入 `/srv/trace-atlas` 和自己的私有暂存目录。

## 3. 安装 Caddy 容器配置

从本地项目目录复制配置：

```bash
scp deploy/tencent-lighthouse/Caddyfile \
  deploy/tencent-lighthouse/compose.yaml \
  deploy/tencent-lighthouse/cpolar.env.example \
  deploy/tencent-lighthouse/cpolar.yml.example \
  deploy/tencent-lighthouse/lighthouse.env.example \
  deploy/tencent-lighthouse/activate-release.sh \
  LOGIN_USER@SERVER_IP:/tmp/
```

`LOGIN_USER` 使用实例当前可登录且具有 `sudo` 权限的账号。在服务器上安装：

```bash
sudo install -m 0644 /tmp/Caddyfile /opt/trace-atlas/Caddyfile
sudo install -m 0644 /tmp/compose.yaml /opt/trace-atlas/compose.yaml
sudo install -m 0755 \
  /tmp/activate-release.sh \
  /opt/trace-atlas/activate-release.sh
```

## 4. 当前推荐：启动 cpolar 模式

使用 cpolar 环境配置：

```bash
sudo install -m 0600 \
  /tmp/cpolar.env.example \
  /opt/trace-atlas/.env
cd /opt/trace-atlas
sudo docker compose --profile cpolar config
sudo docker compose --profile cpolar pull
sudo docker compose --profile cpolar up -d
```

首次发布前 `/srv/trace-atlas/current` 尚不存在，因此本地地址暂时返回 404 是
正常现象。按照 cpolar 官方 Linux 安装文档安装客户端并完成 token 认证，然后
安装配置：

```bash
sudo install -m 0600 \
  /tmp/cpolar.yml.example \
  /usr/local/etc/cpolar/cpolar.yml
sudo editor /usr/local/etc/cpolar/cpolar.yml
sudo systemctl enable cpolar
sudo systemctl restart cpolar
sudo systemctl status cpolar
```

必须把 `REPLACE_WITH_CPOLAR_AUTHTOKEN` 换成 cpolar 控制台提供的 token。配置将
cpolar Web UI 关闭，并把名为 `trace-atlas` 的 HTTP 隧道转发到
`127.0.0.1:8080`。

HTTP 隧道会生成 HTTP 和 HTTPS 公网地址。免费套餐的随机地址会定期变化，不适合
长期公开站点；需要稳定地址时，在 cpolar 控制台预留固定二级域名，并把
`region`、`subdomain` 加入隧道配置。`region` 必须与预留二级域名时选择的区域
完全一致，不能直接照抄示例值。

确认 cpolar 隧道状态为在线并取得 HTTPS 公网地址。公网地址只在 cpolar 配置和
控制台中维护，不需要同步到 GitHub。即使首次访问返回 404，也说明隧道已经连接
到 Caddy；随后执行第 7 节的首次发布。发布完成后检查：

```bash
curl -I http://127.0.0.1:8080
curl -I https://YOUR_CPOLAR_ADDRESS
```

cpolar 官方参考：[Linux 安装、配置文件和 HTTP 隧道](https://www.cpolar.com/docs)。

## 5. 备案后切换公网直连模式

把直连环境模板安装为 `/opt/trace-atlas/.env`，然后替换域名和邮箱：

```bash
sudo install -m 0600 \
  /tmp/lighthouse.env.example \
  /opt/trace-atlas/.env
sudo editor /opt/trace-atlas/.env
```

先把域名的 A 记录指向实例公网 IP，再启动服务：

```bash
cd /opt/trace-atlas
sudo docker compose --profile cpolar down
sudo docker compose --profile direct config
sudo docker compose --profile direct pull
sudo docker compose --profile direct up -d
sudo docker compose ps
```

Caddy 在域名解析生效且 80/443 端口可访问后自动获取 HTTPS 证书。证书数据保存
在 Docker 命名卷中，重建容器不会丢失。首次发布之前访问网站会返回 404，这是
因为 `/srv/trace-atlas/current` 尚未创建。

## 6. 配置 GitHub Environment

在 GitHub 仓库创建 `production` Environment。推荐为该环境设置人工批准规则，
并将允许部署的分支限制为 `main`，然后添加以下 Secrets：

| 名称 | 内容 |
| --- | --- |
| `LIGHTHOUSE_HOST` | 服务器公网 IP 或 SSH 主机名 |
| `LIGHTHOUSE_USER` | `trace-deploy` |
| `LIGHTHOUSE_SSH_KEY` | `lighthouse-deploy` 私钥完整内容 |
| `LIGHTHOUSE_KNOWN_HOSTS` | 已核验的服务器 SSH 主机公钥记录 |

在仓库 Variables 中添加：

| 名称 | 示例 | 说明 |
| --- | --- | --- |
| `LIGHTHOUSE_SSH_PORT` | `22` | 可省略，默认 22 |
| `TENCENT_LIGHTHOUSE_DEPLOY_ENABLED` | `true` | `main` 更新后自动发布 |

`LIGHTHOUSE_KNOWN_HOSTS` 不要使用 Actions 运行期间的临时扫描结果。先通过腾讯
云控制台登录服务器核对主机公钥指纹，再在可信电脑执行：

```bash
ssh-keyscan -p 22 SERVER_IP
```

不要在 GitHub Actions 运行期间临时扫描并信任主机，否则无法抵御中间人攻击。

## 7. 首次发布与日常发布

可以在 GitHub 的 **Actions → CI → Run workflow** 中勾选
`Deploy the verified build to Tencent Cloud Lighthouse` 完成首次发布。

当 `TENCENT_LIGHTHOUSE_DEPLOY_ENABLED=true` 时，之后每次推送到 `main` 都会：

1. 运行 lint、类型检查、测试和生产构建。
2. 下载同一工作流生成的 `dist/` 构建产物。
3. 上传到发布用户权限为 `0700` 的私有暂存目录，再解压到
   `/srv/trace-atlas/releases/<git-sha>`。
4. 原子切换 `/srv/trace-atlas/current`。
5. 通过 SSH 请求 `http://127.0.0.1:8080/`，确认 Caddy 能正常提供新版本。

所有生产发布共享同一个 Actions concurrency group，不会并行切换版本。发布过程
不会重启 Caddy，也不会出现目录被上传一半的状态。手动触发也只允许从 `main`
分支发布。cpolar 公网地址不再作为 GitHub 发布的重复配置；systemd 只负责保证
cpolar 进程运行，公网隧道可用性仍应通过 cpolar 控制台或独立外部监控确认。

## 8. 回滚

查看服务器中仍然保留的版本：

```bash
ls -1 /srv/trace-atlas/releases
```

选择目标 Git SHA 并切换：

```bash
sudo -u trace-deploy \
  /opt/trace-atlas/activate-release.sh \
  0123456789abcdef0123456789abcdef01234567
```

该操作只切换符号链接，无需重新构建或重启容器。发布脚本默认保留最近 5 个版本，
可通过服务器端环境变量 `TRACE_ATLAS_KEEP_RELEASES` 调整。

## 9. 运维检查

```bash
cd /opt/trace-atlas
sudo docker compose --profile cpolar ps
sudo docker compose --profile cpolar logs --tail=100 web-cpolar
sudo systemctl status cpolar
curl -I https://YOUR_CPOLAR_ADDRESS
```

更新 Caddy 镜像时先查看发行说明，在低流量时段执行：

```bash
cd /opt/trace-atlas
sudo docker compose --profile cpolar pull
sudo docker compose --profile cpolar up -d
```

Caddy 配置使用官方 `caddy:2.11.4-alpine` 镜像。升级版本需要在仓库中修改并走
同样的代码审查流程。
