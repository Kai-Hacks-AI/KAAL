// The Acceptance test lane: Engineering -> Package -> Embed.
//
// Packs every delivery workspace exactly once, before any scenario runs, into
// a run directory outside this repository, then hands the manifest to
// Testing, which runs the scenarios in parallel, each installing those same
// tarballs into hosts of its own. Each capability's scenarios live in its own
// workspace under test/acceptance/, where Testing finds them. The scenarios
// still under engineering/acceptance/ run too, until their capabilities hold
// them. After the run, packaging checks that no tarball and no package's dist/
// changed. The lane fails on any verified failure and prints every finding;
// unknowns are reported, never passed and never failed.
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { kind, read } from "@kaihacksai/kaal-hosting";
import { discover } from "kaal-testing/acceptance";
import { deliver, workspaces } from "../delivery/pack.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LEGACY = join(REPO, "engineering", "acceptance");

const delivered = await workspaces(REPO);
const scenarios = (await discover(delivered)).map((s) => s.path);
if ((await kind(LEGACY)) === "directory") {
  for (const f of Object.keys(await read(LEGACY)).sort()) if (!f.includes("/") && f.endsWith(".test.mjs")) scenarios.push(join(LEGACY, f));
}

const dir = join(tmpdir(), `kaal-acceptance-${Date.now()}-${process.pid}`);
const result = await deliver({ workspaces: delivered, scenarios, dir, cwd: REPO });
process.stdout.write(result.runner.stdout);
process.stderr.write(result.runner.stderr);

for (const { kind: k, subject, evidence } of result.findings) console.error(`acceptance: ${k}: ${subject}: ${evidence}`);
const hosts = new Set(result.records.map((r) => r.host)).size;
const processes = new Set(result.records.map((r) => r.pid)).size;
console.log(
  `acceptance: ${result.passed ? "passed" : "failed"}; packed ${Object.keys(result.manifest).length} packages once; ${scenarios.length} scenarios in ${processes} processes made ${result.records.length} installations into ${hosts} hosts`,
);
process.exit(result.passed ? 0 : 1);
