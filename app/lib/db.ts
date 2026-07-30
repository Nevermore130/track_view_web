"use client";

import Dexie, { type Table } from "dexie";
import type { RouteRecord } from "./routes";

class TrackViewDatabase extends Dexie {
  routes!: Table<RouteRecord, string>;

  constructor() {
    super("trace-atlas-v1");
    this.version(1).stores({
      routes: "id, activity, startDate, sourceName",
    });
  }
}

let database: TrackViewDatabase | null = null;

const getDatabase = () => {
  if (typeof window === "undefined") return null;
  database ??= new TrackViewDatabase();
  return database;
};

export const loadLocalRoutes = async () =>
  (await getDatabase()?.routes.toArray()) ?? [];

export const mergeLocalRoutes = async (routes: RouteRecord[]) => {
  const db = getDatabase();
  if (!db) return { imported: 0, updated: 0 };
  const existingIds = new Set(
    (await db.routes.bulkGet(routes.map((item) => item.id)))
      .filter(Boolean)
      .map((item) => item!.id),
  );
  await db.routes.bulkPut(routes);
  return {
    imported: routes.filter((item) => !existingIds.has(item.id)).length,
    updated: routes.filter((item) => existingIds.has(item.id)).length,
  };
};

export const clearLocalRoutes = async () => {
  await getDatabase()?.routes.clear();
};
