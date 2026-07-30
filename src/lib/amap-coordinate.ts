import type { TrackPoint } from "./routes";

const PI = Math.PI;
const SEMI_MAJOR_AXIS = 6378245;
const ECCENTRICITY_SQUARED = 0.006693421622965943;

const isTaiwan = (lng: number, lat: number) =>
  lng >= 119.3 && lng <= 124.6 && lat >= 20.7 && lat <= 26.5;

const isOutsideGcj02Region = (lng: number, lat: number) =>
  lng < 72.004 ||
  lng > 137.8347 ||
  lat < 0.8293 ||
  lat > 55.8271 ||
  isTaiwan(lng, lat);

const latitudeOffset = (lng: number, lat: number) => {
  let result =
    -100 +
    2 * lng +
    3 * lat +
    0.2 * lat * lat +
    0.1 * lng * lat +
    0.2 * Math.sqrt(Math.abs(lng));
  result +=
    ((20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2) / 3;
  result +=
    ((20 * Math.sin(lat * PI) + 40 * Math.sin((lat / 3) * PI)) * 2) / 3;
  result +=
    ((160 * Math.sin((lat / 12) * PI) + 320 * Math.sin((lat * PI) / 30)) *
      2) /
    3;
  return result;
};

const longitudeOffset = (lng: number, lat: number) => {
  let result =
    300 +
    lng +
    2 * lat +
    0.1 * lng * lng +
    0.1 * lng * lat +
    0.1 * Math.sqrt(Math.abs(lng));
  result +=
    ((20 * Math.sin(6 * lng * PI) + 20 * Math.sin(2 * lng * PI)) * 2) / 3;
  result +=
    ((20 * Math.sin(lng * PI) + 40 * Math.sin((lng / 3) * PI)) * 2) / 3;
  result +=
    ((150 * Math.sin((lng / 12) * PI) + 300 * Math.sin((lng / 30) * PI)) *
      2) /
    3;
  return result;
};

export const toAmapCoordinate = (
  point: Pick<TrackPoint, "lng" | "lat">,
): [number, number] => {
  if (isOutsideGcj02Region(point.lng, point.lat)) {
    return [point.lng, point.lat];
  }

  let deltaLat = latitudeOffset(point.lng - 105, point.lat - 35);
  let deltaLng = longitudeOffset(point.lng - 105, point.lat - 35);
  const radLat = (point.lat / 180) * PI;
  const magic = 1 - ECCENTRICITY_SQUARED * Math.sin(radLat) ** 2;
  const sqrtMagic = Math.sqrt(magic);
  deltaLat =
    (deltaLat * 180) /
    (((SEMI_MAJOR_AXIS * (1 - ECCENTRICITY_SQUARED)) /
      (magic * sqrtMagic)) *
      PI);
  deltaLng =
    (deltaLng * 180) /
    ((SEMI_MAJOR_AXIS / sqrtMagic) * Math.cos(radLat) * PI);
  return [point.lng + deltaLng, point.lat + deltaLat];
};
