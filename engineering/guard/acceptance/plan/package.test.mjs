// Guard outer acceptance, Engineering part: the package's own tests. Requirements verification T98 [N6]
// (guard/C76). Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE = join(resolve(HERE, "../../../.."), "packages", "kaal-guard");
const NPM = process.platform === "win32" ? "npm.cmd" : "npm";

describe("guard/N6 [guard/I5] the package's own tests", () => {
  it("guard/T98 [guard/N6]: npm test in packages/kaal-guard exits 0 on Node 24 and runs no file of the retired 0.0.1 suite", () => {
    // An inherited NODE_TEST_CONTEXT makes node --test skip every file and pass, so the run never inherits it.
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const r = spawnSync(NPM, ["test"], { cwd: PACKAGE, env, encoding: "utf8", shell: process.platform === "win32", maxBuffer: 64 * 1024 * 1024 });
    const output = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    /** The last summary count node --test printed for `name` (pass or fail), in either reporter's form. */
    const count = (name) => Number([...output.matchAll(new RegExp(`^(?:ℹ|#) ${name} (\\d+)$`, "gm"))].pop()?.[1]);
    assert.ok(count("pass") > 0, `npm test ran no test:\n${output.slice(-4000)}`);
    // The retired suite fails on 0.0.2 by design, so a run with no failure runs none of its files.
    assert.equal(count("fail"), 0, `npm test failed:\n${output.slice(-4000)}`);
    assert.equal(r.status, 0, `npm test exited ${r.status}:\n${output.slice(-4000)}`);
  });
});
