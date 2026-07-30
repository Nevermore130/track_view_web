// Canonical route model shared by imports, storage, filtering, and rendering.
export type ActivityType =
  | "running"
  | "cycling"
  | "walking"
  | "hiking"
  | "other";

export type TrackPoint = {
  lng: number;
  lat: number;
  elevation?: number;
  time?: string;
};

export type RouteRecord = {
  id: string;
  activity: ActivityType;
  startDate: string;
  endDate: string;
  durationSeconds: number;
  elapsedSeconds?: number;
  distanceKm: number;
  ascentM: number;
  sourceName: string;
  device?: string;
  points: TrackPoint[];
  estimatedDistance?: boolean;
  estimatedAscent?: boolean;
  importedAt?: string;
};

export type ImportReport = {
  imported: number;
  updated: number;
  skippedNoRoute: number;
  failed: number;
  routes: RouteRecord[];
};

const route = (
  id: string,
  activity: ActivityType,
  date: string,
  durationSeconds: number,
  distanceKm: number,
  ascentM: number,
  sourceName: string,
  points: Array<[number, number, number]>,
): RouteRecord => ({
  id,
  activity,
  startDate: date,
  endDate: new Date(new Date(date).getTime() + durationSeconds * 1000).toISOString(),
  durationSeconds,
  elapsedSeconds: durationSeconds + Math.round(durationSeconds * 0.08),
  distanceKm,
  ascentM,
  sourceName,
  points: points.map(([lng, lat, elevation], index) => ({
    lng,
    lat,
    elevation,
    time: new Date(
      new Date(date).getTime() + (durationSeconds * index * 1000) / (points.length - 1),
    ).toISOString(),
  })),
});

