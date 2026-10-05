// PROVISIONAL, the one definition of a directory tree's identity. Generic by
// design: it knows a directory tree of regular files, a domain tag and SHA-256,
// never Git, GitHub, CI or where seals are kept. A candidate to move to a future
// sealing Skill; not kaal-core API. Nothing else may hash a tree.
//
// Two identities share one stream:
//
// * A Change, changes/<name>/YY/MM/DD/CC/, is `KAAL Change v1`: the whole tree
//   under it, relative paths included, the Change's own name and address
//   excluded (unlike a Node, whose identity is its bytes alone). v1 is kept
//   exactly as sealed in genesis 01.
// * A named tree is `KAAL Tree v1`: the same, plus the tree's own root name. Its
//   parent and location are excluded, so A/work/ moved to B/work/ keeps its
//   identity and work/ renamed to evidence/ does not. The first consumer is a
//   Change's work/; nothing here is Work-specific.
//
// The canonical stream is:
//
//   domain tag, "KAAL Change v1\n" or "KAAL Tree v1\n"
//   (named tree only) uint64 BE  root name length in bytes,  root name (UTF-8)
//   uint64 BE  number of files
//   for each file, by bytewise order of its UTF-8 relative path:
//     uint64 BE  path length in bytes,  path (UTF-8)
//     uint64 BE  content length in bytes, content (raw, untranslated)
//
// ID = SHA-256 of the stream, lowercase hex. Only regular files participate;
// directories are implied by paths and never hashed; the Change's own address is
// not part of the identity. Nothing is excluded. Anything the stream could not
// state unambiguously on every platform is refused, not normalised.
import { createHash } from "node:crypto";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const CHANGE_TAG = "KAAL Change v1\n";
const TREE_TAG = "KAAL Tree v1\n";

const u64 = (n: number): Buffer => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(n));
  return b;
};

/** A tree that cannot be given an identity. */
export class ChangeTreeError extends Error {}

/** The relative path of every regular file under `dir`, in canonical order; throws ChangeTreeError for anything unsupported. */
export function treeFiles(dir: string): string[] {
  const found: string[] = [];
  const walk = (rel: string): void => {
    const abs = rel === "" ? dir : join(dir, rel);
    const stat = lstatSync(abs);
    if (!stat.isDirectory()) throw new ChangeTreeError(`${rel || "."} is not a directory`);
    const names = readdirSync(abs);
    if (names.length === 0) throw new ChangeTreeError(`${rel || "."} is an empty directory`);
    for (const name of names) {
      const path = rel === "" ? name : `${rel}/${name}`;
      problemWithName(name, path);
      const kind = lstatSync(join(dir, path));
      if (kind.isDirectory()) walk(path);
      else if (kind.isFile()) found.push(path);
      else throw new ChangeTreeError(`${path} is not a regular file or directory (symlinks and other objects are refused)`);
    }
  };
  walk("");
  const folded = new Map<string, string>();
  for (const path of found) {
    const key = path.toLowerCase();
    const other = folded.get(key);
    if (other !== undefined) throw new ChangeTreeError(`${other} and ${path} differ only by case`);
    folded.set(key, path);
  }
  return found.sort((a, b) => Buffer.compare(Buffer.from(a, "utf8"), Buffer.from(b, "utf8")));
}

function problemWithName(name: string, path: string): void {
  if (name === "." || name === "..") throw new ChangeTreeError(`${path} has a . or .. segment`);
  if (/[\\/\u0000-\u001f\u007f]/.test(name)) throw new ChangeTreeError(`${JSON.stringify(path)} has a backslash or control character`);
  if (name !== name.normalize("NFC")) throw new ChangeTreeError(`${path} is not NFC-normalised`);
  if (Buffer.from(name, "utf8").toString("utf8") !== name) throw new ChangeTreeError(`${path} is not valid UTF-8`);
}

function treeId(dir: string, tag: string, rootName?: string): string {
  const files = treeFiles(dir);
  if (files.length === 0) throw new ChangeTreeError("a tree with no files has no identity");
  const hash = createHash("sha256").update(Buffer.from(tag, "utf8"));
  if (rootName !== undefined) {
    const name = Buffer.from(rootName, "utf8");
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

/** The Change ID of the tree at `dir`: SHA-256, hex, of its canonical stream. */
export const changeId = (dir: string): string => treeId(dir, CHANGE_TAG);

/** The ID of the named tree at `dir`: its root name (the last segment of `dir`), relative paths and exact bytes under `KAAL Tree v1`; where `dir` lies is no part of it. */
export function namedTreeId(dir: string): string {
  const root = basename(resolve(dir));
  problemWithName(root, root);
  return treeId(dir, TREE_TAG, root);
}
