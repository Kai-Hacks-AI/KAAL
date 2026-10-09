// Source adapters: where the bytes of a capability's package come from. An
// adapter only turns a source into offers, which are data: it never executes a
// package's code, and what an offer is (a Skill, an Extension, valid or not) is
// Core's to say, not the adapter's. npm is one source among others, invoked
// here and nowhere else; a package's name, version or metadata is never an
// identity.
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { read, type Files } from "./files.js";

/** What a package offers, as files: its KAAL contribution and, where it has any, its Agent Skill. */
export interface Offer {
  /** Where it was found, for messages only. */
  origin: string;
  /** The name its contribution is placed under: the Agent Skill it realizes, else the package's own name. Placement, never identity. */
  delivery: string;
  kaal: Files;
  skills: Files;
}

/** A package directory as an offer, or nothing if it carries no `kaal/` directory. */
function offerOf(dir: string, name: string): Offer | undefined {
  const kaal = read(join(dir, "kaal"));
  if (!existsSync(join(dir, "kaal")) || Object.keys(kaal).length === 0) return undefined;
  const skills = read(join(dir, "skills"));
  const names = new Set(Object.keys(skills).map((p) => p.split("/")[0]));
  if (names.size > 1) throw new Error(`${dir} realizes more than one Agent Skill; a package realizes exactly one`);
  return { origin: dir, delivery: names.size === 1 ? [...names][0] : name, kaal, skills };
}

/** A local directory: either one package (it has `kaal/`) or a directory of packages. */
export function fromDirectory(dir: string): Offer[] {
  const root = resolve(dir);
  if (!existsSync(root) || !statSync(root).isDirectory()) throw new Error(`source ${dir} is not a directory`);
  const own = offerOf(root, basename(root));
  if (own) return [own];
  return readdirSync(root)
    .sort()
    .map((child) => (statSync(join(root, child)).isDirectory() ? offerOf(join(root, child), child) : undefined))
    .filter((o): o is Offer => o !== undefined);
}

/**
 * npm populating a directory: each spec (a name, a range, a tarball or a
 * folder, as npm reads them) is installed without running any script into a
 * throwaway directory, and the packages asked for are read from there as data.
 * npm resolves package dependencies; this does not. `dispose` removes it all.
 */
export function fromNpm(specs: string[]): { offers: Offer[]; dispose(): void } {
  const scratch = mkdtempSync(join(tmpdir(), "kaal-compose-npm-"));
  const dispose = () => rmSync(scratch, { recursive: true, force: true });
  try {
    writeFileSync(join(scratch, "package.json"), '{"name":"kaal-compose-scratch","private":true}\n');
    const run = spawnSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", ...specs], { cwd: scratch, encoding: "utf8" });
    if (run.status !== 0) throw new Error(`npm could not obtain ${specs.join(", ")}: ${(run.stderr || run.stdout || String(run.error)).trim()}`);
    const asked = Object.keys((JSON.parse(readFileSync(join(scratch, "package.json"), "utf8")) as { dependencies?: Record<string, string> }).dependencies ?? {});
    const offers: Offer[] = [];
    for (const name of asked) {
      const offer = offerOf(join(scratch, "node_modules", name), name.replace(/^@[^/]+\//, ""));
      if (offer) offers.push({ ...offer, origin: `npm:${name}` });
    }
    return { offers, dispose };
  } catch (e) {
    dispose();
    throw e;
  }
}
