"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as maplibregl from "maplibre-gl";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import {
  ArrowDownUp,
  Bike,
  ChevronDown,
  CircleHelp,
  Clock3,
  Footprints,
  Gauge,
  HardDrive,
  Languages,
  LocateFixed,
  Map as MapIcon,
  Menu,
  Moon,
  Mountain,
  PersonStanding,
  Route,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  X,
} from "lucide-react";
import { clearLocalRoutes, loadLocalRoutes, mergeLocalRoutes } from "./lib/db";
import {
  ACTIVITY_COLORS,
  SAMPLE_ROUTES,
  type ActivityType,
  type ImportReport,
  type RouteRecord,
} from "./lib/routes";

type Language = "zh" | "en";
type UnitSystem = "metric" | "imperial";
type Theme = "light" | "dark";
type SortMode = "date" | "distance" | "duration" | "ascent";
type ImportProgress = {
  stage: string;
  percent: number;
  current?: number;
  total?: number;
};

const ACTIVITY_ORDER: ActivityType[] = [
  "running",
  "cycling",
  "walking",
  "hiking",
  "other",
];

const copy = {
  zh: {
    brand: "迹线",
    brandLatin: "TRACE ATLAS",
    library: "我的路线图谱",
    sampleLibrary: "匿名示例图谱",
    localOnly: "仅在此设备",
    import: "导入 Apple 健康",
    reimport: "更新 Apple 数据",
    help: "导入帮助",
    routes: "条路线",
    distance: "总距离",
    duration: "总时长",
    ascent: "总爬升",
    filters: "筛选",
    activity: "运动类型",
    year: "年份",
    all: "全部",
    date: "日期范围",
    source: "来源",
    sort: "排序",
    recent: "最近运动",
    longest: "距离最长",
    longestTime: "时长最长",
    highest: "爬升最高",
    noResults: "没有符合条件的路线",
    resetFilters: "清除筛选",
    sampleNotice: "正在浏览匿名示例路线",
    sampleBody: "导入后，示例会自动替换为你的个人路线图谱。",
    selected: "路线详情",
    activeTime: "运动时长",
    elapsedTime: "经过时间",
    pace: "平均配速",
    speed: "平均速度",
    elevation: "海拔剖面",
    start: "起点",
    finish: "终点",
    estimated: "估算",
    recordedBy: "记录来源",
    points: "轨迹点",
    importTitle: "把 Apple 健康路线带到地图上",
    importLead: "选择完整的 export.zip。文件只在浏览器本地解析，不会上传。",
    guideTitle: "如何导出",
    step1Title: "打开健康 App",
    step1Body: "在 iPhone 的“健康”App 中，点右上角头像。",
    step2Title: "导出所有健康数据",
    step2Body: "向下找到“导出所有健康数据”，等待系统生成文件。",
    step3Title: "保存并选择 ZIP",
    step3Body: "通过 AirDrop 或 iCloud Drive 传到电脑，不要解压。",
    chooseZip: "选择 export.zip",
    drop: "或把 ZIP 拖到这里",
    privacyTitle: "原始健康数据不会被保留",
    privacyBody: "完成后只保存路线和必要指标；完整 ZIP 与 export.xml 不会写入浏览器资料库。",
    parse: "开始解析",
    cancel: "取消",
    close: "关闭",
    replaceFile: "重新选择",
    scanning: "检查导出包",
    workouts: "读取运动记录",
    routeStage: "匹配 GPS 路线",
    saved: "已保存到此浏览器",
    importDone: "导入完成",
    imported: "新增路线",
    updated: "更新路线",
    skipped: "无路线已跳过",
    failed: "无法解析",
    viewLibrary: "查看我的路线",
    invalidZip: "没有找到 export.xml，请选择 Apple 健康导出的完整 ZIP。",
    genericError: "无法读取这个文件。请确认它是 Apple 健康导出的完整 ZIP。",
    largeFile: "这个文件较大，建议改用桌面浏览器导入。",
    clear: "清除本地数据",
    clearConfirm: "确定清除当前浏览器中的全部路线吗？删除后无法恢复。",
    theme: "切换主题",
    language: "切换语言",
    units: "切换单位",
    menu: "打开工具栏",
    mapError: "底图暂时无法加载，路线列表仍可正常使用。",
    privacyFootnote: "地图瓦片由第三方服务加载，但完整路线不会发送给地图服务。",
  },
  en: {
    brand: "Trace",
    brandLatin: "TRACE ATLAS",
    library: "My route atlas",
    sampleLibrary: "Anonymous demo atlas",
    localOnly: "On this device only",
    import: "Import Apple Health",
    reimport: "Update Apple data",
    help: "Import guide",
    routes: "routes",
    distance: "Distance",
    duration: "Duration",
    ascent: "Elevation",
    filters: "Filters",
    activity: "Activity",
    year: "Year",
    all: "All",
    date: "Date range",
    source: "Source",
    sort: "Sort",
    recent: "Most recent",
    longest: "Longest distance",
    longestTime: "Longest duration",
    highest: "Highest ascent",
    noResults: "No routes match these filters",
    resetFilters: "Reset filters",
    sampleNotice: "You’re exploring anonymous demo routes",
    sampleBody: "Your personal route atlas replaces these once you import.",
    selected: "Route details",
    activeTime: "Active time",
    elapsedTime: "Elapsed time",
    pace: "Average pace",
    speed: "Average speed",
    elevation: "Elevation profile",
    start: "Start",
    finish: "Finish",
    estimated: "Estimated",
    recordedBy: "Recorded by",
    points: "track points",
    importTitle: "Bring your Apple Health routes to the map",
    importLead: "Choose the complete export.zip. It is parsed locally and never uploaded.",
    guideTitle: "How to export",
    step1Title: "Open the Health app",
    step1Body: "On your iPhone, open Health and tap your profile photo.",
    step2Title: "Export all health data",
    step2Body: "Scroll down, choose “Export All Health Data,” and wait for the file.",
    step3Title: "Save and choose the ZIP",
    step3Body: "Move it with AirDrop or iCloud Drive. Do not unzip it.",
    chooseZip: "Choose export.zip",
    drop: "or drop the ZIP here",
    privacyTitle: "The raw health archive is never retained",
    privacyBody: "Only routes and required metrics are saved. The complete ZIP and export.xml are not written to the library.",
    parse: "Start import",
    cancel: "Cancel",
    close: "Close",
    replaceFile: "Choose another",
    scanning: "Checking the archive",
    workouts: "Reading workouts",
    routeStage: "Matching GPS routes",
    saved: "Saved in this browser",
    importDone: "Import complete",
    imported: "New routes",
    updated: "Updated",
    skipped: "No route",
    failed: "Couldn’t parse",
    viewLibrary: "View my routes",
    invalidZip: "No export.xml was found. Choose the complete Apple Health export ZIP.",
    genericError: "This file could not be read. Make sure it is a complete Apple Health export ZIP.",
    largeFile: "This file is large. A desktop browser is recommended.",
    clear: "Clear local data",
    clearConfirm: "Clear every route saved in this browser? This cannot be undone.",
    theme: "Toggle theme",
    language: "Switch language",
    units: "Switch units",
    menu: "Open toolbar",
    mapError: "The basemap could not load. The route list is still available.",
    privacyFootnote: "Map tiles come from a third party, but complete routes are not sent to the map provider.",
  },
} as const;

