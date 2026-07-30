/// <reference lib="webworker" />

import {
  BlobReader,
  type Entry,
  type FileEntry,
  ZipReader,
} from "@zip.js/zip.js";
import { SaxesParser } from "saxes";
import {
  activityFromAppleType,
  calculateAscentM,
  haversineDistanceKm,
  type RouteRecord,
  type TrackPoint,
} from "../lib/routes";

type Workout = {
  id: string;
  activityType: string;
  startDate: string;
  endDate: string;
  durationSeconds: number;
  distanceKm?: number;
  ascentM?: number;
  sourceName: string;
  device?: string;
};

type WorkerRequest = { type: "parse"; file: File };

const scope = self as unknown as DedicatedWorkerGlobalScope;

const attribute = (attributes: unknown, key: string) => {
  const value = (attributes as Record<string, string | { value: string }>)[key];
  return typeof value === "string" ? value : value?.value;
};

const convertDuration = (value: number, unit = "min") => {
  if (unit.toLowerCase().startsWith("hour")) return value * 3600;
  if (unit.toLowerCase().startsWith("sec")) return value;
  return value * 60;
};

const convertDistance = (value: number, unit = "km") => {
  if (unit.toLowerCase().includes("mi")) return value * 1.609344;
  if (unit.toLowerCase() === "m") return value / 1000;
  return value;
};

const convertElevation = (value: number, unit = "m") =>
  unit.toLowerCase().includes("ft") ? value * 0.3048 : value;

const parseWorkoutXml = async (entry: FileEntry) => {
  const workouts: Workout[] = [];
  let current: Workout | null = null;
  const parser = new SaxesParser({ xmlns: false });

  parser.on("opentag", (node) => {
    if (node.name === "Workout") {
      const duration = Number(attribute(node.attributes, "duration") ?? 0);
      const distance = Number(attribute(node.attributes, "totalDistance") ?? NaN);
      current = {
        id:
          attribute(node.attributes, "uuid") ??
          `${attribute(node.attributes, "startDate")}-${workouts.length}`,
        activityType: attribute(node.attributes, "workoutActivityType") ?? "",
        startDate: attribute(node.attributes, "startDate") ?? "",
        endDate: attribute(node.attributes, "endDate") ?? "",
        durationSeconds: convertDuration(
          duration,
          attribute(node.attributes, "durationUnit"),
        ),
        distanceKm: Number.isFinite(distance)
          ? convertDistance(
              distance,
              attribute(node.attributes, "totalDistanceUnit"),
            )
          : undefined,
        sourceName: attribute(node.attributes, "sourceName") ?? "Apple 健康",
        device: attribute(node.attributes, "device"),
      };
    }

    if (node.name === "WorkoutStatistics" && current) {
      const type = attribute(node.attributes, "type") ?? "";
      if (type.includes("ElevationAscended")) {
        const sum = Number(attribute(node.attributes, "sum") ?? NaN);
        if (Number.isFinite(sum)) {
          current.ascentM = convertElevation(
            sum,
            attribute(node.attributes, "unit"),
          );
        }
      }
    }
  });

  parser.on("closetag", (node) => {
    if (node.name === "Workout" && current) {
      workouts.push(current);
      current = null;
    }
  });

  parser.on("error", (error) => {
    throw error;
  });

  const decoder = new TextDecoder();
  await entry.getData(
    new WritableStream<Uint8Array>({
      write(chunk) {
        parser.write(decoder.decode(chunk, { stream: true }));
      },
      close() {
        parser.write(decoder.decode());
        parser.close();
      },
    }),
  );

  return workouts;
};

const parseGpx = async (entry: FileEntry) => {
  const points: TrackPoint[] = [];
  let activePoint: TrackPoint | null = null;
  let activeTag = "";
  let text = "";
  const parser = new SaxesParser({ xmlns: false });

  parser.on("opentag", (node) => {
    activeTag = node.name.toLowerCase();
    text = "";
    if (activeTag.endsWith("trkpt")) {
      activePoint = {
        lat: Number(attribute(node.attributes, "lat")),
        lng: Number(attribute(node.attributes, "lon")),
      };
    }
  });

  parser.on("text", (value) => {
    text += value;
  });

  parser.on("closetag", (node) => {
    const tag = node.name.toLowerCase();
    if (activePoint && tag.endsWith("ele")) {
      const elevation = Number(text.trim());
      if (Number.isFinite(elevation)) activePoint.elevation = elevation;
    }
    if (activePoint && tag.endsWith("time")) {
      activePoint.time = text.trim();
    }
    if (activePoint && tag.endsWith("trkpt")) {
      if (Number.isFinite(activePoint.lat) && Number.isFinite(activePoint.lng)) {
        points.push(activePoint);
      }
      activePoint = null;
    }
    text = "";
    activeTag = "";
  });

  parser.on("error", (error) => {
    throw error;
  });

  const decoder = new TextDecoder();
  await entry.getData(
    new WritableStream<Uint8Array>({
      write(chunk) {
        parser.write(decoder.decode(chunk, { stream: true }));
      },
      close() {
        parser.write(decoder.decode());
        parser.close();
      },
    }),
  );
  return points;
};

