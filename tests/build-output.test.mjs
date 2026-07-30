import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const distDirectory = new URL("../dist/", import.meta.url);
const assetsDirectory = new URL("./assets/", distDirectory);

test("builds a portable static application", async () => {
  const html = await readFile(new URL("./index.html", distDirectory), "utf8");

  assert.match(html, /<title>迹线 · Trace Atlas<\/title>/i);
  assert.match(html, /<div id="root"><\/div>/i);
  assert.match(html, /type="module"/i);
  assert.doesNotMatch(html, /vinext|_next|chatgpt\.site|codex-preview/i);
});

test("ships the map loader and import worker as versioned assets", async () => {
  const assetNames = await readdir(assetsDirectory);
  const importWorker = assetNames.find((name) =>
    /^apple-health\.worker-.*\.js$/.test(name),
  );

  assert.ok(importWorker, "Apple Health import worker asset is missing");

  const scriptNames = assetNames.filter((name) => name.endsWith(".js"));
  const scripts = await Promise.all(
    scriptNames.map(async (name) => ({
      name,
      source: await readFile(new URL(`./${name}`, assetsDirectory), "utf8"),
    })),
  );

  assert.ok(
    scripts.some(({ source }) => source.includes("webapi.amap.com")),
    "AMap loader is missing from the application bundle",
  );
  assert.ok(
    scripts.some(({ source }) => source.includes(importWorker)),
    `${importWorker} is emitted but not referenced by the application`,
  );

  assert.equal(path.extname(importWorker), ".js");
});
