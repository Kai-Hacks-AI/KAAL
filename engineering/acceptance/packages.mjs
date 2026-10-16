// The packages an acceptance scenario installs: the tarballs the Acceptance
// lane (engineering/lanes/acceptance.mjs) built and packed once for this run,
// before any scenario started. A scenario never builds or packs a package. It
// installs these same bytes into a host of its own, and records what it
// consumed so the lane can verify the run.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { execute } from "kaal-hosting";

const RUN = process.env.KAAL_ACCEPTANCE_RUN;

/** The SHA-256 of a file's bytes. */
export function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** The run's packed tarball of a workspace package, checked to still be the bytes the lane packed. */
export function tarball(name) {
  if (!RUN) throw new Error("acceptance scenarios run through the Acceptance lane: npm run test:acceptance");
  const packed = JSON.parse(readFileSync(join(RUN, "manifest.json"), "utf8"))[name];
  if (!packed) throw new Error(`${name} was not packed for this run`);
  if (sha256(packed.tarball) !== packed.sha256) throw new Error(`${packed.tarball} changed after it was packed`);
  return packed.tarball;
}

/**
 * Installs the run's tarballs of the named packages into host, a directory
 * that must not exist yet, so no two installations share one. offline
 * installs from the tarballs alone; otherwise registry dependencies may come
 * from npm's cache or the registry.
 */
export async function install(host, names, { offline = false } = {}) {
  const tarballs = names.map(tarball);
  const consumed = Object.fromEntries(names.map((name, i) => [name, sha256(tarballs[i])]));
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: "fresh-host", version: "1.0.0", private: true }, null, 2));
  const env = { ...process.env, npm_config_audit: "false", npm_config_fund: "false" };
  const r = await execute("npm", ["install", offline ? "--offline" : "--prefer-offline", "--no-package-lock", ...tarballs], { cwd: host, env });
  if (r.status !== 0) throw new Error(`npm install ${names.join(" ")}\n${r.stderr}`);
  const scenario = basename(process.argv[1] ?? "unknown");
  writeFileSync(join(RUN, "ledger", `${scenario}-${process.pid}-${basename(host)}.json`), JSON.stringify({ scenario, pid: process.pid, host, consumed }));
}
