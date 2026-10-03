// PROVISIONAL sealing mechanism, generic by design: it knows bytes, a SHA-256
// and a seal, never a Kernel, a Node, YAML, Git or CI. Which artifacts are
// sealed, and where, is policy and lives elsewhere (bootstrap.ts). A candidate
// to move to the future managing-KAAL-graph Skill; not kaal-core API.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/** SHA-256, hex, of exact bytes. No normalization. A Node's ID is the SHA of its bytes. */
export function sha256(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/** The problem with `bytes` against an expected SHA, or undefined if they match. */
export function checkBytes(bytes: string | Uint8Array, expected: string, what = "artifact"): string | undefined {
  const actual = sha256(bytes);
  return actual === expected ? undefined : `${what} does not match its seal (expected ${expected}, got ${actual})`;
}

/**
 * Seal an artifact file: a seal path ending in `/` is a directory that gets an
 * empty marker named by the SHA; any other path gets the SHA as its content.
 * Returns the SHA.
 */
export function writeSeal(artifactFile: string, seal: string): string {
  const sha = sha256(readFileSync(artifactFile));
  if (seal.endsWith("/")) {
    mkdirSync(seal, { recursive: true });
    writeFileSync(join(seal, sha), "");
  } else {
    writeFileSync(seal, sha + "\n");
  }
  return sha;
}
