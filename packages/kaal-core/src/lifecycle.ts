// Core's own lifecycle (core/C18, core/C19): Core is realized by an Installation Contract of its
// own, in the format it owns, and follows that format's rules for its own files (core/I12,
// core/I13). Core decides each step purely from what it read; Hosting applies it in one guarded
// reconciliation, so a step that is refused, or finds anything changed since it read, changes
// nothing (core/N12). Every step acts on the Engine at `./.kaal` of `root` (core/F46).
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { kind, read, readFile, reconcile, type Removal, type Write } from "kaal-hosting";
import { check } from "./bootstrap.js";
import { checkContract, register, type InstallationRecord, type RecordEntry } from "./installation.js";
import { KaalError } from "./node.js";
import { payload } from "./payload.js";
import { record as RECORD } from "./realization.js";
import { readRecord } from "./records.js";
import { sha256 } from "./sha256.js";

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

const json = (value: unknown) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const isEngine = (path: string) => path.startsWith(`${ENGINE}/`);

/** What is at each path under `root`: its SHA-256, `"not a file"`, or nothing when it is absent. */
async function presentAt(root: string, paths: Iterable<string>): Promise<Record<string, string>> {
  const present: Record<string, string> = {};
  for (const path of new Set(paths)) {
    const what = await kind(join(root, path));
    if (what === "file") present[path] = sha256(await readFile(join(root, path)));
    else if (what !== "missing") present[path] = "not a file";
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
 * Register the Engine files `init` just wrote in Core's record, with the contract's version
 * (core/F43). Only targets that hold exactly the contract's bytes are registered.
 */
export async function recordInstallation(root: string): Promise<void> {
  const own = await readRecord(root, RECORD);
  const want = targets();
  const present = await presentAt(root, want.keys());
  const written = Object.fromEntries([...want].filter(([t, bytes]) => present[t] === sha256(bytes)).map(([t]) => [t, present[t]]));
  if (Object.keys(written).length === 0) return;
  const next = register({ contract: CONTRACT, record: own.record, written });
  await reconcile(root, { write: [{ path: RECORD, expect: own.expect, bytes: json(next) }], remove: [] });
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
  return { core: CONTRACT.version, engine: [...new Set(recorded.map(([, e]) => e.version))].sort() };
}

/** What an applied step did. */
export interface Applied {
  readonly written: string[];
  readonly removed: string[];
  readonly kept: Kept[];
}

/**
 * Bring the Engine to Core's contract (core/F44): install a target that is absent, replace a
 * file Core's record holds with its recorded bytes, adopt a file the catalogue lists, keep and
 * report everything else, and remove an unmodified recorded file the contract no longer delivers.
 * Every file written or confirmed is recorded with the contract's version. The upgraded Engine
 * must verify, or nothing changes. An Engine already at the contract is left unchanged.
 */
export async function upgrade(root: string): Promise<Applied> {
  const own = await readRecord(root, RECORD);
  const assets: Record<string, RecordEntry> = { ...(own.record?.assets ?? {}) };
  const want = targets();
  const dropped = Object.keys(assets).filter((p) => isEngine(p) && !want.has(p));
  const present = await presentAt(root, [...want.keys(), ...dropped]);
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
  const before = await engineFiles(root);
  const files = { ...before };
  for (const w of write) files[w.path.slice(ENGINE.length + 1)] = Buffer.from(w.bytes);
  for (const r of remove) delete files[r.path.slice(ENGINE.length + 1)];
  const verified = check(files);
  if (!verified.ok) throw new KaalError(`the upgraded Engine would not verify; nothing was changed:\n  ${[...verified.problems, ...kept.map((k) => `kept ${k.path}: ${k.reason}`)].join("\n  ")}`);

  const next: InstallationRecord = own.record === undefined ? { assets } : { ...own.record, assets };
  const changed = JSON.stringify(next) !== JSON.stringify(own.record);
  if (write.length === 0 && remove.length === 0 && !changed) return { written: [], removed: [], kept };
  write.push({ path: RECORD, expect: own.expect, bytes: json(next) });
  // The verification and the plan rest on every Engine file read, so each one this upgrade does
  // not change is guarded as it was read: rewritten with its own bytes, refused if it changed.
  const touched = new Set([...write, ...remove].map((e) => e.path));
  const guards: Write[] = Object.entries(before)
    .map(([path, bytes]) => ({ path: `${ENGINE}/${path}`, expect: sha256(bytes), bytes }))
    .filter((g) => !touched.has(g.path));
  await reconcile(root, { write: [...write, ...guards], remove });
  return { written: write.map((w) => w.path).filter((p) => p !== RECORD), removed: remove.map((r) => r.path), kept };
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