export const SAMPLE_ROUTES: RouteRecord[] = [
  route(
    "sample-run-west-lake",
    "running",
    "2026-05-18T06:42:00+08:00",
    3096,
    9.84,
    74,
    "Apple Watch",
    [
      [120.1447, 30.2494, 15],
      [120.151, 30.2455, 13],
      [120.1538, 30.2395, 13],
      [120.1501, 30.2326, 16],
      [120.1433, 30.2286, 19],
      [120.1355, 30.228, 26],
      [120.1287, 30.2331, 31],
      [120.1262, 30.2412, 22],
      [120.1307, 30.2493, 18],
      [120.1381, 30.2531, 16],
      [120.1447, 30.2494, 15],
    ],
  ),
  route(
    "sample-ride-qiantang",
    "cycling",
    "2025-10-03T07:18:00+08:00",
    5934,
    42.6,
    186,
    "Apple Watch",
    [
      [120.1716, 30.2443, 12],
      [120.1848, 30.2369, 11],
      [120.2011, 30.2315, 10],
      [120.2197, 30.2266, 10],
      [120.239, 30.2214, 9],
      [120.2572, 30.2163, 8],
      [120.2741, 30.21, 8],
      [120.2914, 30.2038, 7],
      [120.3032, 30.1935, 8],
      [120.2893, 30.1967, 8],
      [120.2685, 30.2027, 9],
      [120.2454, 30.2099, 9],
      [120.2214, 30.2185, 10],
      [120.1988, 30.2261, 11],
      [120.1802, 30.2361, 12],
      [120.1716, 30.2443, 12],
    ],
  ),
  route(
    "sample-hike-beigaofeng",
    "hiking",
    "2025-04-12T08:07:00+08:00",
    10428,
    13.2,
    816,
    "WorkOutDoors",
    [
      [120.1197, 30.2431, 35],
      [120.1164, 30.246, 71],
      [120.1128, 30.2488, 118],
      [120.1087, 30.2502, 176],
      [120.1055, 30.2532, 242],
      [120.1023, 30.2568, 305],
      [120.0992, 30.2605, 281],
      [120.096, 30.2634, 224],
      [120.0917, 30.2649, 182],
      [120.0879, 30.2622, 131],
      [120.084, 30.2587, 83],
      [120.0863, 30.2537, 102],
      [120.0913, 30.2508, 157],
      [120.0968, 30.2484, 210],
      [120.1024, 30.2458, 164],
      [120.1082, 30.2436, 97],
      [120.114, 30.2412, 48],
      [120.1197, 30.2431, 35],
    ],
  ),
  route(
    "sample-walk-longjing",
    "walking",
    "2024-11-09T15:21:00+08:00",
    6432,
    8.7,
    342,
    "Apple Watch",
    [
      [120.1201, 30.2297, 31],
      [120.1164, 30.2263, 52],
      [120.1119, 30.2237, 78],
      [120.1085, 30.2199, 113],
      [120.1052, 30.2161, 151],
      [120.1012, 30.2125, 187],
      [120.0967, 30.2092, 216],
      [120.0921, 30.2072, 197],
      [120.0884, 30.2099, 169],
      [120.0912, 30.2143, 151],
      [120.096, 30.2182, 119],
      [120.1011, 30.2219, 92],
      [120.1067, 30.225, 64],
      [120.1132, 30.2279, 43],
      [120.1201, 30.2297, 31],
    ],
  ),
  route(
    "sample-run-canal",
    "running",
    "2024-03-23T18:36:00+08:00",
    2555,
    7.21,
    32,
    "Keep",
    [
      [120.1533, 30.3076, 11],
      [120.1551, 30.3024, 11],
      [120.1573, 30.2971, 12],
      [120.1602, 30.2922, 12],
      [120.1625, 30.2868, 12],
      [120.1653, 30.2818, 13],
      [120.1687, 30.2772, 13],
      [120.1715, 30.2724, 13],
      [120.1688, 30.2774, 13],
      [120.1654, 30.282, 13],
      [120.1624, 30.2871, 12],
      [120.1601, 30.2924, 12],
      [120.1571, 30.2974, 12],
      [120.155, 30.3026, 11],
      [120.1533, 30.3076, 11],
    ],
  ),
  route(
    "sample-hike-shililangdang",
    "hiking",
    "2023-09-17T07:54:00+08:00",
    14220,
    17.9,
    1054,
    "Apple Watch",
    [
      [120.0891, 30.2077, 61],
      [120.0848, 30.2043, 103],
      [120.0804, 30.2011, 151],
      [120.0756, 30.1982, 210],
      [120.0708, 30.1952, 274],
      [120.0661, 30.1917, 322],
      [120.0613, 30.188, 297],
      [120.0562, 30.1845, 251],
      [120.0511, 30.1812, 204],
      [120.0458, 30.1787, 159],
      [120.0403, 30.1765, 111],
      [120.0351, 30.1737, 82],
      [120.0387, 30.1698, 126],
      [120.0443, 30.1682, 183],
      [120.0502, 30.1694, 235],
      [120.0565, 30.1718, 281],
      [120.0622, 30.1752, 244],
      [120.0684, 30.1801, 191],
      [120.0748, 30.1852, 138],
      [120.0814, 30.1912, 91],
      [120.0891, 30.2077, 61],
    ],
  ),
];

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  running: "#ff6b6b",
  cycling: "#4d8dff",
  walking: "#ffd93d",
  hiking: "#53d89b",
  other: "#c4b5fd",
};

export const activityFromAppleType = (value = ""): ActivityType => {
  const normalized = value.toLowerCase();
  if (normalized.includes("running")) return "running";
  if (normalized.includes("cycling")) return "cycling";
  if (normalized.includes("walking")) return "walking";
  if (normalized.includes("hiking")) return "hiking";
  return "other";
};

export const haversineDistanceKm = (points: TrackPoint[]) => {
  const radius = 6371;
  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    const dLat = ((point.lat - previous.lat) * Math.PI) / 180;
    const dLng = ((point.lng - previous.lng) * Math.PI) / 180;
    const lat1 = (previous.lat * Math.PI) / 180;
    const lat2 = (point.lat * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    return total + radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, 0);
};

export const calculateAscentM = (points: TrackPoint[]) => {
  let ascent = 0;
  let baseline = points.find((point) => Number.isFinite(point.elevation))?.elevation;
  if (baseline === undefined) return 0;
  for (const point of points) {
    if (!Number.isFinite(point.elevation)) continue;
    const elevation = point.elevation as number;
    const delta = elevation - baseline;
    if (Math.abs(delta) >= 3) {
      if (delta > 0) ascent += delta;
      baseline = elevation;
    }
  }
  return Math.round(ascent);
};
