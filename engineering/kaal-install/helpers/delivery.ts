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
import { createHash } from "node:crypto";
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
  /** Capabilities a delivered Agent Skill declares it needs beside it that the KAAL does not have installed, with the exact Node ID that would select each. */
  unmet: string[];
}

/** Files under a directory, keyed by path relative to it. */
export function read(dir: string): Files {
  const files: Files = {};
  for (const path of readdirSync(dir, { recursive: true, encoding: "utf8" })) {
    if (statSync(join(dir, path)).isFile()) files[path.split("\\").join("/")] = readFileSync(join(dir, path), "utf8");
  }
  return files;
}

export interface Package {
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
export async function packages(root: string): Promise<Package[]> {
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

const sha256 = (bytes: string) => createHash("sha256").update(bytes).digest("hex");
/** The exact IDs of Core's Skill and Extension Nodes: what a Node's type must refer to for it to be one. */
const KIND_ID: Record<Kind, string> = { Skill: sha256(core.payload()["core/Skill.md"]), Extension: sha256(core.payload()["core/Extension.md"]) };

/** The Skill or Extension Nodes a package carries, by what their type refers to in Core and not by name. */
export function contributions(pkg: Package): (Ref & { kind: Kind })[] {
  const out: (Ref & { kind: Kind })[] = [];
  for (const n of pkg.nodes) for (const kind of ["Skill", "Extension"] as const) if (n.type?.id === KIND_ID[kind]) out.push({ name: n.name, id: n.id, kind });
  return out;
}

/** The `compatibility` an Agent Skill declares, in its SKILL.md frontmatter (the Agent Skills standard's free text). */
function compatibility(pkg: Package): string {
  const skill = pkg.skills[`${pkg.capability}/SKILL.md`] ?? "";
  const front = skill.startsWith("---\n") ? skill.slice(4, skill.indexOf("\n---", 4)) : "";
  return front.split("\n").find((l) => l.startsWith("compatibility:"))?.slice("compatibility:".length) ?? "";
}

/**
 * What the packages deliver for `target`: for the Skills and Extensions
 * already installed in its KAAL directory, as Core reports them. Core's
 * payload is always delivered. A Skill or an Extension enters the installed
 * KAAL by being registered through Core, never by being named here. `select`
 * is the one way a Skill or Extension that is not installed yet is chosen: by
 * the exact ID of its Node, never by name; it is registered into the delivery
 * through Core like any other, and Core's admission decides whether it is
 * valid. `root` is where the packages are; this repository's own by default.
 */
export async function delivery(target: string, root: string = join(SOURCE, "packages"), select: string[] = []): Promise<Delivery> {
  const dir = join(target, KAAL_DIR);
  const installed: (Ref & { kind: Kind })[] = existsSync(dir)
    ? [...core.installedSkills(dir).map((r) => ({ ...r, kind: "Skill" as const })), ...core.installedExtensions(dir).map((r) => ({ ...r, kind: "Extension" as const }))]
    : [];
  const all = await packages(root);
  const have = new Set(installed.map((n) => n.id));
  for (const id of select) {
    if (have.has(id)) continue;
    const node = all.flatMap((p) => contributions(p)).find((c) => c.id === id);
    if (!node) {
      const known = all.some((p) => p.nodes.some((n) => n.id === id));
      throw new Error(known ? `select: ${id} is a Node of a package, but not a Skill or Extension Node` : `select: no package carries a Node with the exact ID ${id}`);
    }
    installed.push(node);
    have.add(id);
  }
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
    const unmet: string[] = [];
    for (const pkg of wanted.keys()) {
      const text = compatibility(pkg);
      for (const other of all) {
        if (other === pkg || wanted.has(other) || !new RegExp(`(?<![\\w-])${other.capability}(?![\\w-])`).test(text)) continue;
        const ids = contributions(other).map((c) => `${c.name} ${c.id}`).join(", ");
        unmet.push(`${pkg.capability} declares that it needs ${other.capability} beside it, which is not installed: select its Node by exact ID (${ids || "no Skill or Extension Node"})`);
      }
    }
    return { kaal: read(expected), skills, capabilities, unresolved, unmet };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}
