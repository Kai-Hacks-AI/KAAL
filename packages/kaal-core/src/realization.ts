// Hosting application of Agent Realization (core/A7, core/C13): Core plans and Hosting realizes.
// This module reads the declaration, the present files and every record through Hosting, plans
// with `realize` and `register`, and applies the plan and the records in one guarded
// reconciliation, so a precondition that fails leaves the repository unchanged.
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { kind, read, readFile, reconcile, type Removal, type Write } from "kaal-hosting";
import { declaration, realize, type Contracted, type Digests, type Plan, type SkillSource } from "./agent.js";
import { checkContract, checkRecord, register, type InstallationRecord } from "./installation.js";
import { KaalError } from "./node.js";
import { sha256 } from "./sha256.js";

/** Where Core keeps its own record of the provider deployments it made (core/F18). */
export const record = ".kaal/state/core/installation.json";

/** Every Skill's canonical deployment, the Capability's asset when a contract delivers the Skill (core/F36). */
const CANONICAL = ".agents/skills";

/** Core's version, which its record entries carry, read once through Hosting when Core is loaded. */
const VERSION: string = JSON.parse((await readFile(fileURLToPath(new URL("../package.json", import.meta.url)))).toString("utf8")).version;

export interface RealizationRequest {
  /** The Skills to make reachable, each with its canonical source files. */
  readonly skills: readonly SkillSource[];
  /** The Installation Contracts of the Capabilities that deliver some of these Skills. */
  readonly contracts?: readonly unknown[];
}

export interface Realized {
  /** The plan that was applied, so every outcome can be reported (core/F22). */
  readonly plan: Plan;
  /** Hosting's report: each written, removed or unchanged path, and the directories emptied. */
  readonly outcomes: { path: string; outcome: "written" | "removed" | "unchanged" }[];
  readonly pruned: string[];
  /** The records this realization wrote, Core's own and the contracts', in path order. */
  readonly records: string[];
}

interface Contract {
  readonly version: string;
  readonly assets: readonly { readonly target: string; readonly kind: string; readonly surface?: string }[];
  readonly record: string;
  readonly provides: readonly { readonly skill: string }[];
}

const describe = (findings: { key: string | null; rule: string }[]) => findings.map((f) => `${f.key ?? "(document)"}: ${f.rule}`).join("; ");

/** The bytes at `path` under `root`, or `undefined` when nothing is there. */
async function optional(root: string, path: string): Promise<Buffer | undefined> {
  const what = await kind(join(root, path));
  if (what === "missing") return undefined;
  if (what !== "file") throw new KaalError(`${path} is not a file`);
  return readFile(join(root, path));
}

function parse(path: string, bytes: Buffer): unknown {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new KaalError(`${path} is not JSON`);
  }
}

/** A record read through Hosting, refused unless it conforms (core/F38), or `undefined` when there is none. */
async function readRecord(root: string, path: string): Promise<{ record: InstallationRecord | undefined; expect: string }> {
  const bytes = await optional(root, path);
  if (bytes === undefined) return { record: undefined, expect: "absent" };
  const value = parse(path, bytes);
  const findings = checkRecord(value);
  if (findings.length > 0) throw new KaalError(`${path} is not an installation record: ${describe(findings)}`);
  return { record: value as InstallationRecord, expect: sha256(bytes) };
}

/** The providers the repository declares (core/F16), none when there is no declaration. */
async function providers(root: string): Promise<string[]> {
  const bytes = await optional(root, declaration);
  if (bytes === undefined) return [];
  const value = parse(declaration, bytes) as { providers?: unknown };
  if (!(typeof value === "object" && value !== null && Array.isArray(value.providers) && value.providers.every((p) => typeof p === "string")))
    throw new KaalError(`${declaration} must be { "providers": [<provider>…] }`);
  return value.providers;
}

/**
 * The SHA-256 of what is present at every path the plan can touch: each target, anything under a
 * target that is a directory, each ancestor of a target that is not a directory, and each path a
 * record holds. Something that is not a file is marked so, which no record digest matches.
 */
async function presentAt(root: string, paths: Iterable<string>): Promise<Digests> {
  const present: Record<string, string> = {};
  const look = async (path: string, descend: boolean) => {
    if (path in present) return;
    const what = await kind(join(root, path));
    if (what === "file") present[path] = sha256(await readFile(join(root, path)));
    else if (what === "other") present[path] = "not a file";
    else if (what === "directory" && descend) for (const [p, bytes] of Object.entries(await read(join(root, path)))) present[`${path}/${p}`] = sha256(bytes);
  };
  for (const path of paths) {
    const segments = path.split("/");
    for (let i = 1; i < segments.length; i++) await look(segments.slice(0, i).join("/"), false);
    await look(path, true);
  }
  return present;
}

