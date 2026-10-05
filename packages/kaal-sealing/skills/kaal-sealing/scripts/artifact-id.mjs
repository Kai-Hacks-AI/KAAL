#!/usr/bin/env node
// artifact-id [--named] [--domain <domain>] <path>
// The canonical identity of a file or a directory: the one definition of it.
// There are two independent choices, and the artifact's own domain makes them:
//
//   unnamed   what is inside:  a file's exact bytes; a directory's relative paths and exact bytes
//   named     the same, plus the artifact's own name (its last path segment)
//
// In all four forms the parent and location are excluded, and nothing else about
// where the artifact lies takes part. The domain separates identities of
// different kinds. A file that is unnamed and has no domain is its exact bytes'
// SHA-256, which is a Node's identity; every other form needs a domain. This only
// computes: what an artifact is, which form it takes and its domain are not
// decided here. Prints the ID.
//
// The stream hashed, in every form but a bare file, is:
//
//   "<domain>\n"
//   (--named) uint64 BE  name length in bytes,  name (UTF-8)
//   a file:       uint64 BE  content length in bytes, content (raw, untranslated)
//   a directory:  uint64 BE  number of files, then for each file, by bytewise
//                 order of its UTF-8 relative path:
//                   uint64 BE  path length in bytes,  path (UTF-8)
//                   uint64 BE  content length in bytes, content (raw, untranslated)
//
// ID = SHA-256 of the stream, lowercase hex. Only regular files participate;
// directories are implied by paths and never hashed. Nothing is excluded. What
// the stream could not state unambiguously on every platform is refused, not
// normalised: symlinks and other objects, empty directories, an empty tree,
// names that are not NFC or are not valid UTF-8, names with a backslash or
// control character, and paths differing only by case.
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const u64 = (n) => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(n));
  return b;
};

/** An artifact that cannot be given an identity. */
export class IdentityError extends Error {}

function problemWithName(name, path) {
  if (name === "." || name === "..") throw new IdentityError(`${path} has a . or .. segment`);
  if (/[\\/\u0000-\u001f\u007f]/.test(name)) throw new IdentityError(`${JSON.stringify(path)} has a backslash or control character`);
  if (name !== name.normalize("NFC")) throw new IdentityError(`${path} is not NFC-normalised`);
  if (Buffer.from(name, "utf8").toString("utf8") !== name) throw new IdentityError(`${path} is not valid UTF-8`);
}

/** The relative path of every regular file under `dir`, in canonical order; throws IdentityError for anything unsupported. */
export function treeFiles(dir) {
  const found = [];
  const walk = (rel) => {
    const abs = rel === "" ? dir : join(dir, rel);
    const stat = lstatSync(abs);
    if (!stat.isDirectory()) throw new IdentityError(`${rel || "."} is not a directory`);
    const names = readdirSync(abs);
    if (names.length === 0) throw new IdentityError(`${rel || "."} is an empty directory`);
    for (const name of names) {
      const path = rel === "" ? name : `${rel}/${name}`;
      problemWithName(name, path);
      const kind = lstatSync(join(dir, path));
      if (kind.isDirectory()) walk(path);
      else if (kind.isFile()) found.push(path);
      else throw new IdentityError(`${path} is not a regular file or directory (symlinks and other objects are refused)`);
    }
  };
  walk("");
  const folded = new Map();
  for (const path of found) {
    const key = path.toLowerCase();
    const other = folded.get(key);
    if (other !== undefined) throw new IdentityError(`${other} and ${path} differ only by case`);
    folded.set(key, path);
  }
  return found.sort((a, b) => Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8")));
}

const checkDomain = (domain) => {
  if (typeof domain !== "string" || domain === "" || /[\n\u0000]/.test(domain)) throw new IdentityError("a domain is a non-empty single line");
};

/**
 * The ID of the file or directory at `path`: unnamed or, with `named`, with its
 * own name; under `domain`, which only an unnamed file may do without (its
 * bare exact bytes, a Node's identity).
 */
export function artifactId(path, { domain, named = false } = {}) {
  const kind = lstatSync(path);
  if (!kind.isFile() && !kind.isDirectory()) throw new IdentityError(`${path} is not a regular file or directory (symlinks and other objects are refused)`);
  if (kind.isFile() && !named && domain === undefined) return createHash("sha256").update(readFileSync(path)).digest("hex");
  checkDomain(domain);
  const hash = createHash("sha256").update(Buffer.from(`${domain}\n`, "utf8"));
  if (named) {
    const root = basename(resolve(path));
    problemWithName(root, root);
    const name = Buffer.from(root, "utf8");
    hash.update(u64(name.length)).update(name);
  }
  if (kind.isFile()) {
    const bytes = readFileSync(path);
    return hash.update(u64(bytes.length)).update(bytes).digest("hex");
  }
  const files = treeFiles(path);
  if (files.length === 0) throw new IdentityError("a directory with no files has no identity");
  hash.update(u64(files.length));
  for (const file of files) {
    const name = Buffer.from(file, "utf8");
    const bytes = readFileSync(join(path, file));
    hash.update(u64(name.length)).update(name).update(u64(bytes.length)).update(bytes);
  }
  return hash.digest("hex");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  let named = false;
  let domain;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--named") named = true;
    else if (args[i] === "--domain") domain = args[++i];
    else rest.push(args[i]);
  }
  if (rest.length !== 1 || (args.includes("--domain") && domain === undefined)) {
    console.error("usage: artifact-id [--named] [--domain <domain>] <path>");
    process.exit(2);
  }
  try {
    console.log(artifactId(rest[0], { domain, named }));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
