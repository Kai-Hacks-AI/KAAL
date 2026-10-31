// KAAL Packaging: package size measurement (packaging/C2). It measures a package artifact
// exactly as it was produced, compares two measurements, and reports sizes and deltas. It
// decides nothing (packaging/I3, packaging/N2): no budget, no threshold, no verdict.
//
// The measurement and the record name no ecosystem (packaging/A5). Describing an artifact is an
// ecosystem realization's, which asks that ecosystem's own tooling (packaging/A6); the first one
// asks npm (./npm/realization.mjs). Packaging parses no archive. It checks what the tool reports
// (packaging/N4), and takes the packed size and SHA-256 from the artifact's own bytes.
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import { readFile } from "kaal-hosting";
import * as npm from "./npm/realization.mjs";

const REALIZATIONS = [npm];

/** The default limits on what Packaging accepts from a tool (packaging/N4): the number of files,
 *  the UTF-8 bytes in one path, the unpacked size, and the characters of the tool's output. */
export const LIMITS = Object.freeze({ files: 50_000, path: 1024, unpacked: 1024 * 1024 * 1024, output: 50_000 * (1024 + 128) + 4096 });

function limitsOf(given) {
  const limits = { ...LIMITS, ...given };
  for (const k of Object.keys(limits)) {
    if (!(k in LIMITS)) throw new TypeError(`measure knows no limit named ${k}`);
    if (!Number.isSafeInteger(limits[k]) || limits[k] < 0) throw new TypeError(`the ${k} limit must be a whole number`);
  }
  return limits;
}

/** Whether a location is absolute on any host: `/…`, `C:\…` or `C:/…`, or `\\server\…`. */
const absolute = (p) => p.startsWith("/") || /^[A-Za-z]:[\\/]/.test(p) || p.startsWith("\\\\");

/** The artifact's format, named from its location's extension, for a refusal. */
const formatOf = (p) => /\.([^./\\]+)$/.exec(p)?.[1] ?? "unknown";

/** A package path is relative, with no empty, `.` or `..` segment and no backslash. */
const safe = (path) => path !== "" && !path.startsWith("/") && !path.includes("\\") && path.split("/").every((s) => s !== "" && s !== "." && s !== "..");

