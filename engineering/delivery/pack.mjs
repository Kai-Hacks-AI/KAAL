// Delivery for acceptance: which packages exist, packing each exactly once,
// and checking that nothing shared changed while the scenarios ran. This is
// Engineering's part of an acceptance run. Discovering, running and installing
// scenarios, and reading their evidence, are Testing's
// (kaal-testing/acceptance); every host operation is Hosting's.
//
// A run's directory holds packages/ (the tarballs, packed once) and run/
// (Testing's run: its manifest, ledger and hosts).
import { join } from "node:path";
import { execute, initialize, kind, read, readFile } from "kaal-hosting";
import { accept, integrity, sha256 } from "kaal-testing/acceptance";

async function npm(args, cwd) {
  const r = await execute("npm", args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  if (r.status !== 0) throw new Error(`npm ${args.join(" ")} failed in ${cwd} (exited ${r.status})\n${r.stderr}`);
  return r.stdout;
}

/** The delivery workspaces under `root`, as npm lists them: [{ name, location }], absolute locations. */
export async function workspaces(root) {
  return JSON.parse(await npm(["query", ".workspace"], root)).map(({ name, path }) => ({ name, location: path }));
}

/**
 * Pack each of `workspaces` exactly once into `dir`, a missing or empty
 * directory. npm pack runs each package's own prepack, so each is built clean
 * once, before any scenario runs. Resolves to the manifest:
 * { name: { tarball, sha256, integrity } }.
 */
export async function pack(workspaces, dir) {
  await initialize(dir, {});
  const manifest = {};
  for (const { name, location } of workspaces) {
    const [packed] = JSON.parse(await npm(["pack", "--json", "--pack-destination", dir], location));
    const tarball = join(dir, packed.filename);
    const bytes = await readFile(tarball);
    manifest[name] = { tarball, sha256: await sha256(bytes), integrity: await integrity(bytes) };
  }
  return manifest;
}

/** Per workspace, the SHA-256 of each file its build left under dist/, or {} without one. */
export async function builds(workspaces) {
  const out = {};
  for (const { name, location } of workspaces) {
    const dist = join(location, "dist");
    const files = (out[name] = {});
    if ((await kind(dist)) !== "directory") continue;
    for (const [p, bytes] of Object.entries(await read(dist))) files[p] = await sha256(bytes);
  }
  return out;
}

/**
 * Packaging's findings after a run: a tarball that no longer holds the bytes
 * packed for it, and a workspace whose dist/ differs from the build it was
 * packed from. Both are verified failures. A rebuild that reproduces dist/
 * byte for byte is not detected, and changes nothing delivered: every
 * installation is checked against the packed bytes.
 */
export async function packaging(manifest, before, after) {
  const out = [];
  for (const [name, { tarball, sha256: hash }] of Object.entries(manifest)) {
    let now;
    try {
      now = await sha256(await readFile(tarball));
    } catch (e) {
      now = `unreadable: ${e.message}`;
    }
    if (now !== hash) out.push({ kind: "verified failure", subject: tarball, evidence: `the ${name} tarball changed during the run` });
  }
  for (const name of Object.keys(before)) {
    const was = before[name];
    const is = after[name] ?? {};
    const changed = [...new Set([...Object.keys(was), ...Object.keys(is)])].filter((p) => was[p] !== is[p]).sort();
    if (changed.length > 0) out.push({ kind: "verified failure", subject: name, evidence: `dist/ changed during the run: ${changed.join(", ")}` });
  }
  return out;
}

/**
 * One acceptance run of `scenarios` against `workspaces`, in `dir`, a missing
 * or empty directory outside the repository, from `cwd`. Packs once, hands
 * the manifest to Testing's accept(), then adds packaging's findings.
 * `passed` is Testing's evidence-based result and no packaging failure;
 * unknowns stay in the findings and do not decide it.
 */
export async function deliver({ workspaces, scenarios, dir, cwd }) {
  const manifest = await pack(workspaces, join(dir, "packages"));
  const before = await builds(workspaces);
  const result = await accept({ manifest, scenarios, run: join(dir, "run"), cwd });
  const found = [...result.findings, ...(await packaging(manifest, before, await builds(workspaces)))];
  return {
    ...result,
    manifest,
    findings: found,
    passed: result.passed && !found.some((f) => f.kind === "verified failure"),
  };
}
