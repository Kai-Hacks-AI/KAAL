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
/** What an installed Node is registered as. */
export type Kind = "Skill" | "Extension";
type Core = {
  payload(): Files;
  registerSkill(kaal: string, capability: string, contribution: Files): string[];
  installedSkills(kaal: string): Ref[];
  registerExtension(kaal: string, capability: string, contribution: Files): string[];
  installedExtensions(kaal: string): Ref[];
};
type Capability = { payload(): { kaal: Files; skills?: Files } };
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
  /** Installed Skills and Extensions that no package delivers. */
  unresolved: (Ref & { kind: Kind })[];
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
  /** The name its contribution registers under: the Agent Skill the package realizes, or, for a package with none, the package's own directory. */
  capability: string;
  kaal: Files;
  skills: Files;
  nodes: Found[];
}

/**
 * The packages that deliver a KAAL contribution, as their own payload() says,
 * and its Agent Skills where they have any. A package with an Agent Skill
 * realizes exactly one; a package with none (an Extension's) registers under
 * its own directory name.
 */
async function packages(root: string): Promise<Package[]> {
  const found: Package[] = [];
  for (const dir of readdirSync(root).sort()) {
    if (!existsSync(join(root, dir, "dist", "index.js"))) continue;
    const mod = (await import(pathToFileURL(join(root, dir, "dist", "index.js")).href)) as Partial<Capability>;
    const delivered = typeof mod.payload === "function" ? mod.payload() : undefined;
    if (!delivered || typeof delivered.kaal !== "object" || (delivered.skills !== undefined && typeof delivered.skills !== "object")) continue;
    const skills = delivered.skills ?? {};
    const names = new Set(Object.keys(skills).map((p) => p.split("/")[0]));
    if (names.size > 1) throw new Error(`packages/${dir} realizes exactly one Agent Skill`);
    found.push({ capability: names.size === 1 ? [...names][0] : dir, kaal: delivered.kaal, skills, nodes: nodes.candidates(delivered.kaal) });
  }
  return found;
}

/**
 * What the packages deliver for `target`: for the Skills and Extensions
 * already installed in its KAAL directory, as Core reports them. Core's
 * payload is always delivered. A Skill or an Extension enters the installed
 * KAAL by being registered through Core, never by being named here. `root` is
 * where the packages are; this repository's own by default.
 */
export async function delivery(target: string, root: string = join(SOURCE, "packages")): Promise<Delivery> {
  const dir = join(target, KAAL_DIR);
  const installed: (Ref & { kind: Kind })[] = existsSync(dir)
    ? [...core.installedSkills(dir).map((r) => ({ ...r, kind: "Skill" as const })), ...core.installedExtensions(dir).map((r) => ({ ...r, kind: "Extension" as const }))]
    : [];
  const all = await packages(root);
  const wanted = new Map<Package, Kind>();
  const unresolved: (Ref & { kind: Kind })[] = [];
  for (const node of installed) {
    const pkg = all.find((p) => p.nodes.some((n) => n.id === node.id));
    if (!pkg) unresolved.push(node);
    else if (wanted.get(pkg) && wanted.get(pkg) !== node.kind) throw new Error(`packages: ${pkg.capability} is installed as both a Skill and an Extension; a package delivers one kind of contribution, so a capability that needs both is two independently selectable packages`);
    else wanted.set(pkg, node.kind);
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
    for (const [pkg, kind] of [...wanted].sort(([a], [b]) => (a.capability < b.capability ? -1 : 1))) {
      (kind === "Skill" ? core.registerSkill : core.registerExtension)(expected, pkg.capability, pkg.kaal);
      Object.assign(skills, pkg.skills);
      capabilities.push(pkg.capability);
    }
    return { kaal: read(expected), skills, capabilities, unresolved };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
