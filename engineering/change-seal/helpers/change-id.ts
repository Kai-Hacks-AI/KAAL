// PROVISIONAL, the one definition of a Change's identity. Generic by design: it
// knows a directory tree of regular files and SHA-256, never Git, GitHub, CI or
// where seals are kept. A candidate to move to a future sealing Skill; not
// kaal-core API. Nothing else may hash a Change.
//
// A Change is the directory changes/<name>/YY/MM/DD/CC/, and its identity covers
// the whole tree under it, relative paths included (unlike a Node, whose
// identity is its bytes alone). The tree's canonical stream is:
//
//   "KAAL Change v1\n"                       domain tag, 15 bytes
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

const TAG = Buffer.from("KAAL Change v1\n", "utf8");

const u64 = (n: number): Buffer => {
  const b = Buffer.alloc(8);
  b.writeBigUInt64BE(BigInt(n));
  return b;
};

/** A Change tree that cannot be given an identity. */
export class ChangeTreeError extends Error {}

/** The relative path of every regular file under `dir`, in canonical order; throws ChangeTreeError for anything unsupported. */
export function changeFiles(dir: string): string[] {
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

/** The Change ID of the tree at `dir`: SHA-256, hex, of its canonical stream. */
export function changeId(dir: string): string {
  const files = changeFiles(dir);
  if (files.length === 0) throw new ChangeTreeError("a Change with no files has no identity");
  const hash = createHash("sha256").update(TAG).update(u64(files.length));
  for (const path of files) {
    const name = Buffer.from(path, "utf8");
    const bytes = readFileSync(join(dir, path));
    hash.update(u64(name.length)).update(name).update(u64(bytes.length)).update(bytes);
  }
  return hash.digest("hex");
}
