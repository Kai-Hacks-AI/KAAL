// Generic installation integrity (core/C53): one pure verdict over data. Core names no entity, holds no
// inventory and fetches nothing; an establisher supplies the evidence, an observer the observed inventory
// (core/N28, core/N29, core/A53). The entry point and shapes are provisional until decision D6 closes.
import { sha256 } from "./node.js";

/** A map from a repository-relative path to the SHA-256 of its exact bytes. */
export type Digests = { readonly [path: string]: string };
export interface Entity { readonly kind: string; readonly name: string }
export type Comparison = "installed" | "engineering" | "deployed";
export type Reason = "unavailable" | "no-establisher" | "self-authority" | "identity" | "digest" | "incomplete" | "disagree" | "inventory" | "not-owner" | "no-ownership";

/** One source of evidence (core/F101): what it names, every asset's SHA-256, and the tree digest its establisher states. */
export interface Source {
  readonly kind: string;
  readonly origin: string;
  readonly manifest: { readonly kind: string; readonly name: string; readonly version: string; readonly assets: readonly string[] };
  readonly files: Digests;
  readonly treeDigest: string;
}
export interface Establisher { readonly role: string; readonly id: string }
export interface Variant { readonly suppliedBy: { readonly owner: string; readonly path: string }; readonly sources: readonly Source[] }
export interface Evidence {
  readonly establisher?: Partial<Establisher>;
  readonly sources: readonly Source[];
  readonly unavailable?: boolean;
  readonly variants?: { readonly [id: string]: Variant };
}
/** An observed inventory (core/F111): the scope enumerated, every file found in it, a tree digest, and `complete: false` when unfinished. */
export interface Observed {
  readonly scope: readonly string[];
  readonly files: Digests;
  readonly treeDigest: string;
  readonly complete?: boolean;
}
export interface Ownership { readonly owner: string; readonly paths: readonly string[] }

export interface Verdict {
  readonly entity: Entity;
  readonly version: string;
  readonly comparison: Comparison;
  readonly establisher: Partial<Establisher> | undefined;
  readonly sources: readonly { readonly kind: string; readonly origin: string }[];
  readonly status: "aligned" | "differs" | "unknown";
  readonly missing: readonly string[];
  readonly unexpected: readonly string[];
  readonly modified: readonly string[];
  readonly reason?: Reason;
  readonly differs: readonly string[];
  readonly matches?: string;
}

const KINDS: { readonly [c: string]: readonly string[] } = { installed: ["artifact", "tag"], engineering: ["package"], deployed: ["selected"] };
const sha = (text: string | Uint8Array): string => sha256(typeof text === "string" ? new TextEncoder().encode(text) : text);
/** SHA-256 over the sorted lines `path NUL sha256 LF` (core/F101). */
const tree = (d: Digests): string => sha(Object.keys(d).sort().map((p) => `${p}\0${d[p]}\n`).join(""));
const covers = (scope: readonly string[], path: string): boolean => scope.some((s) => s === "." || s === path || (s.endsWith("/") && path.startsWith(s)));
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Why a source is not evidence for this entity and version, or `null` when Core can stand behind it (core/F102, core/F108). */
function refusal(s: Source, entity: Entity, version: string): Reason | null {
  const m = s.manifest;
  if (!isObject(m) || m.name !== entity.name || m.kind !== entity.kind || m.version !== version) return "identity";
  if (!isObject(s.files) || !Array.isArray(m.assets) || !m.assets.every((p) => p in s.files)) return "incomplete";
  return tree(s.files) === s.treeDigest ? null : "digest";
}

export interface Request {
  readonly entity: Entity;
  readonly version: string;
  readonly comparison: Comparison;
  readonly evidence?: Evidence;
  readonly observed?: Observed;
  readonly ownership?: Ownership | null;
  readonly selected?: string;
}

