// Writes kaal-guard's shipped verification manifest, packages/kaal-guard/test/verify.json (guard/A18):
// the inventory of the delivered outer acceptance cases, as a run of them names them, and the SHA-256
// of every file npm packs except the manifest itself. Run it after any Change to a shipped file, from
// the repository root: node engineering/guard/verify-manifest.mjs. guard/T101 is cannot verify until
// the manifest matches the package.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execute, files, MANIFEST, PACKAGE } from "../../packages/kaal-guard/test/verify.mjs";

const WINDOWS = process.platform === "win32";

delete process.env.NODE_TEST_CONTEXT;

const pack = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE, encoding: "utf8", shell: WINDOWS, maxBuffer: 64 * 1024 * 1024 });
if (pack.status !== 0) throw new Error(`npm pack --dry-run failed: ${pack.stderr}`);
const shipped = JSON.parse(pack.stdout)[0].files.map((f) => f.path).filter((f) => f !== MANIFEST).sort();
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const caseFiles = files(join(PACKAGE, "test", "acceptance")).filter((f) => f.endsWith(".test.mjs")).map((f) => join(PACKAGE, "test", "acceptance", f));
const outcomes = await execute(caseFiles);
const failed = outcomes.filter((o) => o.status !== "passed");
if (failed.length) throw new Error(`the delivered cases must all pass before their inventory is written: ${failed.map((o) => `${o.status}: ${o.name}`).join("; ")}`);

const manifest = {
  cases: outcomes.map((o) => o.name).sort(),
  files: Object.fromEntries(shipped.map((f) => [f, sha256(readFileSync(join(PACKAGE, f)))])),
};
writeFileSync(join(PACKAGE, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${MANIFEST}: ${manifest.cases.length} cases, ${shipped.length} files`);
