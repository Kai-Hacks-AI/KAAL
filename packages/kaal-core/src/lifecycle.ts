// Core's own lifecycle (core/C18, core/C19): Core is realized by an Installation Contract of its
// own, in the format it owns, and follows that format's rules for its own files (core/I12,
// core/I13). Core decides each step purely from what it read; Hosting applies it in one guarded
// reconciliation, so a step that is refused, or finds anything changed since it read, changes
// nothing (core/N12). Every step acts on the Engine at `./.kaal` of `root` (core/F46).
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { kind, read, readFile, reconcile, type Expectation, type Reconciliation, type Removal, type Write } from "kaal-hosting";
import { bootstrapWith, check } from "./bootstrap.js";
import { checkContract, register, type InstallationRecord, type RecordEntry } from "./installation.js";
import { KaalError } from "./node.js";
import { payload } from "./payload.js";
import { record as RECORD } from "./realization.js";
import { readRecord } from "./records.js";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

/** The Engine directory Core's contract installs into, relative to the repository root. */
export const ENGINE = ".kaal";

interface CoreContract {
  readonly version: string;
  readonly assets: readonly { readonly source: string; readonly target: string }[];
  readonly catalogue: { readonly [target: string]: readonly string[] };
  readonly record: string;
}

/** Core's own Installation Contract, delivered beside the payload and read once through Hosting (core/F42, core/A20). */
const CONTRACT: CoreContract = JSON.parse((await readFile(fileURLToPath(new URL("../installation.kaal.json", import.meta.url)))).toString("utf8"));
{
  const findings = checkContract(CONTRACT);
  if (findings.length > 0) throw new Error(`kaal-core's installation.kaal.json does not conform: ${findings.map((f) => `${f.key}: ${f.rule}`).join("; ")}`);
  if (CONTRACT.record !== RECORD) throw new Error(`kaal-core's installation.kaal.json names ${CONTRACT.record}, not Core's record ${RECORD}`);
}

/** Each target of Core's contract, with the bytes the payload carries for it. */
function targets(): Map<string, Buffer> {
  const carried = payload();
  return new Map(CONTRACT.assets.map((a) => [a.target, carried[a.source.slice("payload/".length)]]));
}

/** The kaal-core version that runs: the version of Core's contract. */
export const CORE_VERSION = CONTRACT.version;

const json = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const isEngine = (path: string) => path.startsWith(`${ENGINE}/`);

/** What is at each path under `root`: its SHA-256, `"not a file"`, or nothing when it is absent. An Engine path is taken from `engine`, a snapshot of the Engine, when one is given. */
async function presentAt(root: string, paths: Iterable<string>, engine?: Record<string, Buffer>): Promise<Record<string, string>> {
  const present: Record<string, string> = {};
  for (const path of new Set(paths)) {
    const snapshot = engine !== undefined && isEngine(path) ? engine[path.slice(ENGINE.length + 1)] : undefined;
    if (snapshot !== undefined) {
      present[path] = sha256(snapshot);
      continue;
    }
    // A file the snapshot does not hold was absent when it was taken; a write expecting "absent" refuses it if it appeared since.
    const what = await kind(join(root, path));
    if (what === "file") {
      if (engine === undefined) present[path] = sha256(await readFile(join(root, path)));
    } else if (what !== "missing") present[path] = "not a file";
  }
  return present;
}

/** The Engine's files as they are, keyed relative to the Engine, or none when it is absent. */
async function engineFiles(root: string): Promise<Record<string, Buffer>> {
  return (await kind(join(root, ENGINE))) === "directory" ? await read(join(root, ENGINE)) : {};
}

/** A file a step keeps rather than take, and why (core/I5). */
export interface Kept {
  readonly path: string;
  readonly reason: string;
}

/**
 * Bootstrap the Engine at `./.kaal` of `root` with Core's record in the same Hosting `initialize`
 * (core/F43, core/N12): every payload file is registered with the contract's version and the
 * digest of the bytes published, and the Engine and its record appear together or not at all.
 * An Engine that already verifies is left unchanged. Returns the paths written, under the Engine.
 */
export async function initEngine(root: string): Promise<string[]> {
  const written = Object.fromEntries([...targets()].map(([target, bytes]) => [target, sha256(bytes)]));
  const record = json(register({ contract: CONTRACT, record: undefined, written }));
  return bootstrapWith(join(root, ENGINE), { [RECORD.slice(ENGINE.length + 1)]: record });
}

/** What `version` reports: the kaal-core that runs, and the versions Core's record holds for the Engine's files. */
export interface Versions {
  readonly core: string;
  /** Each distinct version, in order; none when the Engine is unrecorded. */
  readonly engine: string[];
}

/** The kaal-core version that runs, and the versions the Engine's record holds for Core's files (core/F43). */
export async function versions(root: string): Promise<Versions> {
  const own = await readRecord(root, RECORD);
  const recorded = Object.entries(own.record?.assets ?? {}).filter(([p]) => isEngine(p));
  return { core: CORE_VERSION, engine: [...new Set(recorded.map(([, e]) => e.version))].sort() };
}

/** What an applied step did. */
export interface Applied {
  readonly written: string[];
  readonly removed: string[];
  readonly kept: Kept[];
}

/** An upgrade planned and verified, not yet applied (core/A23). */
export interface PlannedUpgrade {
  /** What Hosting applies; absent when the Engine is already at the contract. */
  readonly reconciliation?: Reconciliation;
  /** What applying it does. */
  readonly applied: Applied;
}

