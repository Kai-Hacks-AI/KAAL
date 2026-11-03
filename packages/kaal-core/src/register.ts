import { Admitted } from "./admitted.js";
import { kind as pathKind, read, update } from "kaal-hosting";
import { check } from "./bootstrap.js";
import { evaluate } from "./engine.js";
import { claimsForm, compareRefs, KaalError, readNode, type Ref } from "./node.js";
import { foundation, type Files } from "./payload.js";

export type Kind = "capability" | "agent" | "skill" | "extension";

/** The four CASE kinds, one row each: where a contribution of the kind is registered, and how it is named. */
const KINDS: Record<Kind, { dir: string; article: string }> = {
  capability: { dir: "capabilities", article: "a" },
  agent: { dir: "agents", article: "an" },
  skill: { dir: "skills", article: "a" },
  extension: { dir: "extensions", article: "an" },
};
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Core's own Node of a kind: a Node typed by it is of that kind. */
function anchor(kind: Kind): Ref {
  return foundation()[kind];
}

/** Whether a value names one of the four kinds. */
export function isKind(value: string): value is Kind {
  return Object.hasOwn(KINDS, value);
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
  /** The ids of the contribution's Nodes of its kind: those typed by Core's Node of that kind, such as KAAL Skill. */
  ids: string[];
  /** False when the identical contribution was already registered and nothing was written. */
  written: boolean;
}

/**
 * Register a capability's contribution with an Engine. Core decides and
 * Hosting publishes: under Hosting's lock, every check runs on the Engine as
 * it is and as it would be with the contribution, before anything is
 * written, and any failure refuses the whole contribution and writes nothing.
 * Hosting then publishes the contribution as `<capabilities|agents|skills|extensions>/<name>/`
 * all or nothing, refusing paths that are not portable to every supported
 * host (case or Unicode collisions, names Windows cannot hold).
 *
 * A contribution is valid when: it is named in lowercase letters,
 * digits and single hyphens; it carries at least one file and every file is a
 * Node in Form at a relative `.md` path; every Node declares a type that
 * resolves, by id with the name checked, against the Engine and the
 * contribution together; at least one Node is typed by Core's own Node of this
 * kind (KAAL Capability, KAAL Agent, KAAL Skill or KAAL Extension), and none by
 * the other three; and the Engine itself verifies as a whole (see `verify`).
 * Registering the identical contribution again is a no-op; a name already
 * registered for the kind with other content is refused.
 */
export async function register(dir: string, kind: Kind, name: string, contribution: Record<string, string | Uint8Array>): Promise<Registration> {
  if (!isKind(kind)) throw new KaalError(`${kind} is not a kind: capability, agent, skill or extension`);
  if (!NAME.test(name)) throw new KaalError(`${name} is not a contribution name: lowercase letters, digits and single hyphens`);
  const files = toFiles(contribution);
  const paths = Object.keys(files).sort();
  if (paths.length === 0) throw new KaalError("a contribution carries at least one Node");
  for (const path of paths) checkPath(path);
  for (const path of paths) {
    if (!claimsForm(files[path])) throw new KaalError(`${path} is not a Node: a contribution is Nodes and nothing else`);
    try {
      readNode(files[path]);
    } catch (e) {
      throw new KaalError(`${path}: ${(e as Error).message}`);
    }
  }
  if ((await pathKind(dir)) !== "directory") throw new KaalError(`${dir} is not a valid Engine; nothing was written:\n  ${dir} is not an Engine directory`);

  const prefix = `${KINDS[kind].dir}/${name}`;
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
    const nodes = paths.map((p) => ({ path: p, ...readNode(files[p]) }));
    for (const n of nodes) {
      if (!n.type) throw new KaalError(`${n.path} declares no type: only the genesis Node does`);
      if (!admitted.has(n.id)) {
        const why = combined.rejected.find((r) => r.path === `${prefix}/${n.path}`)?.reason ?? "not admitted";
        throw new KaalError(`${n.path} is not admitted: ${why}`);
      }
    }
    const own = anchor(kind);
    const { article } = KINDS[kind];
    const typed = nodes.filter((n) => n.type?.id === own.id);
    if (typed.length === 0) throw new KaalError(`${article} ${kind} contribution carries at least one Node typed by ${own.name} (${own.id})`);
    for (const other of (Object.keys(KINDS) as Kind[]).filter((k) => k !== kind).map(anchor)) {
      const crossed = nodes.find((n) => n.type?.id === other.id);
      if (crossed) throw new KaalError(`${crossed.path} is typed by ${other.name}: ${article} ${kind} contribution carries no ${other.name}`);
    }

    // The Engine verified before; a typed artifact the contribution leaves unknown would make it fail (core/F32).
    const unknown = combined.artifacts.find((a) => a.state === "unknown");
    if (unknown) throw new KaalError(`${prefix}/ would leave ${unknown.path} with an unknown Type: ${unknown.findings.map((f) => f.rule).join("; ")}; nothing was written`);

    ids = [...new Set(typed.map((n) => n.id))].sort();
    return registered ? undefined : { prefix, files: Object.fromEntries(paths.map((p) => [p, files[p]])) };
  });
  return { ids, written: change !== undefined };
}

export function registerSkill(dir: string, name: string, contribution: Record<string, string | Uint8Array>): Promise<Registration> {
  return register(dir, "skill", name, contribution);
}

export function registerExtension(dir: string, name: string, contribution: Record<string, string | Uint8Array>): Promise<Registration> {
  return register(dir, "extension", name, contribution);
}

/** Read a contribution from a source directory: every file, keyed by `/`-separated relative path. */
export async function readContribution(source: string): Promise<Files> {
  if ((await pathKind(source)) !== "directory") throw new KaalError(`${source} is not a directory`);
  return read(source);
}

export interface Catalog {
  capabilities: Ref[];
  agents: Ref[];
  skills: Ref[];
  extensions: Ref[];
}

/**
 * The Capabilities, Agents, Skills and Extensions an Engine holds: its
 * admitted Nodes typed, by name and id, by Core's KAAL Capability, KAAL Agent,
 * KAAL Skill and KAAL Extension Nodes. Found by type alone; no registry, path
 * or layout is consulted.
 */
export async function catalog(dir: string): Promise<Catalog> {
  const admitted = new Admitted(evaluate(await read(dir)).nodes);
  const refs = (kind: Kind): Ref[] => admitted.typed(anchor(kind)).sort(compareRefs);
  return { capabilities: refs("capability"), agents: refs("agent"), skills: refs("skill"), extensions: refs("extension") };
}

export interface Capabilities {
  skills: Ref[];
  extensions: Ref[];
}

/** @deprecated Use `catalog`, which also lists Capabilities and Agents. The Skills and Extensions an Engine holds. */
export async function capabilities(dir: string): Promise<Capabilities> {
  const { skills, extensions } = await catalog(dir);
  return { skills, extensions };
}
