import {
  ArrowRight,
  Bike,
  CircleHelp,
  Footprints,
  Gauge,
  HeartPulse,
  Map as MapIcon,
  Mountain,
  Route,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type { PublicPage } from "./public-site-routes";
import "./public-site.css";

const Brand = () => (
  <a className="public-brand" href="/" aria-label="迹线 Trace Atlas 首页">
    <span className="public-brand-mark" aria-hidden="true">
      <Route size={30} strokeWidth={2.7} />
    </span>
    <span>
      <strong>迹线</strong>
      <small>TRACE ATLAS</small>
    </span>
  </a>
);

const RouteRibbon = () => (
  <div className="route-ribbon" aria-hidden="true">
    <svg viewBox="0 0 840 360" role="presentation">
      <path
        className="route-ribbon-shadow"
        d="M72 272 C126 258 128 188 196 186 C252 184 249 252 315 239 C382 225 354 94 437 101 C516 108 485 245 566 225 C643 206 627 104 758 72"
      />
      <path
        className="route-ribbon-line"
        d="M72 272 C126 258 128 188 196 186 C252 184 249 252 315 239 C382 225 354 94 437 101 C516 108 485 245 566 225 C643 206 627 104 758 72"
      />
    </svg>
    <span className="route-ribbon-marker route-ribbon-marker-a">A</span>
    <span className="route-ribbon-marker route-ribbon-marker-b">B</span>
  </div>
);

const PublicHeader = ({ active }: { active: PublicPage }) => (
  <header className="public-header">
    <Brand />
    <nav aria-label="公共页面">
      <a className={active === "ios" ? "is-active" : ""} href="/ios">
        iOS
      </a>
      <a className={active === "privacy" ? "is-active" : ""} href="/privacy">
        隐私
      </a>
      <a className={active === "support" ? "is-active" : ""} href="/support">
        支持
      </a>
    </nav>
    <a className="public-header-action" href="/">
      网页版
      <ArrowRight size={17} />
    </a>
  </header>
);

const PublicFooter = () => (
  <footer className="public-footer">
    <Brand />
    <p>把走过的路，重新放回地图。</p>
    <div>
      <a href="/privacy">隐私政策</a>
      <a href="/support">帮助与支持</a>
      <a href="/">网页版路线查看器</a>
    </div>
  </footer>
);

const IosPage = () => (
  <>
    <section className="public-hero public-ios-hero">
      <div className="public-hero-copy">
        <span className="public-kicker">APPLE 健康路线查看器 · iOS</span>
        <h1>
          把走过的路，
          <br />
          放回地图。
        </h1>
        <p>
          迹线把 Apple 健康里的跑步、骑行、徒步和登山路线，整理成一张只属于你的 MapKit 路线图谱。
        </p>
        <div className="public-actions">
          <span className="public-status">
            <span aria-hidden="true" />
            iOS 内测准备中
          </span>
          <a className="public-button public-button-secondary" href="/">
            先体验网页版
            <ArrowRight size={19} />
          </a>
        </div>
        <small className="public-availability">需要 iPhone 与 iOS 17 或更高版本。TestFlight 尚未公开。</small>
      </div>
      <RouteRibbon />
    </section>

    <section className="public-proof-strip" aria-label="产品边界">
      <div>
        <ShieldCheck />
        <span>健康数据不上传</span>
      </div>
      <div>
        <HeartPulse />
        <span>HealthKit 只读</span>
      </div>
      <div>
        <MapIcon />
        <span>原生 MapKit</span>
      </div>
      <div>
        <Smartphone />
        <span>无需账户</span>
      </div>
    </section>

    <section className="public-section public-feature-section">
      <div className="public-section-heading">
        <span className="public-kicker">你的路线图谱</span>
        <h2>看路线，也看每次运动留下的细节。</h2>
      </div>
      <div className="public-feature-grid">
        <article className="public-feature-card public-feature-map">
          <span className="public-card-index">地图</span>
          <MapIcon size={38} />
          <h3>一张图，串起所有路线</h3>
          <p>按运动类型、年份、日期与来源筛选，在 MapKit 上高亮单条路线、起点和终点。</p>
        </article>
        <article className="public-feature-card public-feature-health">
          <span className="public-card-index">指标</span>
          <HeartPulse size={38} />
          <h3>记录了什么，就诚实呈现什么</h3>
          <p>距离、时长、配速或速度、累计爬升，以及可用的心率、活动能量、步数和运动强度。</p>
        </article>
        <article className="public-feature-card public-feature-local">
          <span className="public-card-index">本地</span>
          <ShieldCheck size={38} />
          <h3>你的健康数据留在 iPhone</h3>
          <p>路线索引、轨迹和设置保存在 App 容器内；没有账户、广告、分析 SDK 或云端同步。</p>
        </article>
      </div>
    </section>

    <section className="public-section public-activity-section">
      <div className="public-section-heading">
        <span className="public-kicker">支持的运动</span>
        <h2>从城市夜跑，到山脊徒步。</h2>
      </div>
      <div className="public-activity-list">
        <span><Gauge />跑步</span>
        <span><Bike />骑行</span>
        <span><Footprints />徒步</span>
        <span><Mountain />登山</span>
      </div>
      <aside className="public-note">
        <strong>当前版本边界</strong>
        <p>仅支持 Apple 健康；不写入健康数据，不提供账户、云同步或后台上传。</p>
        <a href="/privacy">阅读完整隐私边界 <ArrowRight size={17} /></a>
      </aside>
    </section>
  </>
);

const PolicySection = ({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="policy-section">
    <span>{label}</span>
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  </section>
);

const PrivacyPage = () => (
  <>
    <section className="public-page-title public-page-title-privacy">
      <span className="public-kicker">PRIVACY POLICY · 2026-08-02</span>
      <h1>路线属于你。<br />边界说清楚。</h1>
      <p>本政策说明迹线 iOS 如何读取、处理、保存和分享你授权的 Apple 健康数据。</p>
      <span className="public-local-badge"><ShieldCheck />数据主要在设备本地处理</span>
    </section>

    <div className="policy-layout">
      <aside className="policy-summary">
        <strong>先说结论</strong>
        <ul>
          <li>HealthKit 只读，不写入</li>
          <li>不建立账户，不做广告追踪</li>
          <li>开发者不接收健康数据或轨迹</li>
          <li>分享与诊断由你主动发起</li>
        </ul>
      </aside>
      <article className="policy-content">
        <PolicySection label="01" title="读取哪些数据">
          <p>只有在你主动连接 Apple 健康并授权后，迹线才会申请读取：</p>
          <ul>
            <li>运动记录与运动路线；</li>
            <li>心率、活动能量和步数；</li>
            <li>系统支持时的运动强度分数。</li>
          </ul>
          <p>这些数据用于路线列表、地图、运动详情、图表和汇总。迹线不会请求 HealthKit 写入权限。</p>
        </PolicySection>

        <PolicySection label="02" title="数据如何保存">
          <p>可搜索的路线索引、派生轨迹文件和偏好设置保存在迹线的 App 容器中。没有账户系统、第三方分析 SDK、广告 SDK、CloudKit 同步或开发者运营的健康数据服务器。</p>
          <p>删除 App 会由系统移除其本地容器；你也可以在 App 设置中清除本地索引、轨迹缓存和自定义内容。清除迹线数据不会删除 Apple 健康中的原始记录。</p>
        </PolicySection>

        <PolicySection label="03" title="地图服务的网络边界">
          <p>精确路线折线、运动标识和健康指标由迹线在本地叠加，不会由 App 附加到 MapKit 请求。</p>
          <p>为了显示底图，Apple 的 MapKit 服务会接收当前地图视窗或瓦片区域；该区域可能近似反映你正在查看的路线位置。相关处理同时受 Apple 的隐私政策约束。</p>
        </PolicySection>

        <PolicySection label="04" title="分享与诊断">
          <p>只有在你主动确认后，迹线才会生成一张本地 PNG 并交给 iOS 系统分享面板。默认会从路线首尾各裁剪 500 米；路线过短时只生成统计卡片。临时文件会排除备份并在分享结束、取消或过期后清理。</p>
          <p>诊断导出同样由你主动触发，只包含 App/系统版本、固定错误代码、计数、耗时与能力状态，不包含路线坐标、运动标识或健康指标。由系统分享后，接收方的处理受其自身政策约束。</p>
        </PolicySection>

        <PolicySection label="05" title="收集、追踪与系统 API">
          <p>迹线开发者不收集你的健康与健身数据、精确位置、标识符或使用数据，也不进行跨 App 或网站追踪。</p>
          <p>App 使用 Apple 要求说明用途的系统 API：UserDefaults 用于 App 私有偏好；文件时间戳用于清理 App 容器内缓存与临时文件；系统启动时间用于计算 App 内交互的经过时间。这些用途均为本地功能，不用于设备指纹或追踪。</p>
        </PolicySection>

        <PolicySection label="06" title="你的控制与联系我们">
          <p>你可以在系统设置中随时更改健康读取权限，也可以隐藏路线、重置缓存或清除迹线的本地数据。迹线无法判断某一项健康读取权限是否被拒绝，只会显示当前没有可读数据。</p>
          <p>如对本政策或数据处理有疑问，请通过帮助页面提供的公开支持渠道联系我们。政策随功能变化更新，并在本页标记更新日期。</p>
          <a className="public-inline-link" href="/support">前往帮助与支持 <ArrowRight size={17} /></a>
        </PolicySection>
      </article>
    </div>
  </>
);

const supportItems = [
  {
    title: "授权后仍看不到路线",
    body: "确认健康 App 中的运动记录本身带有路线，并在“设置 → 健康 → 数据访问与设备 → 迹线”中允许读取运动与运动路线。仅有运动统计、没有 GPS 路线的记录不会出现在地图图谱中。",
  },
  {
    title: "路线或历史记录没有更新",
    body: "打开迹线设置查看同步状态，保持 App 在前台并点一次手动同步。首次连接会先索引最近一年，再继续补齐更早的路线；历史较多时需要一些时间。",
  },
  {
    title: "底图暂时显示不出来",
    body: "MapKit 底图需要网络。先检查网络连接并重新打开地图；已经保存在本地的路线与统计不会因此上传。离线时，未缓存的底图区域可能无法显示。",
  },
  {
    title: "心率、步数或能量为空",
    body: "迹线只展示 Apple 健康实际提供且你已授权的数据。不同设备和运动类型记录的指标不同；缺失时不会用虚构数值补齐。",
  },
  {
    title: "分享卡片只有统计，没有地图",
    body: "默认隐私范围会从起点和终点各裁剪 500 米。路线不够长时，迹线会自动生成不含地图的统计卡片，避免暴露常用地点。",
  },
  {
    title: "想清除迹线里的数据",
    body: "在迹线设置中使用本地数据重置，或直接删除 App。该操作不会改动 Apple 健康里的原始运动记录；重新安装后如再次授权，可重新建立索引。",
  },
];

const SupportPage = () => (
  <>
    <section className="public-page-title public-page-title-support">
      <span className="public-kicker">HELP & SUPPORT</span>
      <h1>先解决问题，<br />再继续上路。</h1>
      <p>从健康权限到地图和分享，这里列出迹线 iOS 最常见的处理方式。</p>
      <a className="public-button public-button-primary" href="#common-questions">查看常见问题 <ArrowRight size={19} /></a>
    </section>

    <section className="support-grid" id="common-questions">
      {supportItems.map((item, index) => (
        <article key={item.title}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </article>
      ))}
    </section>

    <section className="support-contact">
      <div>
        <CircleHelp size={42} />
        <span className="public-kicker">仍然需要帮助？</span>
        <h2>带上可复现的信息，告诉我们。</h2>
        <p>请说明 iOS 版本、迹线版本、问题发生在哪一步，以及是否可以稳定复现。不要公开上传健康导出包、真实坐标或包含个人健康数据的截图。</p>
      </div>
      <a
        className="public-button public-button-primary"
        href="https://github.com/Nevermore130/track_view_web/issues"
        target="_blank"
        rel="noreferrer"
      >
        前往公开问题区
        <ArrowRight size={19} />
      </a>
    </section>

    <section className="support-scope">
      <ShieldCheck />
      <div>
        <h2>提交前先保护隐私</h2>
        <p>诊断信息应通过 App 内的本地导出功能生成；只有在你确认内容后，再选择是否分享给支持人员。</p>
      </div>
      <a href="/privacy">查看隐私政策 <ArrowRight size={17} /></a>
    </section>
  </>
);

export const PublicSite = ({ page }: { page: PublicPage }) => (
  <div className={`public-site public-site-${page}`}>
    <PublicHeader active={page} />
    <main>
      {page === "ios" && <IosPage />}
      {page === "privacy" && <PrivacyPage />}
      {page === "support" && <SupportPage />}
    </main>
    <PublicFooter />
  </div>
);
