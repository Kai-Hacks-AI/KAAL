// The Installation Contract (core/C3, core/C4): the one installer-neutral format in which a
// Capability states what an installation of it is, and the conformance check Core's Test Cases
// apply to an instance. Pure: no host access (core/N4). A Capability conforms by data alone and
// never imports this module to do so (core/N5, core/A8).
import { isName } from "@kaihacksai/kaal-graph/form";
import type { Finding } from "./frontmatter.js";

export type { Finding } from "./frontmatter.js";

/** The `Installation Contract` Definition in `payload/core/`, by its exact bytes. Core's tests hold the two together. */
const FORMAT = Object.freeze({ name: "Installation Contract", id: "20c46d8e84ac4502d3b4a2b497f75f8bd999fb826ee5f85b6912b77afaaefa5b" });

/** A reference to the format an installation contract conforms to: its `format` member (core/F9). */
export function installationFormat(): { readonly name: string; readonly id: string } {
  return { ...FORMAT };
}

const MEMBERS = ["format", "capability", "version", "assets", "catalogue", "record", "runtime", "provides"];
const ASSET_MEMBERS = new Set(["name", "source", "target", "kind", "executable", "surface"]);
const VERSION = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-[0-9A-Za-z.-]+)?$/;
const SHA256 = /^[0-9a-f]{64}$/;
/** A Skill's name, as Core registers one: lowercase letters, digits and single hyphens. */
const SKILL = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const has = (o: object, key: string) => Object.prototype.hasOwnProperty.call(o, key);

/** A repository-relative path, written with `/`, as `core/F1` defines `path`: no `\` or `:`, and no empty, `.` or `..` segment. */
const isPath = (v: unknown): v is string => typeof v === "string" && !/[\\:]/.test(v) && v.split("/").every((s) => s !== "" && s !== "." && s !== "..");

/**
 * The findings for one installation contract, empty when it conforms (core/F9–core/F15). Each
 * finding names the member at fault, as a dotted path such as `assets.0.target`.
 */
export function checkContract(contract: unknown): Finding[] {
  const findings: Finding[] = [];
  const find = (key: string, rule: string) => findings.push({ key, rule });
  if (!isObject(contract)) return [{ key: null, rule: "contract" }];
  for (const key of Object.keys(contract)) if (!MEMBERS.includes(key)) find(key, "unknown member");
  for (const key of MEMBERS) if (!has(contract, key)) find(key, "missing");
  const c = contract;

  if (has(c, "format") && !(isObject(c.format) && Object.keys(c.format).sort().join() === "id,name" && c.format.name === FORMAT.name && c.format.id === FORMAT.id))
    find("format", "not this format");
  if (has(c, "capability") && !isName(c.capability)) find("capability", "name");
  if (has(c, "version") && !(typeof c.version === "string" && VERSION.test(c.version))) find("version", "version");

  const files = new Set<string>();
  const directories: string[] = [];
  if (has(c, "assets")) {
    if (!Array.isArray(c.assets) || c.assets.length === 0) find("assets", "list");
    else
      c.assets.forEach((asset: unknown, i: number) => {
        const at = `assets.${i}`;
        if (!isObject(asset)) return find(at, "asset");
        for (const key of Object.keys(asset)) if (!ASSET_MEMBERS.has(key)) find(`${at}.${key}`, "unknown member");
        for (const key of ["name", "source", "target", "kind"]) if (!has(asset, key)) find(`${at}.${key}`, "missing");
        if (has(asset, "name") && !isName(asset.name)) find(`${at}.name`, "name");
        if (has(asset, "source") && !isPath(asset.source)) find(`${at}.source`, "path");
        if (has(asset, "kind") && asset.kind !== "file" && asset.kind !== "directory") find(`${at}.kind`, "kind");
        if (has(asset, "executable") && (typeof asset.executable !== "boolean" || asset.kind !== "file")) find(`${at}.executable`, "executable");
        if (has(asset, "surface") && !isName(asset.surface)) find(`${at}.surface`, "name");
        if (has(asset, "target")) {
          if (!isPath(asset.target)) find(`${at}.target`, "path");
          else if (files.has(asset.target) || directories.includes(asset.target)) find(`${at}.target`, "duplicate");
          else if (asset.kind === "directory") directories.push(asset.target);
          else files.add(asset.target);
        }
      });
  }

  if (has(c, "catalogue")) {
    if (!isObject(c.catalogue)) find("catalogue", "catalogue");
    else
      for (const [target, digests] of Object.entries(c.catalogue)) {
        const owned = files.has(target) || directories.some((d) => target.startsWith(`${d}/`));
        if (!isPath(target) || !owned) find(`catalogue.${target}`, "no asset");
        if (!Array.isArray(digests) || digests.length === 0 || !digests.every((d) => typeof d === "string" && SHA256.test(d))) find(`catalogue.${target}`, "sha256");
      }
    // Every asset's published contents are catalogued: each file target, and at least one file of each directory.
    if (isObject(c.catalogue)) {
      const entries = Object.keys(c.catalogue);
      for (const target of files) if (!entries.includes(target)) find(`catalogue.${target}`, "missing");
      for (const dir of directories) if (!entries.some((e) => e.startsWith(`${dir}/`))) find(`catalogue.${dir}`, "missing");
    }
  }

  if (has(c, "record") && !isPath(c.record)) find("record", "path");
  if (has(c, "runtime") && !(isObject(c.runtime) && Object.keys(c.runtime).join() === "node" && Number.isInteger(c.runtime.node) && (c.runtime.node as number) > 0))
    find("runtime", "runtime");

  if (has(c, "provides")) {
    if (!Array.isArray(c.provides)) find("provides", "list");
    else
      c.provides.forEach((entry: unknown, i: number) => {
        const at = `provides.${i}`;
        if (!isObject(entry)) return find(at, "skill");
        for (const key of Object.keys(entry)) if (key !== "skill") find(`${at}.${key}`, "unknown member");
        if (!(typeof entry.skill === "string" && SKILL.test(entry.skill))) find(`${at}.skill`, "skill name");
      });
  }
  return findings;
}

