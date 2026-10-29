// The npm realization (packaging/A5): reads an npm package artifact, a gzip-compressed tar
// (`.tgz`), into the ecosystem-neutral files measurement needs. Paths are relative to the
// package root: npm places every file under one top directory, `package/`, and that segment is
// not part of the package's own path.
//
// The bytes are untrusted. The caller's limits bound the decompressed archive, the number of files
// and each path's length, and every header is checked before its entry is read. A file is only
// measured, never written anywhere, but a path that could not be written safely (absolute, with
// a `..` or empty segment, or a backslash) is refused all the same, as is a path listed twice,
// whose size would be ambiguous.
import { gunzip, isGzip } from "./gzip.mjs";

export const ecosystem = "npm";

/** Whether this realization reads the artifact. */
export const reads = isGzip;

const text = (bytes, from, to) => {
  let end = from;
  while (end < to && bytes[end] !== 0) end++;
  return new TextDecoder().decode(bytes.subarray(from, end));
};

function octal(bytes, from, to) {
  const s = text(bytes, from, to).trim();
  if (!/^[0-7]*$/.test(s)) throw new Error(`a tar header holds a size that is not octal: ${JSON.stringify(s)}`);
  return s === "" ? 0 : parseInt(s, 8);
}

/** The pax records of an extended header: key = value. */
function pax(bytes) {
  const records = {};
  const s = new TextDecoder().decode(bytes);
  let i = 0;
  while (i < s.length) {
    const space = s.indexOf(" ", i);
    if (space < 0) break;
    const length = Number(s.slice(i, space));
    if (!Number.isInteger(length) || length <= 0) throw new Error("a pax header holds an invalid record");
    const record = s.slice(space + 1, i + length - 1);
    const eq = record.indexOf("=");
    records[record.slice(0, eq)] = record.slice(eq + 1);
    i += length;
  }
  return records;
}

function checksum(header) {
  let sum = 0;
  for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : header[i];
  return sum;
}

/** Every regular file in a tar archive, in archive order, with its bytes, within the limits. */
function untar(tar, limits) {
  const files = [];
  let pos = 0;
  let next = {};
  let ended = false;
  while (pos + 512 <= tar.length) {
    const header = tar.subarray(pos, pos + 512);
    if (header.every((b) => b === 0)) {
      ended = true;
      break;
    }
    if (octal(header, 148, 156) !== checksum(header)) throw new Error(`the tar header at byte ${pos} fails its checksum`);
    let size = octal(header, 124, 136);
    const flag = String.fromCharCode(header[156] || 48);
    const prefix = text(header, 345, 500);
    let path = prefix ? `${prefix}/${text(header, 0, 100)}` : text(header, 0, 100);
    const body = pos + 512;
    if (body + size > tar.length) throw new Error(`the tar archive ends inside the entry at byte ${pos}`);
    const records = flag === "x" ? pax(tar.subarray(body, body + size)) : null;
    if (flag === "L") next.path = text(tar, body, body + size);
    if (records) {
      if (records.path !== undefined) next.path = records.path;
      if (records.size !== undefined) next.size = Number(records.size);
    }
    if (flag !== "x" && flag !== "g" && flag !== "L") {
      if (next.path !== undefined) path = next.path;
      if (next.size !== undefined) size = next.size;
      next = {};
      if (flag === "0" || flag === "7") {
        if (files.length >= limits.files) throw new Error(`the archive holds more than the limit of ${limits.files} files`);
        if (new TextEncoder().encode(path).length > limits.path) throw new Error(`a path is longer than the limit of ${limits.path} bytes: ${JSON.stringify(path.slice(0, 80))}…`);
        if (!Number.isSafeInteger(size) || size < 0) throw new Error(`${path} has an invalid size`);
        if (body + size > tar.length) throw new Error(`the tar archive ends inside ${path}`);
        files.push({ path, bytes: tar.subarray(body, body + size) });
      }
    }
    pos = body + Math.ceil(size / 512) * 512;
  }
  if (!ended && tar.subarray(pos).some((b) => b !== 0)) throw new Error(`the tar archive ends inside a header at byte ${pos}`);
  return files;
}

/** A package path is relative, with no empty, `.` or `..` segment and no backslash. */
const safe = (path) => path !== "" && !path.startsWith("/") && !path.includes("\\") && path.split("/").every((s) => s !== "" && s !== "." && s !== "..");

/** The artifact's identity and files, with paths relative to the package root, within the limits. */
export function read(artifact, limits) {
  const files = untar(gunzip(artifact, limits.archive), limits).map(({ path, bytes }) => {
    const slash = path.indexOf("/");
    return { path: slash < 0 ? path : path.slice(slash + 1), bytes };
  });
  const seen = new Set();
  for (const { path } of files) {
    if (!safe(path)) throw new Error(`the archive holds an unsafe path: ${JSON.stringify(path.slice(0, 200))}`);
    if (seen.has(path)) throw new Error(`the archive lists ${path} twice`);
    seen.add(path);
  }
  const manifest = files.find((f) => f.path === "package.json");
  if (!manifest) throw new Error("the npm package holds no package.json at its root");
  let parsed;
  try {
    parsed = JSON.parse(new TextDecoder().decode(manifest.bytes));
  } catch {
    throw new Error("the npm package's package.json is not JSON");
  }
  const { name, version } = parsed ?? {};
  if (typeof name !== "string" || typeof version !== "string") throw new Error("the npm package's package.json names no name and version");
  return { name, version, files };
}
