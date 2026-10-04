// What the packages of this repository deliver, as the files of an installed
// KAAL and of the host's Agent Skills, for the Skills a KAAL has installed.
// Which Skills those are is Core's answer, `installedSkills()`, derived from
// the admitted graph of the installed KAAL; no package layout, name or list
// decides it. The packages only supply bytes: the package that delivers an
// installed Skill is the one carrying a Node with that exact ID. Nothing here
// is authored: Core's payload() is deployed and each delivering package's
// contribution is registered through Core's registerSkill() into a throwaway
// KAAL directory. The installed files are a projection of this, never its
// source.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The repository these helpers belong to: the source of every package. */
export const SOURCE = fileURLToPath(new URL("../../../../", import.meta.url));
/** `.kaal` is only the default name of the KAAL directory. */
export const KAAL_DIR = ".kaal";
/** The host's Agent Skills directory. */
export const HOST_SKILLS = "skills";
/** Genuine installed state: never derived from a package, never touched by installing. */
export const CHANGES = "changes";

export type Files = Record<string, string>;
export interface Ref {
  name: string;
  id: string;
}
type Core = { payload(): Files; registerSkill(kaal: string, capability: string, contribution: Files): string[]; installedSkills(kaal: string): Ref[] };
type Capability = { payload(): { kaal: Files; skills: Files } };
type Found = { id: string; name: string; type?: Ref };
// Node machinery is the one Core's registration uses, reached in the built package and not through its public API.
type Nodes = { candidates(files: Files): Found[]; admit(files: Files): Found[] };

const load = async <T>(...path: string[]): Promise<T> => import(pathToFileURL(join(SOURCE, "packages", ...path)).href);
export const core = await load<Core>("kaal-core", "dist", "index.js");
export const nodes = await load<Nodes>("kaal-core", "dist", "nodes.js");

export interface Delivery {
  /** Files of the KAAL directory, by path within it. */
  kaal: Files;
  /** Files of the host's skills directory, by path within it. */
  skills: Files;
  /** The capabilities delivered, each registered through Core. */
  capabilities: string[];
  /** Installed Skills that no package delivers. */
  unresolved: Ref[];
}

/** Files under a directory, keyed by path relative to it. */
export function read(dir: string): Files {
  const files: Files = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    if (statSync(join(dir, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(dir, path), "utf8");
  }
  return files;
}

interface Package {
  /** The Agent Skills directory the package realizes: the name its contribution registers under. */
  capability: string;
  kaal: Files;
  skills: Files;
  nodes: Found[];
}

/** The packages that deliver a KAAL contribution and its Agent Skills, as their own payload() says. */
async function packages(): Promise<Package[]> {
  const found: Package[] = [];
  for (const dir of readdirSync(join(SOURCE, "packages")).sort()) {
    if (!existsSync(join(SOURCE, "packages", dir, "dist", "index.js"))) continue;
    const mod = await load<Partial<Capability>>(dir, "dist", "index.js");
    const delivered = typeof mod.payload === "function" ? mod.payload() : undefined;
    if (!delivered || typeof delivered.kaal !== "object" || typeof delivered.skills !== "object") continue;
    const names = new Set(Object.keys(delivered.skills).map((p) => p.split("/")[0]));
    if (names.size !== 1) throw new Error(`packages/${dir} realizes exactly one Agent Skill`);
    found.push({ capability: [...names][0], kaal: delivered.kaal, skills: delivered.skills, nodes: nodes.candidates(delivered.kaal) });
  }
  return found;
}

/**
 * What the packages deliver for `target`: for the Skills already installed in
 * its KAAL directory, as Core reports them. Core's payload is always
 * delivered. A Skill enters the installed KAAL by being registered through
 * Core, never by being named here.
 */
export async function delivery(target: string): Promise<Delivery> {
  const dir = join(target, KAAL_DIR);
  const installed = existsSync(dir) ? core.installedSkills(dir) : [];
  const all = await packages();
  const wanted = new Set<Package>();
  const unresolved: Ref[] = [];
  for (const skill of installed) {
    const pkg = all.find((p) => p.nodes.some((n) => n.id === skill.id));
    if (pkg) wanted.add(pkg);
    else unresolved.push(skill);
  }
  const scratch = mkdtempSync(join(tmpdir(), "kaal-delivery-"));
  try {
    const expected = join(scratch, KAAL_DIR);
    for (const [path, content] of Object.entries(core.payload())) {
      mkdirSync(dirname(join(expected, path)), { recursive: true });
      writeFileSync(join(expected, path), content);
    }
    const skills: Files = {};
    const capabilities: string[] = [];
    for (const pkg of [...wanted].sort((a, b) => (a.capability < b.capability ? -1 : 1))) {
      core.registerSkill(expected, pkg.capability, pkg.kaal);
      Object.assign(skills, pkg.skills);
      capabilities.push(pkg.capability);
    }
    return { kaal: read(expected), skills, capabilities, unresolved };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
