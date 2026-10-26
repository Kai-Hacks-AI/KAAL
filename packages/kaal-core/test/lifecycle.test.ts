// core/C19 Code tests for the `kaal` lifecycle commands, beyond the planned core/T43–core/T47.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";

const CLI = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

const made: string[] = [];
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