const activityLabels: Record<Language, Record<ActivityType, string>> = {
  zh: {
    running: "跑步",
    cycling: "骑行",
    walking: "徒步",
    hiking: "登山",
    other: "其他",
  },
  en: {
    running: "Run",
    cycling: "Ride",
    walking: "Walk",
    hiking: "Hike",
    other: "Other",
  },
};

const activityIcons = {
  running: Gauge,
  cycling: Bike,
  walking: PersonStanding,
  hiking: Mountain,
  other: Footprints,
};

const dateParts = (date: string) => {
  const match = date.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/,
  );
  if (!match) return new Date(date);
  return new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
    ),
  );
};

const yearFromDate = (date: string) =>
  Number(date.match(/^(\d{4})/)?.[1] ?? new Date(date).getUTCFullYear());

const formatDate = (date: string, language: Language) =>
  new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: language === "zh" ? "long" : "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(dateParts(date));

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
};

const formatDistance = (kilometers: number, units: UnitSystem) =>
  units === "metric"
    ? `${kilometers.toFixed(kilometers >= 100 ? 0 : 1)} km`
    : `${(kilometers * 0.621371).toFixed(kilometers >= 100 ? 0 : 1)} mi`;

const formatAscent = (meters: number, units: UnitSystem) =>
  units === "metric"
    ? `${Math.round(meters).toLocaleString()} m`
    : `${Math.round(meters * 3.28084).toLocaleString()} ft`;