/** One file a record holds: the SHA-256 it was written with, and the Capability version that wrote or last confirmed it (core/F33). */
export interface RecordEntry {
  readonly sha256: string;
  readonly version: string;
}

/** An installation record: `assets` by repository-relative path, and any members of the Capability's own (core/F33). */
export interface InstallationRecord {
  readonly assets: { readonly [path: string]: RecordEntry };
  readonly [member: string]: unknown;
}

/** The findings for one installation record, empty when it conforms (core/F33, core/F38). Each finding names its member. */
export function checkRecord(record: unknown): Finding[] {
  if (!isObject(record)) return [{ key: null, rule: "record" }];
  if (!has(record, "assets")) return [{ key: "assets", rule: "missing" }];
  if (!isObject(record.assets)) return [{ key: "assets", rule: "assets" }];
  const findings: Finding[] = [];
  for (const [path, entry] of Object.entries(record.assets)) {
    const at = `assets.${path}`;
    if (!isPath(path)) findings.push({ key: at, rule: "path" });
    if (!isObject(entry)) {
      findings.push({ key: at, rule: "entry" });
      continue;
    }
    for (const key of Object.keys(entry)) if (key !== "sha256" && key !== "version") findings.push({ key: `${at}.${key}`, rule: "unknown member" });
    if (!(typeof entry.sha256 === "string" && SHA256.test(entry.sha256))) findings.push({ key: `${at}.sha256`, rule: "sha256" });
    if (!(typeof entry.version === "string" && VERSION.test(entry.version))) findings.push({ key: `${at}.version`, rule: "version" });
  }
  return findings;
}

/** Whether `path` is a file of an asset Core may register: a file asset's target, or a file under a directory asset's, never a surface-gated one (core/F37). */
function isAssetFile(contract: { assets: readonly unknown[] }, path: string): boolean {
  return contract.assets.some(
    (a) => isObject(a) && !has(a, "surface") && typeof a.target === "string" && (a.kind === "directory" ? path.startsWith(`${a.target}/`) : path === a.target),
  );
}

export interface Registration {
  /** A conforming installation contract. */
  readonly contract: unknown;
  /** The contract's record as it is now, or `undefined` when there is none. */
  readonly record: InstallationRecord | undefined;
  /** The SHA-256 Core wrote, by repository-relative path. */
  readonly written: { readonly [path: string]: string };
}

/**
 * The contract's record once Core has registered what it wrote (core/F34, core/F35). Only a path
 * Core wrote that is a file of one of the contract's assets is registered, with the contract's
 * `version`. Every other entry and member is kept as it was, in its order, and Core adds no member
 * of its own.
 * A missing record is created. Pure: the input record is not changed (core/N10).
 */
export function register({ contract, record, written }: Registration): InstallationRecord {
  const conforming = checkContract(contract);
  if (conforming.length > 0) throw new TypeError(`the contract does not conform: ${conforming.map((f) => `${f.key}: ${f.rule}`).join("; ")}`);
  if (record !== undefined) {
    const findings = checkRecord(record);
    if (findings.length > 0) throw new TypeError(`the record does not conform: ${findings.map((f) => `${f.key}: ${f.rule}`).join("; ")}`);
  }
  const c = contract as { version: string; assets: unknown[] };
  const assets: Record<string, RecordEntry> = { ...(record?.assets ?? {}) };
  for (const path of Object.keys(written).sort()) {
    if (isAssetFile(c, path)) assets[path] = { sha256: written[path], version: c.version };
  }
  return record === undefined ? { assets } : { ...record, assets };
}
