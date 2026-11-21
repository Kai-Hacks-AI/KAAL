// Shared by the C112 draft Cases: a scratch tree and the paths a listing returns.
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/** A fresh directory holding `files` (path to text), `dirs` (empty directories) and `links` (path to a target, made as a directory link when `dir`). */
export function tree({ files = {}, dirs = [], links = [] } = {}) {
  const root = mkdtempSync(join(tmpdir(), "hosting-c112-"));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  for (const d of dirs) mkdirSync(join(root, d), { recursive: true });
  for (const { path, target, dir } of links) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    symlinkSync(target, join(root, path), dir ? "junction" : "file");
  }
  return root;
}

export const paths = (listing) => listing.map((e) => e.path);
