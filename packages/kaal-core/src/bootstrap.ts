// Core's PRIVATE sealing: only what Core needs to bring itself into existence,
// before any Skill, Sealing included, can be installed. `checkBootstrap` and
// `sealNode` work on Core's own bootstrap artifacts alone (the Kernel's genesis
// seal and the Nodes Core carries in `payload()`) and cannot seal or verify
// anything outside them, such as a Skill's Node. It is not exported from the
// package and it is not a general sealing capability: sealing KAAL artifacts
// after bootstrap belongs to the Sealing Skill, which Core never depends on.
// Where the same mechanic exists in Sealing, the duplication is intentional,
// since sharing it would make Core depend on a Skill that depends on Core. The
// birth of a Skill's own first Node is a separate, explicit bootstrap act outside
// this file and outside Sealing. Used by engineering's bootstrap helpers,
// reached in the built package and not through the public API.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { admit, candidates, sha256 } from "./nodes.js";
import { ARTIFACTS, payload } from "./payload.js";

/** The Kernel is genesis, deployed here relative to the KAAL directory. It is not a Node. */
const KERNEL_PATH = "core/KERNEL.md";

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

/**
 * The problems with a payload's seals; empty means none. `genesis` is the
 * Kernel's genesis seal, kept outside the payload by whoever controls it: the
 * Kernel is checked against it, and every Node must be admitted and sealed, and
 * every seal must belong to an admitted Node.
 */
export function checkBootstrap(files: Record<string, string>, genesis: string): string[] {
  const admitted = new Set(admit(files).map((n) => n.id));
  const sealed = new Set(Object.keys(files).filter((p) => p.startsWith("seals/")).map((p) => p.slice("seals/".length)));
  const problems = [checkBytes(files[KERNEL_PATH], genesis, KERNEL_PATH)];
  for (const n of candidates(files)) if (!admitted.has(n.id)) problems.push(`${n.path} is not an admitted Node: it is not sealed, or is neither a genesis nor typed by an admitted Node`);
  for (const n of candidates(files)) if (!sealed.has(n.id)) problems.push(`${n.path} is a bootstrap Node with no seal recorded`);
  for (const id of sealed) if (!admitted.has(id)) problems.push(`seals/${id} seals no admitted Node`);
  return problems.filter((p): p is string => p !== undefined);
}

/**
 * Seal one newly born Node of Core: add its admission marker `seals/<ID>` beside
 * the Nodes, and touch no other seal. It must be a Node of this payload whose
 * type and Node references are already sealed (birth is dependency ordered), and
 * sealing it again changes nothing. Removing a revised draft's seal is a
 * separate act; after merge, Git (preserve-seals) makes an accepted seal
 * durable. Returns the sealed ID.
 */
export function sealNode(name: string): string {
  const files = payload();
  const found = candidates(files);
  const node = found.find((n) => n.name === name);
  if (!node) throw new Error(`no Node named ${name} is born`);
  const recorded = Object.keys(files).filter((p) => p.startsWith("seals/")).map((p) => p.slice("seals/".length));
  const refs = [...(node.type ? [node.type] : [])];
  for (const other of found) for (const m of node.markdown.matchAll(new RegExp(`${other.name} ([0-9a-f]{64})`, "g"))) refs.push({ name: other.name, id: m[1] });
  for (const ref of refs) if (!recorded.includes(ref.id)) throw new Error(`${name} refers to ${ref.name}, which is not sealed: seal it first`);
  return writeSeal(fileURLToPath(new URL(node.path, ARTIFACTS)), fileURLToPath(new URL("seals/", ARTIFACTS)));
}
