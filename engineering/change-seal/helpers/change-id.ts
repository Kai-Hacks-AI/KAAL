// PROVISIONAL, the one definition of a directory tree's identity, and so of a
// Change's and a Work's. Generic by design: it knows a directory tree of regular
// files, a domain tag and SHA-256, never Git, GitHub, CI or where seals are
// kept. A candidate to move to a future sealing Skill; not kaal-core API.
// Nothing else may hash a Change or a Work.
//
// A Change is the directory changes/<name>/YY/MM/DD/CC/, and its identity covers
// the whole tree under it, relative paths included (unlike a Node, whose
// identity is its bytes alone). A Work is the directory work/ of a Change, and
// its identity covers the tree under work/ alone, paths relative to it, so
// where the Work lies is not part of it. The two differ only in their domain
// tag, so a Change and a Work of the same bytes never share an ID. The tree's
// canonical stream is:
//
//   domain tag, "KAAL Change v1\n" (15 bytes) or "KAAL Work v1\n" (13 bytes)
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
import { join } from "node:path";

const CHANGE_TAG = "KAAL Change v1\n";
const WORK_TAG = "KAAL Work v1\n";

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

function treeId(dir: string, tag: string, what: string): string {
  const files = treeFiles(dir);
  if (files.length === 0) throw new ChangeTreeError(`a ${what} with no files has no identity`);
  const hash = createHash("sha256").update(Buffer.from(tag, "utf8")).update(u64(files.length));
  for (const path of files) {
    const name = Buffer.from(path, "utf8");
    const bytes = readFileSync(join(dir, path));
    hash.update(u64(name.length)).update(name).update(u64(bytes.length)).update(bytes);
  }
  return hash.digest("hex");
}

/** The Change ID of the tree at `dir`: SHA-256, hex, of its canonical stream. */
export const changeId = (dir: string): string => treeId(dir, CHANGE_TAG, "Change");

/** The Work ID of the tree at `dir`, the Work root: the same stream under the Work tag, so the Work's own address is no part of it. */
export const workId = (dir: string): string => treeId(dir, WORK_TAG, "Work");
