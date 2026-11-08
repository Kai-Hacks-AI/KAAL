// Regression Cases for the directory listing and the scratch directory, found in review of the DO
// (hosting/F72, hosting/F73). They sit beside the planned Cases, which stay unedited.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { list, scratch } from "../../../dist/skills/kaal-hosting/scripts/index.js";

describe("hosting/C106: directory listing regressions", () => {
  it("hosting/T134 [hosting/F72]: the order is that of the whole relative path, so a sibling named a.txt precedes the directory a's contents", async () => {
    const root = mkdtempSync(join(tmpdir(), "hosting-order-"));
    for (const path of ["a/z", "a.txt", "a-b/k", "a0"]) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), "x");
    }
    const paths = (await list(root)).map((e) => e.path);
    assert.deepEqual(paths, ["a", "a-b", "a-b/k", "a.txt", "a/z", "a0"]);
    const seen = new Set();
    for (const p of paths) {
      const parent = p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
      assert.ok(parent === "" || seen.has(parent), `${p} is listed before its directory`);
      seen.add(p);
    }
  });

  it("hosting/T135 [hosting/F73]: an error use cannot be modified on is still the one thrown when cleanup also fails", async (t) => {
    if (process.platform === "win32" || process.getuid?.() === 0) return t.skip("needs a host that enforces read-only directories");
    const frozen = Object.freeze(new Error("frozen"));
    let left;
    await assert.rejects(
      scratch(async (dir) => {
        left = dir;
        mkdirSync(join(dir, "locked"));
        writeFileSync(join(dir, "locked", "f"), "f");
        chmodSync(join(dir, "locked"), 0o500);
        throw frozen;
      }),
      (e) => e === frozen,
    );
    chmodSync(join(left, "locked"), 0o700);
    rmSync(left, { recursive: true, force: true });
  });

  it("hosting/T136 [hosting/F72]: a root that exists and is not a directory, a pipe included, is NOT_DIRECTORY, not a raw host error", async (t) => {
    if (process.platform === "win32") return t.skip("no named pipe to make without privilege");
    const root = mkdtempSync(join(tmpdir(), "hosting-pipe-"));
    const pipe = join(root, "pipe");
    if (spawnSync("mkfifo", [pipe]).status !== 0) return t.skip("mkfifo is not available");
    await assert.rejects(list(pipe), (e) => e?.code === "NOT_DIRECTORY");
  });
});