/**
 * Make `skills` reachable by the agents of the providers `root` declares, through Hosting
 * (core/A7, core/F16–core/F22, core/F33–core/F37). A Skill a contract delivers is that
 * Capability's at its canonical location: Core writes it only when the Capability's record does
 * not register it yet, and registers what it wrote in that record. Core's own record holds only
 * the provider deployments. The deployments, removals and records are applied together, each
 * guarded by what was read; if anything changed in between, nothing is changed.
 */
export async function realizeIn(root: string, { skills, contracts = [] }: RealizationRequest): Promise<Realized> {
  if ((await kind(root)) !== "directory") throw new KaalError(`${root} is not a directory`);
  const names = new Set(skills.map((s) => s.name));

  const delivered: { contract: Contract; skills: string[]; record: InstallationRecord | undefined; expect: string }[] = [];
  const contracted: Contracted[] = [];
  for (const [i, value] of contracts.entries()) {
    const findings = checkContract(value);
    if (findings.length > 0) throw new KaalError(`contract ${i} does not conform: ${describe(findings)}`);
    const contract = value as Contract;
    const existing = await readRecord(root, contract.record);
    const provided = contract.provides.map((p) => p.skill);
    for (const skill of provided) {
      if (!names.has(skill)) throw new KaalError(`contract ${i} delivers ${skill}, which is not among the Skills to install`);
      if (contracted.some((c) => c.skill === skill)) throw new KaalError(`${skill} is delivered by more than one contract`);
      const target = `${CANONICAL}/${skill}`;
      if (!contract.assets.some((a) => a.target === target && a.kind === "directory" && a.surface === undefined))
        throw new KaalError(`contract ${i} delivers ${skill} but has no directory asset at ${target}`);
      const registered = Object.keys(existing.record?.assets ?? {}).some((p) => p.startsWith(`${target}/`));
      contracted.push({ skill, registered });
    }
    delivered.push({ contract, skills: provided, ...existing });
  }

  const own = await readRecord(root, record);
  const recorded: Digests = Object.fromEntries(Object.entries(own.record?.assets ?? {}).map(([p, e]) => [p, e.sha256]));
  const declared = await providers(root);
  // Every target a realization can name: those it would write into an empty repository.
  const targets = realize({ skills, providers: declared, record: {}, present: {}, contracted }).write.map((w) => w.path);
  const present = await presentAt(root, [...targets, ...Object.keys(recorded)]);
  const plan = realize({ skills, providers: declared, record: recorded, present, contracted });

  const write: Write[] = plan.write.map((w) => ({ path: w.path, expect: present[w.path] ?? "absent", bytes: w.bytes }));
  const remove: Removal[] = plan.prune.map((path) => ({ path, expect: present[path] }));
  const records: string[] = [];
  const json = (value: unknown) => new TextEncoder().encode(`${JSON.stringify(value, null, 2)}\n`);

  for (const d of delivered) {
    const written = Object.fromEntries(
      plan.write.filter((w) => d.skills.some((s) => w.path.startsWith(`${CANONICAL}/${s}/`))).map((w) => [w.path, sha256(w.bytes)]),
    );
    if (Object.keys(written).length === 0) continue;
    write.push({ path: d.contract.record, expect: d.expect, bytes: json(register({ contract: d.contract, record: d.record, written })) });
    records.push(d.contract.record);
  }

  const kept = new Set(plan.keep.map((k) => k.path));
  const assets = Object.fromEntries(
    Object.entries(plan.record).map(([path, digest]) => {
      const before = own.record?.assets[path];
      return [path, kept.has(path) && before !== undefined ? before : { sha256: digest, version: VERSION }];
    }),
  );
  const next = own.record === undefined ? { assets } : { ...own.record, assets };
  if (JSON.stringify(next) !== JSON.stringify(own.record) && !(own.record === undefined && Object.keys(assets).length === 0)) {
    write.push({ path: record, expect: own.expect, bytes: json(next) });
    records.push(record);
  }

  const done = await reconcile(root, { write, remove });
  return { plan, outcomes: done.outcomes, pruned: done.pruned, records: records.sort() };
}