/**
 * Bring the Engine to Core's contract (core/F44): install a target that is absent, replace a
 * file Core's record holds with its recorded bytes, adopt a file the catalogue lists, keep and
 * report everything else, and remove an unmodified recorded file the contract no longer delivers.
 * Every file written or confirmed is recorded with the contract's version. The upgraded Engine
 * must verify, or nothing changes. An Engine already at the contract is left unchanged.
 */
export async function upgrade(root: string): Promise<Applied> {
  return applyUpgrade(root, await planUpgrade(root));
}

/** Apply a planned upgrade through Hosting: if anything it relied on changed since it was read, nothing changes (core/N12). */
export async function applyUpgrade(root: string, planned: PlannedUpgrade): Promise<Applied> {
  if (planned.reconciliation !== undefined) await reconcile(root, planned.reconciliation);
  return planned.applied;
}

/** Read, plan and verify an upgrade without applying it (core/A23). */
export async function planUpgrade(root: string): Promise<PlannedUpgrade> {
  const own = await readRecord(root, RECORD);
  const assets: Record<string, RecordEntry> = { ...(own.record?.assets ?? {}) };
  const want = targets();
  const dropped = Object.keys(assets).filter((p) => isEngine(p) && !want.has(p));
  // One snapshot of the Engine is what the plan, its verification and its expectations all rest on.
  const read = await engineFiles(root);
  const present = await presentAt(root, [...want.keys(), ...dropped], read);
  const write: Write[] = [];
  const remove: Removal[] = [];
  const kept: Kept[] = [];
  const entry = (bytes: Buffer): RecordEntry => ({ sha256: sha256(bytes), version: CONTRACT.version });

  for (const [target, bytes] of want) {
    const digest = sha256(bytes);
    const now = present[target];
    const recorded = assets[target];
    if (now === undefined) {
      write.push({ path: target, expect: "absent", bytes });
      assets[target] = entry(bytes);
    } else if (now === digest) {
      assets[target] = entry(bytes);
    } else if (recorded !== undefined ? now === recorded.sha256 : (CONTRACT.catalogue[target] ?? []).includes(now)) {
      write.push({ path: target, expect: now, bytes });
      assets[target] = entry(bytes);
    } else {
      kept.push({ path: target, reason: recorded !== undefined ? "changed since Core wrote it" : "present, and not written by Core" });
    }
  }
  for (const path of dropped) {
    const now = present[path];
    if (now === undefined) delete assets[path];
    else if (now === assets[path].sha256) {
      remove.push({ path, expect: now });
      delete assets[path];
    } else kept.push({ path, reason: "no longer delivered, and changed since Core wrote it" });
  }

  // The upgraded Engine, as it would be once applied, must verify before anything is applied.
  const files = { ...read };
  for (const w of write) files[w.path.slice(ENGINE.length + 1)] = Buffer.from(w.bytes);
  for (const r of remove) delete files[r.path.slice(ENGINE.length + 1)];
  const verified = check(files);
  if (!verified.ok) throw new KaalError(`the upgraded Engine would not verify; nothing was changed:\n  ${[...verified.problems, ...kept.map((k) => `kept ${k.path}: ${k.reason}`)].join("\n  ")}`);

  const next: InstallationRecord = own.record === undefined ? { assets } : { ...own.record, assets };
  const changed = JSON.stringify(next) !== JSON.stringify(own.record);
  if (write.length === 0 && remove.length === 0 && !changed) return { applied: { written: [], removed: [], kept } };
  write.push({ path: RECORD, expect: own.expect, bytes: json(next) });
  // The plan and its verification rest on every Engine file read: each one this upgrade leaves
  // untouched is a read-only expectation, which Hosting checks without rewriting it (core/N12).
  const touched = new Set([...write, ...remove].map((e) => e.path));
  const expect: Expectation[] = Object.entries(read)
    .map(([path, bytes]) => ({ path: `${ENGINE}/${path}`, expect: sha256(bytes) }))
    .filter((e) => !touched.has(e.path));
  return {
    reconciliation: { write, remove, expect },
    applied: { written: write.map((w) => w.path).filter((p) => p !== RECORD), removed: remove.map((r) => r.path), kept },
  };
}

/**
 * Remove Core's installation (core/F45): every file Core's record holds that is unmodified, the
 * provider deployments included, then the record itself; Hosting prunes the directories this
 * empties. Everything else is kept and reported: a modified file, a registered contribution, a
 * typed artifact, another Capability's record or assets.
 */
export async function remove(root: string): Promise<Applied> {
  const own = await readRecord(root, RECORD);
  if (own.record === undefined) throw new KaalError(`${RECORD} is absent: Core removes only what its record holds, and nothing was changed`);
  const recorded = own.record.assets;
  const present = await presentAt(root, Object.keys(recorded));
  const removal: Removal[] = [];
  const kept: Kept[] = [];
  for (const [path, e] of Object.entries(recorded)) {
    const now = present[path];
    if (now === undefined) continue;
    if (now === e.sha256) removal.push({ path, expect: now });
    else kept.push({ path, reason: "changed since Core wrote it" });
  }
  removal.push({ path: RECORD, expect: own.expect });
  const gone = new Set(removal.map((r) => r.path));
  for (const path of Object.keys(await engineFiles(root)).sort()) {
    const at = `${ENGINE}/${path}`;
    if (!gone.has(at) && !kept.some((k) => k.path === at)) kept.push({ path: at, reason: "not Core's" });
  }
  await reconcile(root, { write: [], remove: removal });
  return { written: [], removed: removal.map((r) => r.path), kept };
}
