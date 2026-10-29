// The npm realization (packaging/A5): reads an npm package artifact, a gzip-compressed tar
// (`.tgz`), into the ecosystem-neutral files measurement needs. Paths are relative to the
// package root: npm places every file under one top directory, `package/`, and that segment is
// not part of the package's own path.
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

/** Every regular file in a tar archive, in archive order, with its bytes. */
function untar(tar) {
  const files = [];
  let pos = 0;
  let next = {};
  while (pos + 512 <= tar.length) {
    const header = tar.subarray(pos, pos + 512);
    if (header.every((b) => b === 0)) break;
    let size = octal(header, 124, 136);
    const flag = String.fromCharCode(header[156] || 48);
    const prefix = text(header, 345, 500);
    let path = prefix ? `${prefix}/${text(header, 0, 100)}` : text(header, 0, 100);
    const body = pos + 512;
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
        if (body + size > tar.length) throw new Error(`the tar archive ends inside ${path}`);
        files.push({ path, bytes: tar.subarray(body, body + size) });
      }
    }
    pos = body + Math.ceil(size / 512) * 512;
  }
  return files;
}

/** The artifact's identity and files, with paths relative to the package root. */
export function read(artifact) {
  const files = untar(gunzip(artifact)).map(({ path, bytes }) => {
    const slash = path.indexOf("/");
    return { path: slash < 0 ? path : path.slice(slash + 1), bytes };
  });
  const manifest = files.find((f) => f.path === "package.json");
  if (!manifest) throw new Error("the npm package holds no package.json at its root");
  const { name, version } = JSON.parse(new TextDecoder().decode(manifest.bytes));
  return { name, version, files };
}
