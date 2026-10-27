// core/C19 Code tests for the `kaal` lifecycle commands, beyond the planned core/T43–core/T47.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";

const CLI = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const RECORD = ".kaal/state/core/installation.json";
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const made: string[] = [];
const repository = (prefix: string) => {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  made.push(dir);
  return dir;
};
after(() => made.forEach((d) => rmSync(d, { recursive: true, force: true })));

describe("kaal version (core/C19)", () => {
  it("reports an Engine outside ./.kaal as unrecorded without reading the default Engine's record", () => {
    const repo = mkdtempSync(join(tmpdir(), "kaal-version-"));
    made.push(repo);
    mkdirSync(join(repo, ".kaal/state/core"), { recursive: true });
    writeFileSync(join(repo, ".kaal/state/core/installation.json"), "not JSON");
    const r = spawnSync(process.execPath, [CLI, "version", "--engine", "myKAAL"], { cwd: repo, encoding: "utf8" });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, `kaal-core ${VERSION}\nengine unrecorded\n`);
  });
});

describe("kaal init (core/C19)", () => {
  it("publishes the Engine and Core's record together, the record holding the digest of every file published", () => {
    const repo = repository("kaal-init-");
    const r = spawnSync(process.execPath, [CLI, "init"], { cwd: repo, encoding: "utf8" });
    assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
    const assets: Record<string, { sha256: string; version: string }> = JSON.parse(readFileSync(join(repo, RECORD), "utf8")).assets;
    assert.ok(Object.keys(assets).length > 0);
    for (const [path, entry] of Object.entries(assets)) assert.deepEqual(entry, { sha256: sha(readFileSync(join(repo, path))), version: VERSION }, path);
  });

  it("publishes neither when the publication is refused, into a missing or an empty Engine directory", async () => {
    const { bootstrapWith } = await import(new URL("../dist/bootstrap.js", import.meta.url).href);
    for (const empty of [false, true]) {
      const repo = repository("kaal-init-refused-");
      if (empty) mkdirSync(join(repo, ".kaal"));
      // A record entry that cannot be published beside the payload: a file and a directory at one path.
      await assert.rejects(bootstrapWith(join(repo, ".kaal"), { "AGENTS.md/installation.json": Buffer.from("{}\n") }));
      if (empty) assert.deepEqual(readdirSync(join(repo, ".kaal")), [], "the empty Engine directory stays empty");
      else assert.ok(!existsSync(join(repo, ".kaal")), "no Engine appears");
    }
  });
});