const fileEntries = (entries: Entry[]) =>
  entries.filter((entry): entry is FileEntry => !entry.directory);

scope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== "parse") return;
  const reader = new ZipReader(new BlobReader(event.data.file));
  try {
    scope.postMessage({ type: "progress", stage: "scan", percent: 6 });
    const entries = fileEntries(await reader.getEntries());
    const exportXml = entries.find((entry) =>
      /(^|\/)export\.xml$/i.test(entry.filename),
    );
    if (!exportXml) throw new Error("MISSING_EXPORT_XML");

    const routeEntries = entries.filter((entry) =>
      /(^|\/)workout-routes\/.*\.gpx$/i.test(entry.filename),
    );
    scope.postMessage({ type: "progress", stage: "workouts", percent: 14 });
    const workouts = await parseWorkoutXml(exportXml);
    const unmatched = new Set(workouts.map((_, index) => index));
    const routes: RouteRecord[] = [];
    let failed = 0;

    for (let index = 0; index < routeEntries.length; index += 1) {
      try {
        const points = await parseGpx(routeEntries[index]);
        if (points.length < 2) {
          failed += 1;
          continue;
        }
        const routeStart = new Date(
          points[0].time ?? routeEntries[index].lastModDate,
        ).getTime();
        let bestIndex = -1;
        let bestDelta = Number.POSITIVE_INFINITY;
        for (const workoutIndex of unmatched) {
          const delta = Math.abs(
            new Date(workouts[workoutIndex].startDate).getTime() - routeStart,
          );
          if (delta < bestDelta) {
            bestDelta = delta;
            bestIndex = workoutIndex;
          }
        }
        const workout =
          bestIndex >= 0 && bestDelta <= 20 * 60 * 1000
            ? workouts[bestIndex]
            : undefined;
        if (workout) unmatched.delete(bestIndex);
        const distanceKm = workout?.distanceKm ?? haversineDistanceKm(points);
        const ascentM = workout?.ascentM ?? calculateAscentM(points);
        const startDate =
          workout?.startDate ??
          points[0].time ??
          routeEntries[index].lastModDate.toISOString();
        const endDate =
          workout?.endDate ??
          points.at(-1)?.time ??
          new Date(new Date(startDate).getTime() + 3600_000).toISOString();
        const elapsedSeconds = Math.max(
          0,
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / 1000,
        );
        routes.push({
          id:
            workout?.id ??
            `apple-route-${startDate}-${Math.round(distanceKm * 1000)}`,
          activity: activityFromAppleType(workout?.activityType),
          startDate,
          endDate,
          durationSeconds: workout?.durationSeconds || elapsedSeconds,
          elapsedSeconds,
          distanceKm,
          ascentM,
          sourceName: workout?.sourceName ?? "Apple 健康",
          device: workout?.device,
          points,
          estimatedDistance: workout?.distanceKm === undefined,
          estimatedAscent: workout?.ascentM === undefined,
          importedAt: new Date().toISOString(),
        });
      } catch {
        failed += 1;
      }
      scope.postMessage({
        type: "progress",
        stage: "routes",
        percent: 20 + Math.round(((index + 1) / Math.max(routeEntries.length, 1)) * 75),
        current: index + 1,
        total: routeEntries.length,
      });
    }

    scope.postMessage({
      type: "complete",
      report: {
        imported: routes.length,
        updated: 0,
        skippedNoRoute: unmatched.size,
        failed,
        routes,
      },
    });
  } catch (error) {
    scope.postMessage({
      type: "error",
      code: error instanceof Error ? error.message : "UNKNOWN",
    });
  } finally {
    await reader.close();
  }
};

export {};
