// KAAL Packaging: package size measurement (packaging/C2). It measures a package artifact
// exactly as it was produced, compares two measurements, and reports sizes and deltas. It
// decides nothing (packaging/I3, packaging/N2): no budget, no threshold, no verdict.
//
// The measurement and the record name no ecosystem (packaging/A5). Reading an artifact's format
// is an ecosystem realization's; the first one reads npm (./npm/realization.mjs). A format no
// realization reads is refused, naming the format.
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";
import * as npm from "./npm/realization.mjs";

const REALIZATIONS = [npm];

/** Names an artifact format no realization reads, from its leading bytes. */
function format(bytes) {
  const b = (i) => bytes[i];
  if (b(0) === 0x50 && b(1) === 0x4b && b(2) === 0x03 && b(3) === 0x04) return "zip";
  if (b(0) === 0x42 && b(1) === 0x5a && b(2) === 0x68) return "bzip2";
  if (b(0) === 0xfd && b(1) === 0x37 && b(2) === 0x7a && b(3) === 0x58 && b(4) === 0x5a) return "xz";
  if (b(0) === 0x28 && b(1) === 0xb5 && b(2) === 0x2f && b(3) === 0xfd) return "zstd";
  return "unknown";
}

const byPath = (a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

/** packaging/F1: the artifact's packed size, unpacked size and every file's path and size. */
export function measure(artifact) {
  if (!(artifact instanceof Uint8Array)) throw new TypeError("measure takes the artifact's bytes as a Uint8Array");
  const realization = npm;
  if (!realization) throw new Error(`no realization reads this artifact: its format is ${format(artifact)}`);
  const { name, version, files } = realization.read(artifact);
  const listed = files.slice(0, -1).map(({ path, bytes }) => ({ path, size: bytes.length })).sort(byPath);
  return {
    package: { ecosystem: realization.ecosystem, name, version, sha256: sha256(artifact) },
    packed: artifact.length,
    unpacked: listed.reduce((sum, f) => sum + f.size + 512, 0),
    files: listed,
  };
}

/** The group a path falls in: the longest prefix that matches it, or null. */
const groupOf = (path, groups) => groups.filter((g) => path.startsWith(g)).sort((a, b) => a.length - b.length)[0] ?? null;

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
    .filter((p) => p.delta !== 0 && now.has(p.path));
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

const MEMBERS = ["package", "packed", "unpacked", "files"];
const PACKAGE = ["ecosystem", "name", "version", "sha256"];

/** packaging/F4: a measurement as a record, machine-owned state the caller keeps where it chooses. */
export function write(measurement) {
  const { package: p, packed, unpacked, files } = measurement;
  const record = {
    package: { ecosystem: p.ecosystem, name: p.name, version: p.version, sha256: "0".repeat(64) },
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
    lines.push(`${label(subject.package)}`, `packed ${subject.packed} bytes, unpacked ${subject.unpacked} bytes, ${subject.files.length} files`);
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
  lines.push("within budget: pass");
  return `${lines.join("\n")}\n`;
}
