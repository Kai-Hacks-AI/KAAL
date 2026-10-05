#!/usr/bin/env node
// tree-id [--named] <domain> <dir>
// The canonical identity of a directory tree: the one definition of it. It knows
// regular files, a domain and SHA-256, nothing of what the tree is. The domain,
// and whether the tree's own root name is part of its identity, belong to
// whoever defines the artifact; this only computes. Prints the ID.
//
// The canonical stream is:
//
//   "<domain>\n"
//   (--named only) uint64 BE  root name length in bytes,  root name (UTF-8)
//   uint64 BE  number of files
//   for each file, by bytewise order of its UTF-8 relative path:
//     uint64 BE  path length in bytes,  path (UTF-8)
//     uint64 BE  content length in bytes, content (raw, untranslated)
//
// ID = SHA-256 of the stream, lowercase hex. Only regular files participate;
// directories are implied by paths and never hashed; the tree's parent and
// location are not part of the identity. The root name is the last segment of
// the directory given, and is part of the identity only with --named. Nothing
// is excluded. Anything the stream could not state unambiguously on every
// platform is refused, not normalised: symlinks and other objects, empty
// directories, an empty tree, names that are not NFC or are not valid UTF-8,
// names with a backslash or control character, and paths differing only by case.
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const u64 = (n) => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(n));
  return b;
};

/** A tree that cannot be given an identity. */
export class TreeError extends Error {}

function problemWithName(name, path) {
  if (name === "." || name === "..") throw new TreeError(`${path} has a . or .. segment`);
  if (/[\\/\u0000-\u001f\u007f]/.test(name)) throw new TreeError(`${JSON.stringify(path)} has a backslash or control character`);
  if (name !== name.normalize("NFC")) throw new TreeError(`${path} is not NFC-normalised`);
  if (Buffer.from(name, "utf8").toString("utf8") !== name) throw new TreeError(`${path} is not valid UTF-8`);
}

/** The relative path of every regular file under `dir`, in canonical order; throws TreeError for anything unsupported. */
export function treeFiles(dir) {
  const found = [];
  const walk = (rel) => {
    const abs = rel === "" ? dir : join(dir, rel);
    const stat = lstatSync(abs);
    if (!stat.isDirectory()) throw new TreeError(`${rel || "."} is not a directory`);
    const names = readdirSync(abs);
    if (names.length === 0) throw new TreeError(`${rel || "."} is an empty directory`);
    for (const name of names) {
      const path = rel === "" ? name : `${rel}/${name}`;
      problemWithName(name, path);
      const kind = lstatSync(join(dir, path));
      if (kind.isDirectory()) walk(path);
      else if (kind.isFile()) found.push(path);
      else throw new TreeError(`${path} is not a regular file or directory (symlinks and other objects are refused)`);
    }
  };
  walk("");
  const folded = new Map();
  for (const path of found) {
    const key = path.toLowerCase();
    const other = folded.get(key);
    if (other !== undefined) throw new TreeError(`${other} and ${path} differ only by case`);
    folded.set(key, path);
  }
  return found.sort((a, b) => Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8")));
}

/** The ID of the tree at `dir` under `domain`; with `named`, the tree's own root name is part of it. */
export function treeId(dir, { domain, named = false }) {
  if (typeof domain !== "string" || domain === "" || /[\n\u0000]/.test(domain)) throw new TreeError("a domain is a non-empty single line");
  const files = treeFiles(dir);
  if (files.length === 0) throw new TreeError("a tree with no files has no identity");
  const hash = createHash("sha256").update(Buffer.from(`${domain}\n`, "utf8"));
  if (named) {
    const root = basename(resolve(dir));
    problemWithName(root, root);
    const name = Buffer.from(root, "utf8");
    hash.update(u64(name.length)).update(name);
  }
  hash.update(u64(files.length));
  for (const path of files) {
    const name = Buffer.from(path, "utf8");
    const bytes = readFileSync(join(dir, path));
    hash.update(u64(name.length)).update(name).update(u64(bytes.length)).update(bytes);
  }
  return hash.digest("hex");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const named = args[0] === "--named";
  const [domain, dir, ...extra] = named ? args.slice(1) : args;
  if (!domain || !dir || extra.length > 0) {
    console.error("usage: tree-id [--named] <domain> <dir>");
    process.exit(2);
  }
  try {
    console.log(treeId(dir, { domain, named }));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
