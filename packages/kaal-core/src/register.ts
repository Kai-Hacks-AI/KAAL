import { kind as pathKind, read, update } from "kaal-hosting";
import { check } from "./bootstrap.js";
import { evaluate } from "./engine.js";
import { claimsForm, compareRefs, identify, KaalError, type Ref } from "./node.js";
import { foundation, type Files } from "./payload.js";

export type Kind = "skill" | "extension";

const DIRS: Record<Kind, string> = { skill: "skills", extension: "extensions" };
const CAPABILITY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function article(kind: Kind): string {
  return kind === "skill" ? "a" : "an";
}

function anchor(kind: Kind): Ref {
  return kind === "skill" ? foundation().skill : foundation().extension;
}

/** Normalize contribution input to bytes. */
function toFiles(contribution: Record<string, string | Uint8Array>): Files {
  return Object.fromEntries(Object.entries(contribution).map(([p, b]) => [p, Buffer.from(b as Uint8Array)]));
}

function checkPath(path: string): void {
  if (path.startsWith("/") || path.includes("\\") || path.split("/").some((s) => s === "" || s === "." || s === ".."))
    throw new KaalError(`${path} is not a path within the capability`);
  if (!path.endsWith(".md")) throw new KaalError(`${path} is not a Markdown file: a contribution is Nodes and nothing else`);
}

export interface Registration {
  /** The ids of the contribution's Skills (or Extensions): its Nodes typed by Core's KAAL Skill (or KAAL Extension). */
  ids: string[];
  /** False when the identical contribution was already registered and nothing was written. */
  written: boolean;
}

/**
 * Register a capability's contribution with an Engine. Core decides and
 * Hosting publishes: under Hosting's lock, every check runs on the Engine as
 * it is and as it would be with the contribution, before anything is
 * written, and any failure refuses the whole contribution and writes nothing.
 * Hosting then publishes the contribution as `<skills|extensions>/<capability>/`
 * all or nothing, refusing paths that are not portable to every supported
 * host (case or Unicode collisions, names Windows cannot hold).
 *
 * A contribution is valid when: the capability is named in lowercase letters,
 * digits and single hyphens; it carries at least one file and every file is a
 * Node in Form at a relative `.md` path; every Node declares a type that
 * resolves, by id with the name checked, against the Engine and the
 * contribution together; at least one Node is typed by Core's own Node of this
 * kind, and none by the other kind; and the Engine itself verifies as a
 * whole (see `verify`). Registering the identical contribution again is a no-op; a
 * capability already registered with other content is refused.
 */
export async function register(dir: string, kind: Kind, capability: string, contribution: Record<string, string | Uint8Array>): Promise<Registration> {
  if (!CAPABILITY.test(capability)) throw new KaalError(`${capability} is not a capability name: lowercase letters, digits and single hyphens`);
  const files = toFiles(contribution);
  const paths = Object.keys(files).sort();
  if (paths.length === 0) throw new KaalError("a contribution carries at least one Node");
  for (const path of paths) checkPath(path);
  for (const path of paths) {
    if (!claimsForm(files[path])) throw new KaalError(`${path} is not a Node: a contribution is Nodes and nothing else`);
    try {
      identify(files[path]);
    } catch (e) {
      throw new KaalError(`${path}: ${(e as Error).message}`);
    }
  }
  if ((await pathKind(dir)) !== "directory") throw new KaalError(`${dir} is not a valid Engine; nothing was written:\n  ${dir} is not an Engine directory`);

  const prefix = `${DIRS[kind]}/${capability}`;
  let ids: string[] = [];
  const change = await update(dir, (present) => {
    const base = check(present);
    if (!base.ok) throw new KaalError(`${dir} is not a valid Engine; nothing was written:\n  ${base.problems.join("\n  ")}`);

    const existing = Object.keys(present).filter((p) => p.startsWith(`${prefix}/`));
    const registered = existing.length > 0;
    if (registered) {
      const same = existing.length === paths.length && paths.every((p) => present[`${prefix}/${p}`]?.equals(files[p]));
      if (!same) throw new KaalError(`${prefix}/ is already registered with other content: nothing was written`);
    }

    const combined = evaluate({ ...present, ...Object.fromEntries(paths.map((p) => [`${prefix}/${p}`, files[p]])) });
    const admitted = new Set(combined.nodes.map((n) => n.id));
    const nodes = paths.map((p) => ({ path: p, ...identify(files[p]) }));
    for (const n of nodes) {
      if (!n.type) throw new KaalError(`${n.path} declares no type: only the genesis Node does`);
      if (!admitted.has(n.id)) {
        const why = combined.rejected.find((r) => r.path === `${prefix}/${n.path}`)?.reason ?? "not admitted";
        throw new KaalError(`${n.path} is not admitted: ${why}`);
      }
    }
    const own = anchor(kind);
    const other = anchor(kind === "skill" ? "extension" : "skill");
    const typed = nodes.filter((n) => n.type?.id === own.id);
    if (typed.length === 0) throw new KaalError(`${article(kind)} ${kind} contribution carries at least one Node typed by ${own.name} (${own.id})`);
    const crossed = nodes.find((n) => n.type?.id === other.id);
    if (crossed) throw new KaalError(`${crossed.path} is typed by ${other.name}: ${article(kind)} ${kind} contribution carries no ${other.name}`);

    ids = [...new Set(typed.map((n) => n.id))].sort();
    return registered ? undefined : { prefix, files: Object.fromEntries(paths.map((p) => [p, files[p]])) };
  });
  return { ids, written: change !== undefined };
}

export function registerSkill(dir: string, capability: string, contribution: Record<string, string | Uint8Array>): Promise<Registration> {
  return register(dir, "skill", capability, contribution);
}

export function registerExtension(dir: string, capability: string, contribution: Record<string, string | Uint8Array>): Promise<Registration> {
  return register(dir, "extension", capability, contribution);
}

/** Read a contribution from a source directory: every file, keyed by `/`-separated relative path. */
export async function readContribution(source: string): Promise<Files> {
  if ((await pathKind(source)) !== "directory") throw new KaalError(`${source} is not a directory`);
  return read(source);
}

export interface Capabilities {
  skills: Ref[];
  extensions: Ref[];
}

/**
 * The capabilities an Engine holds: its admitted Nodes typed, by name and id,
 * by Core's KAAL Skill and KAAL Extension Nodes. Found by type alone; no
 * registry, path or layout is consulted.
 */
export async function capabilities(dir: string): Promise<Capabilities> {
  const engine = evaluate(await read(dir));
  const refs = (ref: Ref): Ref[] => engine.typedBy(ref).map(({ name, id }) => ({ name, id })).sort(compareRefs);
  return { skills: refs(foundation().skill), extensions: refs(foundation().extension) };
}
