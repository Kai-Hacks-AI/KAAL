import { Admitted } from "./admitted.js";
import { kind as pathKind, read, update } from "kaal-hosting";
import { evaluate } from "./engine.js";
import { compareRefs, KaalError, type Ref } from "./node.js";
import { foundation, type Files } from "./payload.js";
import { planRegistration, prepareContribution } from "./contribution.js";

export type Kind = "capability" | "agent" | "skill" | "extension";

export { isKind } from "./contribution.js";
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
  const files = prepareContribution(kind, name, contribution);
  if ((await pathKind(dir)) !== "directory") throw new KaalError(`${dir} is not a valid Engine; nothing was written:\n  ${dir} is not an Engine directory`);

  let ids: string[] = [];
  const change = await update(dir, (present) => {
    const plan = planRegistration(present, kind, name, files, dir);
    ids = plan.ids;
    return plan.written ? { prefix: plan.prefix, files: plan.files } : undefined;
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
  const refs = (kind: Kind): Ref[] => admitted.typed(foundation()[kind]).sort(compareRefs);
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