/** The verdict for an installation (core/F100 to core/F111): aligned, differs, or unknown with a reason. Pure. */
export function verifyInstallation({ entity, version, comparison, evidence, observed, ownership, selected }: Request): Verdict {
  const base = { entity, version, comparison, establisher: evidence?.establisher, sources: (evidence?.sources ?? []).map((s) => ({ kind: s.kind, origin: s.origin })), differs: [] as readonly string[] };
  const unknown = (reason: Reason, differs: readonly string[] = []): Verdict => ({ ...base, differs, status: "unknown", reason, missing: [], unexpected: [], modified: [] });
  if (!evidence || !Array.isArray(evidence.sources) || evidence.unavailable || evidence.sources.length === 0) return unknown("unavailable");
  const est = evidence.establisher;
  if (!est || !est.role || !est.id) return unknown("no-establisher");
  if (evidence.sources.some((s) => s.kind === "installation" || s.kind === "record")) return unknown("self-authority");
  const kinds = KINDS[comparison];
  if (!kinds) return unknown("unavailable");
  const needed: Source[] = [];
  for (const k of kinds) {
    const s = evidence.sources.find((x) => x.kind === k);
    if (!s) return unknown("unavailable");
    needed.push(s);
  }
  for (const s of needed) {
    const why = refusal(s, entity, version);
    if (why) return unknown(why);
  }
  if (needed.length === 2) {
    const [a, b] = [needed[0].files, needed[1].files];
    const paths = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((p) => a[p] !== b[p]).sort();
    if (paths.length > 0) return unknown("disagree", paths);
  }
  const sets: Record<string, Digests> = { base: needed[0].files };
  let name = "base";
  for (const [id, v] of Object.entries(evidence.variants ?? {})) {
    if (!ownership) return unknown("no-ownership");
    if (v.suppliedBy.owner !== ownership.owner || !ownership.paths.some((p) => v.suppliedBy.path.startsWith(p))) return unknown("not-owner");
    const source = v.sources[0];
    if (!source) return unknown("unavailable");
    const why = refusal(source, entity, version);
    if (why) return unknown(why);
    sets[id] = source.files;
  }
  if (selected && evidence.variants) name = selected;
  const expected = sets[name];
  if (!expected) return unknown("unavailable");
  const o = observed;
  if (!o || !Array.isArray(o.scope) || o.scope.length === 0 || o.complete === false || !isObject(o.files) || tree(o.files) !== o.treeDigest) return unknown("inventory");
  if (Object.keys(o.files).some((p) => !covers(o.scope, p))) return unknown("inventory");
  const judge = (set: Digests) => ({
    missing: Object.keys(set).sort().filter((p) => !(p in o.files)),
    modified: Object.keys(set).sort().filter((p) => p in o.files && o.files[p] !== set[p]),
    unexpected: Object.keys(o.files).sort().filter((p) => !(p in set)),
  });
  if (Object.keys(expected).some((p) => !covers(o.scope, p))) return unknown("inventory");
  const found = judge(expected);
  const aligned = found.missing.length + found.unexpected.length + found.modified.length === 0;
  const verdict: Verdict = { ...base, ...found, status: aligned ? "aligned" : "differs" };
  if (aligned) return verdict;
  for (const [id, set] of Object.entries(sets)) {
    const other = judge(set);
    if (id !== name && other.missing.length + other.unexpected.length + other.modified.length === 0) return { ...verdict, matches: id };
  }
  return verdict;
}

/** 0 for aligned, 0 for a difference unless enforced (1), 2 for unknown whatever is requested (core/F104). */
export function exitStatus(result: Pick<Verdict, "status">, { enforce = false }: { enforce?: boolean } = {}): 0 | 1 | 2 {
  if (result.status === "unknown") return 2;
  return result.status === "differs" && enforce ? 1 : 0;
}

/** A contract asset as Core reads it (core/F107). */
interface ContractAsset { readonly source: string; readonly target: string; readonly kind: string; readonly surface?: string }
interface ContractLike { readonly assets: readonly ContractAsset[] }

/**
 * The expected set an Installation Contract states: each file asset's target with the SHA-256 of its source,
 * each directory asset's files under its target. A surface-gated asset is not Core's and is left out (core/F107).
 * `read` returns a source file's bytes, `list` the relative files under a directory source. Pure over them.
 */
export function expectedSet({ contract, read, list }: { contract: ContractLike; read: (source: string) => string | Uint8Array; list: (source: string) => readonly string[] | undefined }): Digests {
  const out: Record<string, string> = {};
  for (const a of contract.assets) {
    if (a.surface !== undefined) continue;
    if (a.kind === "directory") for (const f of list(a.source) ?? []) out[`${a.target}/${f}`] = sha(read(`${a.source}/${f}`));
    else out[a.target] = sha(read(a.source));
  }
  return out;
}

/** The scope an observer must enumerate for a contract: a file asset is its own path, a directory asset everything under it (core/F107, core/F111). */
export function observationScope({ contract }: { contract: ContractLike }): readonly string[] {
  return contract.assets.filter((a) => a.surface === undefined).map((a) => (a.kind === "directory" ? `${a.target}/` : a.target));
}
