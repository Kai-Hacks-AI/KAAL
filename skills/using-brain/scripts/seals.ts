import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { learningOf, nodeFiles, relativeIdentity } from "./brain.js";

/**
 * A seal closes a learning. It records the bytes of every node the learning
 * holds and chains to the previous seal of the same lineage, so changing any
 * sealed learning breaks its own seal and every seal after it.
 */
export type Seal = {
  lineage: string;
  learning: string;
  previous: string | null;
  nodes: { id: string; sha256: string }[];
  seal: string;
};

export const SEAL_FILE = "seal.json";

const sha256 = (data: string | Buffer) => crypto.createHash("sha256").update(data).digest("hex");

export function sealPath(root: string, lineage: string, learning: string): string {
  return path.join(root, lineage, learning, SEAL_FILE);
}

export function isSealed(root: string, lineage: string, learning: string): boolean {
  return fs.existsSync(sealPath(root, lineage, learning));
}

/** Every learning that holds nodes or a seal, grouped by lineage and ordered oldest first. */
export function learnings(root: string): Map<string, string[]> {
  const byLineage = new Map<string, Set<string>>();
  const add = (lineage: string, key: string) => byLineage.set(lineage, (byLineage.get(lineage) ?? new Set()).add(key));
  for (const file of nodeFiles(root)) {
    try {
      const { lineage, key } = learningOf(root, file);
      add(lineage, key);
    } catch {
      // Invalid paths are reported by validate; they belong to no learning.
    }
  }
  if (fs.existsSync(root)) {
    for (const entry of fs.readdirSync(root, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || entry.name !== SEAL_FILE) continue;
      const parts = relativeIdentity(root, path.join(entry.parentPath, entry.name)).split("/");
      if (parts.length === 6 && parts.slice(1, 5).every((x) => /^\d{2}$/.test(x))) {
        add(parts[0], parts.slice(1, 5).join("/"));
      }
    }
  }
  return new Map([...byLineage].sort().map(([lineage, keys]) => [lineage, [...keys].sort()]));
}

/** The nodes a learning holds right now, as they would be recorded in its seal. */
export function manifest(root: string, lineage: string, learning: string): Seal["nodes"] {
  return nodeFiles(path.join(root, lineage, learning, "nodes")).map((file) => ({
    id: relativeIdentity(root, file),
    sha256: sha256(fs.readFileSync(file)),
  }));
}

function sealHash(content: Omit<Seal, "seal">): string {
  const { lineage, learning, previous, nodes } = content;
  return sha256(JSON.stringify({ lineage, learning, previous, nodes }));
}

export function readSeal(root: string, lineage: string, learning: string): Seal {
  return JSON.parse(fs.readFileSync(sealPath(root, lineage, learning), "utf8")) as Seal;
}

export function createSeal(root: string, lineage: string, learning: string, previous: string | null): Seal {
  const content = { lineage, learning, previous, nodes: manifest(root, lineage, learning) };
  return { ...content, seal: sealHash(content) };
}

/**
 * Checks every seal against the BRAIN as it is now: the sealed nodes are
 * unchanged, the seal is intact, the chain is unbroken, and no open learning
 * precedes a sealed one in its lineage.
 */
export function sealErrors(root: string): string[] {
  const errors: string[] = [];
  for (const [lineage, keys] of learnings(root)) {
    let previous: string | null = null;
    let open: string | undefined;
    for (const learning of keys) {
      const id = `${lineage}/${learning}`;
      if (!isSealed(root, lineage, learning)) {
        open ??= id;
        continue;
      }
      if (open) errors.push(`${id}: sealed after open learning ${open}`);
      let seal: Seal;
      try {
        seal = readSeal(root, lineage, learning);
      } catch (e) {
        errors.push(`${id}: unreadable seal: ${String(e)}`);
        continue;
      }
      if (seal.lineage !== lineage || seal.learning !== learning)
        errors.push(`${id}: seal belongs to another learning`);
      if (seal.seal !== sealHash(seal)) errors.push(`${id}: seal does not match its own content`);
      if (seal.previous !== previous) errors.push(`${id}: seal does not chain to the previous seal`);
      const sealed = new Map(seal.nodes.map((n) => [n.id, n.sha256]));
      const now = new Map(manifest(root, lineage, learning).map((n) => [n.id, n.sha256]));
      for (const [node, hash] of now) {
        if (!sealed.has(node)) errors.push(`${node}: added after ${id} was sealed`);
        else if (sealed.get(node) !== hash) errors.push(`${node}: changed after ${id} was sealed`);
      }
      for (const node of sealed.keys()) {
        if (!now.has(node)) errors.push(`${node}: removed after ${id} was sealed`);
      }
      previous = seal.seal;
    }
  }
  return errors;
}
