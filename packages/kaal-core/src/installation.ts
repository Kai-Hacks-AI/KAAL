// The Installation Contract (core/C3, core/C4): the one installer-neutral format in which a
// Capability states what an installation of it is, and the conformance check Core's Test Cases
// apply to an instance. Pure: no host access (core/N4). A Capability conforms by data alone and
// never imports this module to do so (core/N5, core/A8).
import { isName } from "kaal-graph/form";
import type { Finding } from "./frontmatter.js";

export type { Finding } from "./frontmatter.js";

/** The `Installation Contract` Definition in `payload/core/`, by its exact bytes. Core's tests hold the two together. */
const FORMAT = Object.freeze({ name: "Installation Contract", id: "16a1fe8eda96dd6618688126ba5a37b68ef66abd61e3e1e70cd6d2d280760c93" });

/** A reference to the format an installation contract conforms to: its `format` member (core/F9). */
export function installationFormat(): { readonly name: string; readonly id: string } {
  return { ...FORMAT };
}

const MEMBERS = ["format", "capability", "version", "assets", "catalogue", "record", "runtime", "provides"];
const ASSET_MEMBERS = new Set(["name", "source", "target", "kind", "executable"]);
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
