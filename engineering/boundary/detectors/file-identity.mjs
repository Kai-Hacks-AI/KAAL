// Detector `file-identity`: a scanned file whose bytes equal one of the provider's reference files.
// Engineering-owned (engineering/boundary/PLAN.md R2). The references are the provider's own assets, read beside its definition.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

export const name = "file-identity";
export const params = { equals: "string-list" };

/** Reads and hashes the references. A reference that cannot be read is reported, never guessed. */
export function prepare(test, { dir }) {
  const hashes = new Set();
  const unreadable = [];
  for (const ref of test.equals) {
    try {
      hashes.add(sha256(readFileSync(join(dir, ref))));
    } catch {
      unreadable.push({ path: `${ref} (reference of ${test.id})`, cause: "unreadable" });
    }
  }
  return { hashes, unreadable };
}

/** Lines (1-based) of the file where the detector finds a place: line 1 when the whole file is identical. */
export function detect(_test, state, file) {
  return state.hashes.has(file.digest) ? [1] : [];
}
