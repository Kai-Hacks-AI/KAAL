// The Acceptance test lane: Engineering -> Package -> Embed.
//
// Builds and packs every workspace package exactly once, before any scenario
// runs, into a run directory outside this repository, and makes each tarball
// read-only. A package joins by being a workspace; a scenario joins by being a
// *.test.mjs file in engineering/acceptance. The scenarios then run in
// parallel, each installing those same tarballs into hosts of its own
// (engineering/acceptance/packages.mjs). After them the lane verifies the run:
// every installation consumed exactly the packed bytes, no two installations
// shared a host, the tarballs are unchanged, and no package was rebuilt while
// the scenarios ran. Commands run through Hosting, which owns how the host
// realizes them.
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";
import { sha256 } from "../acceptance/packages.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ACCEPTANCE = join(REPO, "engineering", "acceptance");

async function npm(args, cwd) {
  const r = await execute("npm", args, { cwd });
  if (r.status !== 0) {
    process.stderr.write(r.stderr);
    process.exit(r.status);
  }
  return r.stdout;
}

/** Per workspace, each file under its dist/ with its size and modification time. */
function builds(workspaces) {
  const out = {};
  for (const { name, path } of workspaces) {
    const files = (out[name] = {});
    const dist = join(path, "dist");
    if (!existsSync(dist)) continue;
    for (const p of readdirSync(dist, { recursive: true, encoding: "utf8" }).sort()) {
      const s = statSync(join(dist, p));
      if (s.isFile()) files[p] = `${s.size}:${s.mtimeMs}`;
    }
  }
  return out;
}

const run = mkdtempSync(join(tmpdir(), "kaal-acceptance-run-"));
const packages = join(run, "packages");
mkdirSync(packages);
mkdirSync(join(run, "ledger"));

const workspaces = JSON.parse(await npm(["query", ".workspace"], REPO));
const manifest = {};
for (const { name, path } of workspaces) {
  // npm pack runs the package's own prepack, which builds it clean.
  const [packed] = JSON.parse(await npm(["pack", "--json", "--pack-destination", packages], path));
  const tarball = join(packages, packed.filename);
  chmodSync(tarball, 0o444);
  const integrity = `sha512-${createHash("sha512").update(readFileSync(tarball)).digest("base64")}`;
  manifest[name] = { tarball, sha256: sha256(tarball), integrity };
}
writeFileSync(join(run, "manifest.json"), JSON.stringify(manifest, null, 2));
const built = builds(workspaces);

const scenarios = readdirSync(ACCEPTANCE).filter((f) => f.endsWith(".test.mjs")).sort();
const tested = await execute(process.execPath, ["--test", ...scenarios.map((f) => join(ACCEPTANCE, f))], {
  cwd: REPO,
  env: { ...process.env, KAAL_ACCEPTANCE_RUN: run },
});
process.stdout.write(tested.stdout);
process.stderr.write(tested.stderr);

const problems = [];
const records = readdirSync(join(run, "ledger")).map((f) => JSON.parse(readFileSync(join(run, "ledger", f), "utf8")));
for (const { scenario, host, consumed } of records) {
  for (const [name, hash] of Object.entries(consumed)) {
    if (hash !== manifest[name].sha256) problems.push(`${scenario} installed ${name} with bytes other than the packed tarball`);
  }
  if (!relative(REPO, host).startsWith("..")) problems.push(`${scenario} installed into ${host}, inside the repository`);
  // npm's own record of what the host holds at the end of the run: every
  // workspace package there must carry the packed tarball's integrity,
  // however it got there. This covers recorded hosts only; an installation a
  // scenario makes elsewhere, without install(), is not proven absent.
  const holds = JSON.parse(readFileSync(join(host, "node_modules", ".package-lock.json"), "utf8")).packages;
  for (const [at, { name = at.split("node_modules/").pop(), resolved, integrity }] of Object.entries(holds)) {
    if (manifest[name] && integrity !== manifest[name].integrity) problems.push(`${scenario} holds ${name} in ${host} from ${resolved}, not the packed tarball`);
  }
}
const hosts = records.map((r) => r.host);
for (const host of new Set(hosts)) {
  if (hosts.filter((h) => h === host).length > 1) problems.push(`more than one installation shared ${host}`);
}
for (const scenario of scenarios) {
  if (!records.some((r) => r.scenario === scenario)) problems.push(`${scenario} installed no packed package`);
}
for (const [name, { tarball, sha256: hash }] of Object.entries(manifest)) {
  if (sha256(tarball) !== hash) problems.push(`the ${name} tarball changed during the run`);
}
const after = builds(workspaces);
for (const { name } of workspaces) {
  if (JSON.stringify(built[name]) !== JSON.stringify(after[name])) problems.push(`${name} was rebuilt during the run`);
}

for (const p of problems) console.error(`acceptance: ${p}`);
if (problems.length === 0) {
  const processes = new Set(records.map((r) => r.pid)).size;
  console.log(
    `acceptance: packed ${Object.keys(manifest).length} packages once; ${scenarios.length} scenarios in ${processes} processes made ${records.length} installations into distinct hosts from the identical tarballs; nothing was rebuilt during the run`,
  );
}
process.exit(tested.status !== 0 ? tested.status : problems.length ? 1 : 0);
