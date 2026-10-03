// PROVISIONAL sealing mechanism, generic by design: it knows bytes, a SHA-256
// and a seal, never a Kernel, a Node, YAML, Git or CI. Which artifacts are
// sealed, and where, is policy and lives elsewhere (bootstrap.ts). A candidate
// to move to the future managing-KAAL-graph Skill; not kaal-core API.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { sealNode } from "../src/seal.js";

/** The SHA a seal file stands for: its content, or, for an empty marker file, its name. */
export function readSeal(sealFile: string): string {
  const content = readFileSync(sealFile, "utf8").trim();
  return content === "" ? basename(sealFile) : content;
}

/** The problem with `bytes` against an expected SHA, or undefined if they match. */
export function checkBytes(bytes: string | Uint8Array, expected: string, what = "artifact"): string | undefined {
  const actual = sealNode(bytes);
  return actual === expected ? undefined : `${what} does not match its seal (expected ${expected}, got ${actual})`;
}

/** The problem with the artifact file against its seal file, or undefined if they match. */
export function checkSeal(artifactFile: string, sealFile: string): string | undefined {
  return checkBytes(readFileSync(artifactFile), readSeal(sealFile), artifactFile);
}

/**
 * Seal an artifact file: a seal path ending in `/` is a directory that gets an
 * empty marker named by the SHA; any other path gets the SHA as its content.
 * Returns the SHA.
 */
export function writeSeal(artifactFile: string, seal: string): string {
  const sha = sealNode(readFileSync(artifactFile));
  if (seal.endsWith("/")) {
    mkdirSync(seal, { recursive: true });
    writeFileSync(join(seal, sha), "");
  } else {
    writeFileSync(seal, sha + "\n");
  }
  return sha;
}
