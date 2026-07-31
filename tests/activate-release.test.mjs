import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  readlink,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const execFileAsync = promisify(execFile);
const script = fileURLToPath(
  new URL("../deploy/tencent-lighthouse/activate-release.sh", import.meta.url),
);

const createArchive = async (archiveRoot, releaseId, content) => {
  const buildDirectory = await mkdtemp(path.join(tmpdir(), "trace-atlas-build-"));
  try {
    await writeFile(path.join(buildDirectory, "index.html"), content);
    await execFileAsync("tar", [
      "-C",
      buildDirectory,
      "-czf",
      path.join(archiveRoot, `trace-atlas-${releaseId}.tar.gz`),
      ".",
    ]);
  } finally {
    await rm(buildDirectory, { recursive: true, force: true });
  }
};

test("activates a fresh release for every workflow run of the same commit", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "trace-atlas-deploy-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const deployRoot = path.join(root, "deploy");
  const archiveRoot = path.join(root, "archives");
  await mkdir(archiveRoot);

  const sha = "a".repeat(40);
  const firstRelease = `${sha}-1001-1`;
  const secondRelease = `${sha}-1002-1`;
  await createArchive(archiveRoot, firstRelease, "first build");
  await createArchive(archiveRoot, secondRelease, "second build");

  const env = {
    ...process.env,
    TRACE_ATLAS_DEPLOY_ROOT: deployRoot,
    TRACE_ATLAS_ARCHIVE_ROOT: archiveRoot,
    TRACE_ATLAS_KEEP_RELEASES: "1",
  };
  await execFileAsync(script, [firstRelease], { env });
  const legacyRelease = "b".repeat(40);
  await mkdir(path.join(deployRoot, "releases", legacyRelease));
  await writeFile(
    path.join(deployRoot, "releases", legacyRelease, "index.html"),
    "legacy build",
  );
  await execFileAsync(script, [secondRelease], { env });

  assert.equal(
    await readFile(path.join(deployRoot, "current", "index.html"), "utf8"),
    "second build",
  );
  assert.equal(
    await readlink(path.join(deployRoot, "current")),
    path.join(deployRoot, "releases", secondRelease),
  );
  assert.deepEqual(await readdir(path.join(deployRoot, "releases")), [
    secondRelease,
  ]);
});
