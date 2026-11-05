// Permanent regression guard for the Defect in plan/defects/c8-transitive-audit.md
// (answered by making c8 an optional peer): the tree a consumer gets by
// installing kaal-testing has no moderate-or-worse npm advisory, and without c8
// installed coverage is unknown, never measured. It packs kaal-hosting and
// kaal-testing, installs them into an empty project and audits that project, so
// it needs the npm registry. It also fails if a new advisory reaches the
// installed tree later, which is the point.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { it } from "node:test";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const win = process.platform === "win32";
const run = (args, cwd, input) => execFileSync("npm", args, { cwd, encoding: "utf8", shell: win, stdio: ["ignore", "pipe", "pipe"], ...(input ?? {}) });

it("the installed kaal-testing tree has no moderate-or-worse npm audit finding and no c8", { timeout: 300000 }, () => {
  const dir = mkdtempSync(join(tmpdir(), "kaal-testing-audit-"));
  try {
    const packed = ["kaal-hosting", "kaal-testing"].map((w) => {
      const [{ filename }] = JSON.parse(run(["pack", "-w", w, "--json", "--pack-destination", dir], root));
      return join(dir, filename);
    });
    writeFileSync(join(dir, "package.json"), '{"name":"consumer","version":"1.0.0","private":true,"type":"module"}');
    run(["install", "--no-audit", "--no-fund", ...packed], dir);
    let listed;
    try {
      listed = run(["ls", "c8", "--json"], dir);
    } catch (e) {
      listed = e.stdout; // npm ls exits non-zero when it finds nothing
    }
    assert.equal(JSON.parse(listed).dependencies?.["kaal-testing"]?.dependencies?.c8, undefined, "c8 is not installed with kaal-testing");
    let out;
    try {
      out = run(["audit", "--json"], dir);
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