const byPath = (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

/** packaging/N4: what the tool reported, checked against the artifact's own bytes and the limits. */
function check(d, bytes, limits) {
  const tool = `${d.tool.name} ${d.tool.version}`;
  if (d.files.length > limits.files) throw new Error(`${tool} reported more than the limit of ${limits.files} files`);
  if (d.files.length !== d.entries) throw new Error(`${tool} reported ${d.entries} entries but ${d.files.length} files`);
  const seen = new Set();
  let sum = 0;
  for (const { path, size } of d.files) {
    if (new TextEncoder().encode(path).length > limits.path) throw new Error(`${tool} reported a path longer than the limit of ${limits.path} bytes: ${JSON.stringify(path.slice(0, 80))}…`);
    if (!safe(path)) throw new Error(`${tool} reported an unsafe path: ${JSON.stringify(path.slice(0, 200))}`);
    if (seen.has(path)) throw new Error(`${tool} reported ${path} twice`);
    seen.add(path);
    sum += size;
  }
  if (sum !== d.unpacked) throw new Error(`${tool} reported an unpacked size of ${d.unpacked} bytes, but its files add up to ${sum}`);
  if (d.unpacked > limits.unpacked) throw new Error(`${tool} reported more than the unpacked limit of ${limits.unpacked} bytes`);
  if (d.packed !== bytes.length) throw new Error(`${tool} reported a packed size of ${d.packed} bytes, but the artifact holds ${bytes.length}`);
}

/**
 * The npm a caller gives (packaging/A13): the path of a Node script that behaves as npm, run by
 * Node. Without one, the host's npm runs. Both are named, and Hosting resolves them: Packaging
 * reads no process state of its own (packaging/A6).
 */
function toolOf(script) {
  if (script === undefined) return undefined;
  if (typeof script !== "string" || script === "") throw new TypeError("npm is the path of a Node script that behaves as npm");
  return { command: "node", args: [script] };
}

/**
 * packaging/F1: the artifact's description. `artifact` is the absolute location of a package
 * artifact of known provenance (packaging/N5), and `work` a directory for the ecosystem's tool,
 * where its cache and configuration stay. `limits` narrows or widens LIMITS.
 */
export async function measure(artifact, { work, limits = {}, npm: tool } = {}) {
  if (typeof artifact !== "string" || !absolute(artifact)) throw new TypeError("measure takes the absolute location of a package artifact");
  if (typeof work !== "string" || !absolute(work)) throw new TypeError("measure takes an absolute working directory for the ecosystem's tool");
  const bounded = limitsOf(limits);
  const realization = REALIZATIONS.find((r) => r.reads(artifact));
  if (!realization) throw new Error(`no realization reads this artifact: its format is ${formatOf(artifact)}`);
  const bytes = await readFile(artifact);
  const before = sha256(bytes);
  const d = await realization.describe(artifact, work, bounded, toolOf(tool));
  if (sha256(await readFile(artifact)) !== before) throw new Error(`the artifact changed while ${d.tool.name} described it`);
  check(d, bytes, bounded);
  return {
    package: { ecosystem: realization.ecosystem, name: d.name, version: d.version, sha256: before },
    tool: d.tool,
    packed: bytes.length,
    unpacked: d.unpacked,
    files: [...d.files].sort(byPath),
  };
}

/** The group a path falls in: the longest prefix that matches it, or null. */
const groupOf = (path, groups) => groups.filter((g) => path.startsWith(g)).sort((a, b) => b.length - a.length)[0] ?? null;

/** packaging/F2: the files summed into the groups the caller names by path prefix. Every byte
 *  falls in exactly one group, the longest prefix that matches its path, or in `unattributed`. */
export function attribute(measurement, groups) {
  const unique = [...new Set(groups)];
  const sums = new Map(unique.map((g) => [g, { group: g, bytes: 0, files: 0 }]));
  const unattributed = { bytes: 0, files: 0 };
  for (const f of measurement.files) {
    const g = groupOf(f.path, unique);
    const into = g === null ? unattributed : sums.get(g);
    into.bytes += f.size;
    into.files += 1;
  }
  return { groups: [...sums.values()], unattributed, unpacked: measurement.unpacked };
}

const delta = (before, after) => ({ before, after, delta: after - before });

/** packaging/F3: the change in packed and unpacked size, per group and per path, and the paths
 *  added and removed. */
export function compare(before, after, groups = []) {
  const was = new Map(before.files.map((f) => [f.path, f.size]));
  const now = new Map(after.files.map((f) => [f.path, f.size]));
  const paths = [...new Set([...was.keys(), ...now.keys()])]
    .sort()
    .map((path) => ({ path, ...delta(was.get(path) ?? 0, now.get(path) ?? 0) }))
    .filter((p) => p.delta !== 0 || !was.has(p.path) || !now.has(p.path));
  const a = attribute(before, groups);
  const b = attribute(after, groups);
  return {
    before: before.package,
    after: after.package,
    packed: delta(before.packed, after.packed),
    unpacked: delta(before.unpacked, after.unpacked),
    groups: [
      ...a.groups.map((g, i) => ({ group: g.group, ...delta(g.bytes, b.groups[i].bytes) })),
      { group: null, ...delta(a.unattributed.bytes, b.unattributed.bytes) },
    ],
    paths,
    added: [...now.keys()].filter((p) => !was.has(p)).sort(),
    removed: [...was.keys()].filter((p) => !now.has(p)).sort(),
  };
}

const MEMBERS = ["package", "tool", "packed", "unpacked", "files"];
const TOOL = ["name", "version"];
const PACKAGE = ["ecosystem", "name", "version", "sha256"];

/** packaging/F4: a measurement as a record, machine-owned state the caller keeps where it chooses. */
export function write(measurement) {
  const { package: p, tool, packed, unpacked, files } = measurement;
  const record = {
    package: { ecosystem: p.ecosystem, name: p.name, version: p.version, sha256: p.sha256 },
    tool: { name: tool.name, version: tool.version },
    packed,
    unpacked,
    files: files.map(({ path, size }) => ({ path, size })),
  };
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** packaging/F4: a record read back, refused when it is not one. */
export function read(record) {
  const value = JSON.parse(record);
  const keys = (o) => (o && typeof o === "object" && !Array.isArray(o) ? Object.keys(o).sort().join() : null);
  const ok =
    keys(value) === [...MEMBERS].sort().join() &&
    keys(value.package) === [...PACKAGE].sort().join() &&
    PACKAGE.every((k) => typeof value.package[k] === "string") &&
    keys(value.tool) === [...TOOL].sort().join() &&
    TOOL.every((k) => typeof value.tool[k] === "string") &&
    /^[0-9a-f]{64}$/.test(value.package.sha256) &&
    Number.isInteger(value.packed) &&
    Number.isInteger(value.unpacked) &&
    Array.isArray(value.files) &&
    value.files.every((f) => keys(f) === "path,size" && typeof f.path === "string" && Number.isInteger(f.size));
  if (!ok) throw new Error("not a Packaging measurement record");
  return value;
}

const signed = (n) => (n > 0 ? `+${n}` : `${n}`);
const label = (p) => `${p.name}@${p.version} (${p.ecosystem})`;

/** packaging/F5: a measurement or a comparison, as text or as JSON. Sizes and deltas only. */
export function report(subject, { format = "text" } = {}) {
  if (format === "json") return `${JSON.stringify(subject, null, 2)}\n`;
  if (format !== "text") throw new Error(`report renders text or json, not ${format}`);
  const lines = [];
  if ("files" in subject) {
    lines.push(`${label(subject.package)}, described by ${subject.tool.name} ${subject.tool.version}`, `packed ${subject.packed} bytes, unpacked ${subject.unpacked} bytes, ${subject.files.length} files`);
    for (const f of subject.files) lines.push(`  ${f.size}\t${f.path}`);
  } else {
    lines.push(`${label(subject.before)} -> ${label(subject.after)}`);
    lines.push(`packed ${subject.packed.before} -> ${subject.packed.after} bytes (${signed(subject.packed.delta)})`);
    lines.push(`unpacked ${subject.unpacked.before} -> ${subject.unpacked.after} bytes (${signed(subject.unpacked.delta)})`);
    for (const g of subject.groups) lines.push(`  ${g.group ?? "unattributed"}\t${g.before} -> ${g.after} (${signed(g.delta)})`);
    for (const p of subject.paths) lines.push(`  ${p.path}\t${p.before} -> ${p.after} (${signed(p.delta)})`);
    if (subject.added.length) lines.push(`added: ${subject.added.join(", ")}`);
    if (subject.removed.length) lines.push(`removed: ${subject.removed.join(", ")}`);
  }
  return `${lines.join("\n")}\n`;
}
