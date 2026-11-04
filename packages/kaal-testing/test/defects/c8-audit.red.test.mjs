// RED Case for the Defect in plan/defects/c8-transitive-audit.md: the tree a
// consumer gets by installing kaal-testing has no moderate-or-worse advisory.
// Not part of `npm test` until the fix Change turns it GREEN. Needs the npm
// registry (install and audit).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

it("the installed kaal-testing tree has no moderate-or-worse npm audit finding", { timeout: 300000 }, () => {
  const root = new URL("../../../../", import.meta.url).pathname;
  const dir = mkdtempSync(join(tmpdir(), "kaal-testing-audit-"));
  try {
    run("npm", ["run", "build", "-w", "kaal-hosting"], root);
    for (const w of ["kaal-hosting", "kaal-testing"]) {
      run("npm", ["pack", "-w", w, "--pack-destination", dir], root);
    }
    writeFileSync(join(dir, "package.json"), '{"name":"consumer","version":"1.0.0","private":true}');
    run("npm", ["install", "--no-audit", "--no-fund", join(dir, "kaal-hosting-0.0.1.tgz"), join(dir, "kaal-testing-0.0.1.tgz")], dir);
    let out;
    try {
      out = run("npm", ["audit", "--json"], dir);
    } catch (e) {
      out = e.stdout; // npm audit exits non-zero when it finds anything
    }
    const { vulnerabilities } = JSON.parse(out);
    const found = Object.entries(vulnerabilities).filter(([, v]) => ["moderate", "high", "critical"].includes(v.severity)).map(([n, v]) => `${n}:${v.severity}`);
    assert.deepEqual(found, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
