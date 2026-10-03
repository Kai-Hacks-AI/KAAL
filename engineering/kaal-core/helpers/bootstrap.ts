// PROVISIONAL, BIRTH-ONLY bootstrap policy: checking the Kernel's genesis seal,
// and recording each newly born Node's seal into the Embedding. The mechanisms are
// seal.ts (bytes) and nodes.ts (admission). Remove with the bootstrap once
// the graph Skill seals Nodes itself.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { payload } from "kaal-core";
import { admit, candidates } from "./nodes.js";
import { checkBytes, writeSeal } from "./seal.js";

/** The Kernel is genesis, deployed here relative to the KAAL directory. It is not a Node. */
const KERNEL_PATH = "core/KERNEL.md";
/** The Kernel's genesis seal: a control seal kept outside the payload's seals/. */
const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);
/** Core's carried artifacts, where the sealed Nodes' admission markers `seals/<ID>` are kept. */
const ARTIFACTS = new URL("../../../../packages/kaal-core/artifacts/", import.meta.url);

/** The problems with a payload's seals; empty means none. */
export function checkBootstrap(files: Record<string, string> = payload()): string[] {
  const admitted = new Set(admit(files).map((n) => n.id));
  const sealed = new Set(Object.keys(files).filter((p) => p.startsWith("seals/")).map((p) => p.slice("seals/".length)));
  const problems = [checkBytes(files[KERNEL_PATH], readFileSync(GENESIS_SEAL, "utf8").trim(), KERNEL_PATH)];
  for (const n of candidates(files)) if (!admitted.has(n.id)) problems.push(`${n.path} is not an admitted Node: it is not a sealed genesis, nor typed by an admitted Node`);
  for (const n of candidates(files)) if (!sealed.has(n.id)) problems.push(`${n.path} is a bootstrap Node with no seal recorded`);
  for (const id of sealed) if (!admitted.has(id)) problems.push(`seals/${id} seals no admitted Node`);
  return problems.filter((p): p is string => p !== undefined);
}

/**
 * Seal one newly born Node: add its admission marker `seals/<ID>` beside the
 * Nodes, and touch no other seal. It must be a Node of this payload whose type
 * and Node references are already sealed (birth is dependency ordered), and
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