const formatPace = (
  route: RouteRecord,
  units: UnitSystem,
  language: Language,
) => {
  if (!route.distanceKm || !route.durationSeconds) return "—";
  if (route.activity === "cycling" || route.activity === "other") {
    const value = (route.distanceKm / route.durationSeconds) * 3600;
    return units === "metric"
      ? `${value.toFixed(1)} km/h`
      : `${(value * 0.621371).toFixed(1)} mph`;
  }
  const paceSeconds =
    route.durationSeconds /
    (units === "metric" ? route.distanceKm : route.distanceKm * 0.621371);
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")} ${
    units === "metric" ? "min/km" : language === "zh" ? "分/英里" : "min/mi"
  }`;
};

const buildElevationPath = (route: RouteRecord) => {
  const elevations = route.points
    .map((point) => point.elevation)
    .filter((value): value is number => Number.isFinite(value));
  if (elevations.length < 2) return "";
  const min = Math.min(...elevations);
  const max = Math.max(...elevations);
  const span = Math.max(max - min, 1);
  return elevations
    .map((value, index) => {
      const x = (index / (elevations.length - 1)) * 320;
      const y = 94 - ((value - min) / span) * 70;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
};

const getBounds = (routes: RouteRecord[]) => {
  const points = routes.flatMap((route) => route.points);
  if (!points.length) return null;
  const bounds = new maplibregl.LngLatBounds();
  points.forEach((point) => bounds.extend([point.lng, point.lat]));
  return bounds;
};

const toRouteGeoJSON = (routes: RouteRecord[]) =>
  ({
    type: "FeatureCollection",
    features: routes.map((route) => ({
      type: "Feature",
      properties: {
        id: route.id,
        activity: route.activity,
      },
      geometry: {
        type: "LineString",
        coordinates: route.points.map((point) => [point.lng, point.lat]),
      },
    })),
  }) as GeoJSON.FeatureCollection;

export function TrackViewer() {
  const [language, setLanguage] = useState<Language>("zh");
  const [units, setUnits] = useState<UnitSystem>("metric");
  const [theme, setTheme] = useState<Theme>("light");
  const [libraryRoutes, setLibraryRoutes] = useState<RouteRecord[]>([]);
  const [libraryReady, setLibraryReady] = useState(true);
  const [selectedId, setSelectedId] = useState(SAMPLE_ROUTES[0].id);
  const [activityFilter, setActivityFilter] = useState<Set<ActivityType>>(
    new Set(ACTIVITY_ORDER),
  );
  const [yearFilter, setYearFilter] = useState<Set<number>>(new Set());
  const [sourceFilter, setSourceFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [showImport, setShowImport] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [importError, setImportError] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const t = copy[language];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("trace-language") as Language;
    const savedUnits = window.localStorage.getItem("trace-units") as UnitSystem;
    const savedTheme = window.localStorage.getItem("trace-theme") as Theme;
    const frame = window.requestAnimationFrame(() => {
      setLanguage(
        savedLanguage ||
          (navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en"),
      );
      if (savedUnits) setUnits(savedUnits);
      setTheme(
        savedTheme ||
          (window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"),
      );
    });
    loadLocalRoutes()
      .then((routes) => {
        setLibraryRoutes(routes);
        if (routes.length) setSelectedId(routes[0].id);
      })
      .finally(() => setLibraryReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("trace-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("trace-language", language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("trace-units", units);
  }, [units]);

  const isSample = libraryReady && libraryRoutes.length === 0;
  const routes = isSample ? SAMPLE_ROUTES : libraryRoutes;
  const years = useMemo(
    () =>
      [...new Set(routes.map((route) => yearFromDate(route.startDate)))]
        .sort((a, b) => b - a),
    [routes],
  );
  const sources = useMemo(
    () => [...new Set(routes.map((route) => route.sourceName))].sort(),
    [routes],
  );

  const filteredRoutes = useMemo(() => {
    const filtered = routes.filter((route) => {
      const localDate = route.startDate.slice(0, 10);
      return (
        activityFilter.has(route.activity) &&
        (!yearFilter.size || yearFilter.has(yearFromDate(route.startDate))) &&
        (sourceFilter === "all" || route.sourceName === sourceFilter) &&
        (!startDate || localDate >= startDate) &&
        (!endDate || localDate <= endDate)
      );
    });
    return filtered.sort((a, b) => {
      if (sortMode === "distance") return b.distanceKm - a.distanceKm;
      if (sortMode === "duration") return b.durationSeconds - a.durationSeconds;
      if (sortMode === "ascent") return b.ascentM - a.ascentM;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [
    routes,
    activityFilter,
    yearFilter,
    sourceFilter,
    startDate,
    endDate,
    sortMode,
  ]);

  const selectedRoute =
    filteredRoutes.find((route) => route.id === selectedId) ??
    filteredRoutes[0] ??
    null;

  const totals = useMemo(
    () =>
      filteredRoutes.reduce(
        (sum, route) => ({
          distance: sum.distance + route.distanceKm,
          duration: sum.duration + route.durationSeconds,
          ascent: sum.ascent + route.ascentM,
        }),
        { distance: 0, duration: 0, ascent: 0 },
      ),
    [filteredRoutes],
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [120.13, 30.24],
      zoom: 11.5,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right",
    );
    map.on("error", () => setMapError(true));
    map.on("load", () => {
      map.addSource("routes", {
        type: "geojson",
        data: toRouteGeoJSON(SAMPLE_ROUTES),
      });
      map.addLayer({
        id: "route-shadow",
        type: "line",
        source: "routes",
        paint: {
          "line-color": "#10211b",
          "line-opacity": 0.18,
          "line-width": 8,
          "line-blur": 1.2,
        },
      });
      map.addLayer({
        id: "routes",
        type: "line",
        source: "routes",
        paint: {
          "line-color": [
            "match",
            ["get", "activity"],
            "running",
            ACTIVITY_COLORS.running,
            "cycling",
            ACTIVITY_COLORS.cycling,
            "walking",
            ACTIVITY_COLORS.walking,
            "hiking",
            ACTIVITY_COLORS.hiking,
            ACTIVITY_COLORS.other,
          ],
          "line-opacity": 0.66,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 2, 14, 4],
        },
      });
      map.addLayer({
        id: "selected-halo",
        type: "line",
        source: "routes",
        filter: ["==", ["get", "id"], SAMPLE_ROUTES[0].id],
        paint: {
          "line-color": "#fffdf2",
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 7, 14, 11],
          "line-opacity": 0.96,
        },
      });
      map.addLayer({
        id: "selected-route",
        type: "line",
        source: "routes",
        filter: ["==", ["get", "id"], SAMPLE_ROUTES[0].id],
        paint: {
          "line-color": ACTIVITY_COLORS.running,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 3.5, 14, 6],
          "line-opacity": 1,
        },
      });
      map.addSource("endpoints", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "endpoint-circles",
        type: "circle",
        source: "endpoints",
        paint: {
          "circle-radius": 9,
          "circle-color": [
            "match",
            ["get", "kind"],
            "start",
            "#173f34",
            "#f2684a",
          ],
          "circle-stroke-color": "#fffdf2",
          "circle-stroke-width": 3,
        },
      });
      map.addLayer({
        id: "endpoint-labels",
        type: "symbol",
        source: "endpoints",
        layout: {
          "text-field": ["match", ["get", "kind"], "start", "A", "B"],
          "text-size": 10,
          "text-font": ["Noto Sans Regular"],
        },
        paint: { "text-color": "#ffffff" },
      });
      map.on("click", "routes", (event) => {
        const id = event.features?.[0]?.properties?.id;
        if (id) setSelectedId(String(id));
      });
      map.on("mouseenter", "routes", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "routes", () => {
        map.getCanvas().style.cursor = "";
      });
      setMapReady(true);
    });
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    (map.getSource("routes") as GeoJSONSource)?.setData(
      toRouteGeoJSON(filteredRoutes),
    );
    const validSelected = selectedRoute;
    const id = validSelected?.id ?? "";
    map.setFilter("selected-halo", ["==", ["get", "id"], id]);
    map.setFilter("selected-route", ["==", ["get", "id"], id]);
    map.setPaintProperty(
      "selected-route",
      "line-color",
      validSelected ? ACTIVITY_COLORS[validSelected.activity] : "#f2684a",
    );
    const start = validSelected?.points[0];
    const finish = validSelected?.points.at(-1);
    (map.getSource("endpoints") as GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features:
        start && finish
          ? [
              {
                type: "Feature",
                properties: { kind: "start" },
                geometry: { type: "Point", coordinates: [start.lng, start.lat] },
              },
              {
                type: "Feature",
                properties: { kind: "finish" },
                geometry: { type: "Point", coordinates: [finish.lng, finish.lat] },
              },
            ]
          : [],
    });
  }, [filteredRoutes, selectedRoute, selectedId, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedRoute) return;
    const bounds = getBounds([selectedRoute]);
    if (bounds) {
      mapRef.current.fitBounds(bounds, {
        padding: { top: 110, right: 390, bottom: 90, left: 390 },
        duration: 850,
        maxZoom: 15,
      });
    }
  }, [selectedId, mapReady, selectedRoute]);

  const resetFilters = () => {
    setActivityFilter(new Set(ACTIVITY_ORDER));
    setYearFilter(new Set());
    setSourceFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const toggleActivity = (activity: ActivityType) => {
    setActivityFilter((current) => {
      const next = new Set(current);
      if (next.has(activity)) next.delete(activity);
      else next.add(activity);
      return next;
    });
  };

  const toggleYear = (year: number) => {
    setYearFilter((current) => {
      const next = new Set(current);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const chooseFile = (file?: File) => {
    if (!file) return;
    setSelectedFile(file);
    setImportError("");
    setImportReport(null);
  };

  const startImport = useCallback(async () => {
    if (!selectedFile) return;
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
    if (isMobile && selectedFile.size > 500 * 1024 * 1024) {
      setImportError(t.largeFile);
      return;
    }
    setImportError("");
    setImportReport(null);
    setImportProgress({ stage: "scan", percent: 2 });
    const worker = new Worker(
      new URL("./workers/apple-health.worker.ts", import.meta.url),
      { type: "module" },
    );
    workerRef.current = worker;
    worker.onmessage = async (event) => {
      if (event.data.type === "progress") {
        setImportProgress(event.data);
      }
      if (event.data.type === "error") {
        setImportProgress(null);
        setImportError(
          event.data.code === "MISSING_EXPORT_XML"
            ? t.invalidZip
            : t.genericError,
        );
        worker.terminate();
        workerRef.current = null;
      }
      if (event.data.type === "complete") {
        const report = event.data.report as ImportReport;
        const merge = await mergeLocalRoutes(report.routes);
        const refreshedRoutes = await loadLocalRoutes();
        setLibraryRoutes(refreshedRoutes);
        setSelectedId(report.routes[0]?.id ?? refreshedRoutes[0]?.id ?? "");
        setImportReport({
          ...report,
          imported: merge.imported,
          updated: merge.updated,
        });
        setImportProgress(null);
        worker.terminate();
        workerRef.current = null;
      }
    };
    worker.onerror = () => {
      setImportProgress(null);
      setImportError(t.genericError);
      worker.terminate();
      workerRef.current = null;
    };
    worker.postMessage({ type: "parse", file: selectedFile });
  }, [selectedFile, t]);

  const cancelImport = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setImportProgress(null);
  };

  const clearLibrary = async () => {
    if (!window.confirm(t.clearConfirm)) return;
    await clearLocalRoutes();
    setLibraryRoutes([]);
    setSelectedId(SAMPLE_ROUTES[0].id);
    setImportReport(null);
    setSelectedFile(null);
    setShowImport(false);
  };

  const stageLabel = (stage: string) => {
    if (stage === "workouts") return t.workouts;
    if (stage === "routes") return t.routeStage;
    return t.scanning;
  };

  const selectedActivityIcon = selectedRoute
    ? activityIcons[selectedRoute.activity]
    : Route;
  const SelectedIcon = selectedActivityIcon;
  const elevationPath = selectedRoute ? buildElevationPath(selectedRoute) : "";
  const elevations =
    selectedRoute?.points
      .map((point) => point.elevation)
      .filter((value): value is number => Number.isFinite(value)) ?? [];
  const elevationMin = elevations.length ? Math.min(...elevations) : 0;
  const elevationMax = elevations.length ? Math.max(...elevations) : 0;

  return (
    <main className="atlas-shell">
      <header className="topbar">
        <button
          className="mobile-menu"
          onClick={() => setShowMobilePanel((value) => !value)}
          aria-label={t.menu}
        >
          <Menu size={19} />
        </button>
        <div className="brand-lockup">
          <div className="brand-mark"><Route size={21} /></div>
          <div>
            <strong>{t.brand}</strong>
            <span>{t.brandLatin}</span>
          </div>
        </div>
        <div className="topbar-center">
          <span className="topbar-rule" />
          <p>{isSample ? t.sampleLibrary : t.library}</p>
          <span className="privacy-chip"><ShieldCheck size={13} /> {t.localOnly}</span>
        </div>
        <div className="toolbar">
          <button
            className="tool-button"
            onClick={() => {
              setLanguage((value) => (value === "zh" ? "en" : "zh"));
            }}
            aria-label={t.language}
          >
            <Languages size={17} /><span>{language === "zh" ? "EN" : "中"}</span>
          </button>
          <button
            className="tool-button"
            onClick={() =>
              setUnits((value) => (value === "metric" ? "imperial" : "metric"))
            }
            aria-label={t.units}
          >
            <ArrowDownUp size={16} /><span>{units === "metric" ? "KM" : "MI"}</span>
          </button>
          <button
            className="tool-button icon-only"
            onClick={() =>
              setTheme((value) => (value === "light" ? "dark" : "light"))
            }
            aria-label={t.theme}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button className="import-button" onClick={() => setShowImport(true)}>
            <Upload size={16} /> {isSample ? t.import : t.reimport}
          </button>
        </div>
      </header>

      <aside className={`left-panel ${showMobilePanel ? "mobile-open" : ""}`}>
        <div className="panel-scroll">
          <section className="atlas-summary">
            <div className="summary-heading">
              <div>
                <span className="eyebrow">
                  {new Date().getUTCFullYear()} / {filteredRoutes.length} {t.routes}
                </span>
                <h1>{isSample ? t.sampleLibrary : t.library}</h1>
              </div>
              <button
                className="panel-close-mobile"
                onClick={() => setShowMobilePanel(false)}
                aria-label={t.close}
              >
                <X size={18} />
              </button>
            </div>
            <div className="summary-metrics">
              <div><span>{t.distance}</span><strong>{formatDistance(totals.distance, units)}</strong></div>
              <div><span>{t.duration}</span><strong>{formatDuration(totals.duration)}</strong></div>
              <div><span>{t.ascent}</span><strong>{formatAscent(totals.ascent, units)}</strong></div>
            </div>
          </section>

          <section className="filters">
            <div className="section-title">
              <span>{t.filters}</span>
              <button onClick={resetFilters}>{t.resetFilters}</button>
            </div>
            <label className="filter-label">{t.activity}</label>
            <div className="activity-grid">
              {ACTIVITY_ORDER.map((activity) => {
                const Icon = activityIcons[activity];
                const active = activityFilter.has(activity);
                return (
                  <button
                    key={activity}
                    className={`activity-filter ${active ? "active" : ""}`}
                    style={{ "--activity-color": ACTIVITY_COLORS[activity] } as React.CSSProperties}
                    onClick={() => toggleActivity(activity)}
                  >
                    <Icon size={16} />
                    <span>{activityLabels[language][activity]}</span>
                  </button>
                );
              })}
            </div>
            <label className="filter-label">{t.year}</label>
            <div className="year-row">
              <button
                className={!yearFilter.size ? "active" : ""}
                onClick={() => setYearFilter(new Set())}
              >
                {t.all}
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  className={yearFilter.has(year) ? "active" : ""}
                  onClick={() => toggleYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
            <div className="split-filters">
              <div>
                <label className="filter-label" htmlFor="start-date">{t.date}</label>
                <div className="date-pair">
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                  <span>—</span>
                  <input
                    aria-label="End date"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="filter-label" htmlFor="source-filter">{t.source}</label>
                <div className="select-wrap">
                  <select
                    id="source-filter"
                    value={sourceFilter}
                    onChange={(event) => setSourceFilter(event.target.value)}
                  >
                    <option value="all">{t.all}</option>
                    {sources.map((source) => <option key={source}>{source}</option>)}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </section>

          <section className="route-list-section">
            <div className="section-title">
              <span>{filteredRoutes.length} {t.routes}</span>
              <div className="select-wrap compact">
                <select
                  aria-label={t.sort}
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                >
                  <option value="date">{t.recent}</option>
                  <option value="distance">{t.longest}</option>
                  <option value="duration">{t.longestTime}</option>
                  <option value="ascent">{t.highest}</option>
                </select>
                <ChevronDown size={13} />
              </div>
            </div>
            <div className="route-list">
              {filteredRoutes.map((route) => {
                const Icon = activityIcons[route.activity];
                const selected = selectedRoute?.id === route.id;
                return (
                  <button
                    key={route.id}
                    className={`route-card ${selected ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedId(route.id);
                      setShowMobilePanel(false);
                    }}
                  >
                    <span
                      className="route-icon"
                      style={{ background: ACTIVITY_COLORS[route.activity] }}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="route-card-copy">
                      <strong>{activityLabels[language][route.activity]}</strong>
                      <small>{formatDate(route.startDate, language)}</small>
                    </span>
                    <span className="route-card-metric">
                      <strong>{formatDistance(route.distanceKm, units)}</strong>
                      <small>{formatDuration(route.durationSeconds)}</small>
                    </span>
                  </button>
                );
              })}
              {!filteredRoutes.length && (
                <div className="empty-state">
                  <MapIcon size={24} />
                  <p>{t.noResults}</p>
                  <button onClick={resetFilters}>{t.resetFilters}</button>
                </div>
              )}
            </div>
          </section>
        </div>
        <button className="help-link" onClick={() => setShowImport(true)}>
          <CircleHelp size={15} /> {t.help}
        </button>
      </aside>

      <section className="map-stage">
        <div className="map-canvas" ref={mapContainerRef} />
        <div className="topo-grid" aria-hidden="true" />
        {mapError && <div className="map-error">{t.mapError}</div>}
        {isSample && (
          <div className="sample-banner">
            <span className="sample-spark"><Sparkles size={16} /></span>
            <div><strong>{t.sampleNotice}</strong><p>{t.sampleBody}</p></div>
            <button onClick={() => setShowImport(true)}>{t.import}</button>
          </div>
        )}
        <div className="map-legend">
          {ACTIVITY_ORDER.slice(0, 4).map((activity) => (
            <span key={activity}>
              <i style={{ background: ACTIVITY_COLORS[activity] }} />
              {activityLabels[language][activity]}
            </span>
          ))}
        </div>
      </section>

      {selectedRoute && (
        <aside className="detail-panel">
          <div className="detail-hero">
            <span
              className="detail-icon"
              style={{ background: ACTIVITY_COLORS[selectedRoute.activity] }}
            >
              <SelectedIcon size={20} />
            </span>
            <div>
              <span className="eyebrow">{t.selected}</span>
              <h2>{activityLabels[language][selectedRoute.activity]}</h2>
              <p>{formatDate(selectedRoute.startDate, language)}</p>
            </div>
          </div>
          <div className="detail-primary">
            <div><span>{t.distance}</span><strong>{formatDistance(selectedRoute.distanceKm, units)}</strong></div>
            <div><span>{selectedRoute.activity === "cycling" ? t.speed : t.pace}</span><strong>{formatPace(selectedRoute, units, language)}</strong></div>
            <div><span>{t.activeTime}</span><strong>{formatDuration(selectedRoute.durationSeconds)}</strong></div>
            <div>
              <span>{t.ascent}{selectedRoute.estimatedAscent ? ` · ${t.estimated}` : ""}</span>
              <strong>{formatAscent(selectedRoute.ascentM, units)}</strong>
            </div>
          </div>
          <div className="detail-secondary">
            <span><Clock3 size={14} /> {t.elapsedTime}</span>
            <strong>{formatDuration(selectedRoute.elapsedSeconds ?? selectedRoute.durationSeconds)}</strong>
          </div>
          <div className="elevation-block">
            <div className="detail-section-title">
              <span>{t.elevation}</span>
              <small>{formatAscent(elevationMax, units)}</small>
            </div>
            {elevationPath ? (
              <div className="elevation-chart">
                <svg viewBox="0 0 320 108" role="img" aria-label={t.elevation}>
                  <defs>
                    <linearGradient id="elevationFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACTIVITY_COLORS[selectedRoute.activity]} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={ACTIVITY_COLORS[selectedRoute.activity]} stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <path d={`${elevationPath} L320,108 L0,108 Z`} fill="url(#elevationFill)" />
                  <path d={elevationPath} fill="none" stroke={ACTIVITY_COLORS[selectedRoute.activity]} strokeWidth="2.5" />
                </svg>
                <span className="elevation-min">{formatAscent(elevationMin, units)}</span>
                <span className="elevation-distance">{formatDistance(selectedRoute.distanceKm, units)}</span>
              </div>
            ) : (
              <div className="elevation-missing">—</div>
            )}
          </div>
          <div className="route-meta">
            <div><span><LocateFixed size={14} /> {t.start}</span><strong>A</strong></div>
            <div><span><LocateFixed size={14} /> {t.finish}</span><strong>B</strong></div>
            <div><span><HardDrive size={14} /> {t.recordedBy}</span><strong>{selectedRoute.sourceName}</strong></div>
            <div><span><MapIcon size={14} /> {selectedRoute.points.length.toLocaleString()} {t.points}</span></div>
          </div>
        </aside>
      )}

      {showImport && (
        <div className="modal-backdrop" role="presentation">
          <section className="import-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <button
              className="modal-close"
              onClick={() => {
                if (!importProgress) setShowImport(false);
              }}
              aria-label={t.close}
            >
              <X size={20} />
            </button>
            <div className="guide-column">
              <div className="guide-brand">
                <span><Route size={18} /></span>
                <strong>{t.guideTitle}</strong>
              </div>
              <div className="phone-illustration" aria-hidden="true">
                <div className="phone-speaker" />
                <div className="health-orb">♥</div>
                <div className="phone-line wide" />
                <div className="phone-line" />
                <div className="phone-export"><Upload size={15} /> export.zip</div>
              </div>
              <ol className="guide-steps">
                <li><span>1</span><div><strong>{t.step1Title}</strong><p>{t.step1Body}</p></div></li>
                <li><span>2</span><div><strong>{t.step2Title}</strong><p>{t.step2Body}</p></div></li>
                <li><span>3</span><div><strong>{t.step3Title}</strong><p>{t.step3Body}</p></div></li>
              </ol>
              <a
                href="https://support.apple.com/guide/iphone/share-your-health-data-iph5ede58c3d/ios"
                target="_blank"
                rel="noreferrer"
              >
                Apple 官方导出说明 ↗
              </a>
            </div>
            <div className="import-column">
              <span className="eyebrow">{t.localOnly}</span>
              <h2 id="import-title">{t.importTitle}</h2>
              <p className="import-lead">{t.importLead}</p>

              {!importProgress && !importReport && (
                <>
                  <label
                    className={`drop-zone ${selectedFile ? "has-file" : ""}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      chooseFile(event.dataTransfer.files[0]);
                    }}
                  >
                    <input
                      type="file"
                      accept=".zip,application/zip"
                      onChange={(event) => chooseFile(event.target.files?.[0])}
                    />
                    <span className="upload-orb"><Upload size={22} /></span>
                    {selectedFile ? (
                      <>
                        <strong>{selectedFile.name}</strong>
                        <small>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB · {t.replaceFile}</small>
                      </>
                    ) : (
                      <>
                        <strong>{t.chooseZip}</strong>
                        <small>{t.drop}</small>
                      </>
                    )}
                  </label>
                  {importError && <div className="import-error">{importError}</div>}
                  <div className="privacy-note">
                    <ShieldCheck size={20} />
                    <div><strong>{t.privacyTitle}</strong><p>{t.privacyBody}</p></div>
                  </div>
                  <button
                    className="primary-action"
                    disabled={!selectedFile}
                    onClick={startImport}
                  >
                    {t.parse} <span>→</span>
                  </button>
                  {!isSample && (
                    <button className="danger-link" onClick={clearLibrary}>{t.clear}</button>
                  )}
                </>
              )}

              {importProgress && (
                <div className="progress-state">
                  <div className="progress-ring" style={{ "--progress": `${importProgress.percent * 3.6}deg` } as React.CSSProperties}>
                    <span>{importProgress.percent}%</span>
                  </div>
                  <h3>{stageLabel(importProgress.stage)}</h3>
                  {importProgress.total ? (
                    <p>{importProgress.current} / {importProgress.total}</p>
                  ) : <p>export.zip</p>}
                  <div className="progress-track"><span style={{ width: `${importProgress.percent}%` }} /></div>
                  <button className="secondary-action" onClick={cancelImport}>{t.cancel}</button>
                </div>
              )}

              {importReport && (
                <div className="complete-state">
                  <span className="complete-mark"><ShieldCheck size={28} /></span>
                  <span className="eyebrow">{t.saved}</span>
                  <h3>{t.importDone}</h3>
                  <div className="report-grid">
                    <div><strong>{importReport.imported}</strong><span>{t.imported}</span></div>
                    <div><strong>{importReport.updated}</strong><span>{t.updated}</span></div>
                    <div><strong>{importReport.skippedNoRoute}</strong><span>{t.skipped}</span></div>
                    <div><strong>{importReport.failed}</strong><span>{t.failed}</span></div>
                  </div>
                  <button className="primary-action" onClick={() => setShowImport(false)}>
                    {t.viewLibrary} <span>→</span>
                  </button>
                </div>
              )}
              <p className="privacy-footnote">{t.privacyFootnote}</p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
