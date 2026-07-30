import assert from "node:assert/strict";
import test from "node:test";

import { toAmapCoordinate } from "../src/lib/amap-coordinate.ts";

test("converts a mainland WGS-84 point for AMap display", () => {
  const source = { lng: 121.4737, lat: 31.2304 };
  const [lng, lat] = toAmapCoordinate(source);

  assert.ok(Math.abs(lng - source.lng) > 0.001);
  assert.ok(Math.abs(lat - source.lat) > 0.001);
  assert.ok(Math.abs(lng - source.lng) < 0.01);
  assert.ok(Math.abs(lat - source.lat) < 0.01);
});

test("leaves coordinates outside the GCJ-02 region unchanged", () => {
  assert.deepEqual(toAmapCoordinate({ lng: 2.3522, lat: 48.8566 }), [
    2.3522, 48.8566,
  ]);
  assert.deepEqual(toAmapCoordinate({ lng: 121.5654, lat: 25.033 }), [
    121.5654, 25.033,
  ]);
});
