// Delivered cases: the Code loop for the consumer boundary commands, run under this Node without a shell on fixtures
// created in a scratch directory. An embedded case never makes `boundary` run a resolved copy's `verify`: every
// installation's verification runs all embedded cases, so that would re-enter itself (foundation/C13).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const PACKAGE = join(dirname(fileURLToPath(import.meta.resolve("@kaihacksai/kaal-foundation/sha256"))), "..");
const BIN = join(PACKAGE, "bin", "kaal-foundation.mjs");
const command = (args, { cwd, input } = {}) => spawnSync(process.execPath, [BIN, ...args], { cwd, input, encoding: "utf8" });
const last = (stdout, prefix) => {
  const line = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).at(-1) ?? "";
  return line.startsWith(`${prefix} `) ? JSON.parse(line.slice(prefix.length + 1)) : null;
};
const scratched = (run) => {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-foundation-boundary-"));
  try {
    run(scratch);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
};

test("foundation/T43 [foundation/F22]: check on a list the sha256 command printed is verified, and on a changed file is failed", () => {
  scratched((scratch) => {
    writeFileSync(join(scratch, "a.txt"), "alpha\n");
    const printed = command(["sha256", "a.txt"], { cwd: scratch });
    assert.equal(printed.status, 0, printed.stderr);
    const ok = command(["check"], { cwd: scratch, input: printed.stdout });
    assert.deepEqual([ok.status, last(ok.stdout, "kaal-foundation-check")?.result], [0, "verified"], ok.stdout + ok.stderr);
    writeFileSync(join(scratch, "a.txt"), "changed\n");
    const bad = command(["check"], { cwd: scratch, input: printed.stdout });
    assert.deepEqual([bad.status, last(bad.stdout, "kaal-foundation-check")?.result], [1, "failed"], bad.stdout + bad.stderr);
    assert.equal(sha256(new TextEncoder().encode("alpha\n")), printed.stdout.split("  ")[0]);
  });
});

test("foundation/T44 [foundation/F23]: boundary on a package without the dependency is cannot verify not a consumer, and on a consumer whose declared dependency is not installed is cannot verify unresolved", () => {
  scratched((scratch) => {
    const none = join(scratch, "none");
    const missing = join(scratch, "missing");
    for (const [d, deps] of [[none, {}], [missing, { dependencies: { "@kaihacksai/kaal-foundation": "0.0.0" } }]]) {
      mkdirSync(d);
      writeFileSync(join(d, "package.json"), JSON.stringify({ name: "fixture", version: "1.0.0", ...deps }));
    }
    const a = command(["boundary", none], { cwd: scratch });
    const aj = last(a.stdout, "kaal-foundation-boundary");
    assert.deepEqual([a.status, aj?.result], [2, "cannot verify"], a.stdout + a.stderr);
    assert.ok(aj.causes.some((c) => c.cause === "not a consumer"));
    const b = command(["boundary", missing], { cwd: scratch });
    const bj = last(b.stdout, "kaal-foundation-boundary");
    assert.deepEqual([b.status, bj?.result], [2, "cannot verify"], b.stdout + b.stderr);
    assert.ok(bj.causes.some((c) => c.cause === "unresolved"));
  });
});
