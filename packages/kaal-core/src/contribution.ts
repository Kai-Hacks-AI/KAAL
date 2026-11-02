// Core contribution validation, shared by registration and prospective initialization.
// The planner reads and writes nothing; Hosting remains the publication boundary.
import { check } from "./bootstrap.js";
import { evaluate } from "./engine.js";
import { claimsForm, KaalError, readNode, type Ref } from "./node.js";
import { foundation, type Files } from "./payload.js";
import type { Kind } from "./register.js";

/** The four CASE kinds, one row each: where a contribution of the kind is registered, and how it is named. */
const KINDS: Record<Kind, { dir: string; article: string }> = {
  capability: { dir: "capabilities", article: "a" },
  agent: { dir: "agents", article: "an" },
  skill: { dir: "skills", article: "a" },
  extension: { dir: "extensions", article: "an" },
};
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Core's own Node of a kind: a Node typed by it is of that kind. */
function anchor(kind: Kind): Ref {
  return foundation()[kind];
}

/** Whether a value names one of the four kinds. */
export function isKind(value: string): value is Kind {
  return Object.hasOwn(KINDS, value);
}

/** Normalize contribution input to bytes. */
function toFiles(contribution: Record<string, string | Uint8Array>): Files {
  return Object.fromEntries(Object.entries(contribution).map(([p, b]) => [p, Buffer.from(b as Uint8Array)]));
}

function checkPath(path: string): void {
  if (path.startsWith("/") || path.includes("\\") || path.split("/").some((s) => s === "" || s === "." || s === ".."))
    throw new KaalError(`${path} is not a path within the capability`);
  if (!path.endsWith(".md")) throw new KaalError(`${path} is not a Markdown file: a contribution is Nodes and nothing else`);
}

/** Validate an input before any host operation, retaining register's refusal order. */
export function prepareContribution(kind: Kind, name: string, contribution: Record<string, string | Uint8Array>): Files {
  if (!isKind(kind)) throw new KaalError(`${kind} is not a kind: capability, agent, skill or extension`);
  if (!NAME.test(name)) throw new KaalError(`${name} is not a contribution name: lowercase letters, digits and single hyphens`);
  const files = toFiles(contribution);
  const paths = Object.keys(files).sort();
  if (paths.length === 0) throw new KaalError("a contribution carries at least one Node");
  for (const path of paths) checkPath(path);
  for (const path of paths) {
    if (!claimsForm(files[path])) throw new KaalError(`${path} is not a Node: a contribution is Nodes and nothing else`);
    try {
      readNode(files[path]);
    } catch (e) {
      throw new KaalError(`${path}: ${(e as Error).message}`);
    }
  }
  return files;
}

/** Plan one registration against a snapshot, using the same admission rules as register. */
export function planRegistration(present: Files, kind: Kind, name: string, contribution: Record<string, string | Uint8Array>, dir = "Engine"): { ids: string[]; written: boolean; prefix: string; files: Files } {
  const files = prepareContribution(kind, name, contribution);
  const paths = Object.keys(files).sort();
  const prefix = `${KINDS[kind].dir}/${name}`;
  const base = check(present);
  if (!base.ok) throw new KaalError(`${dir} is not a valid Engine; nothing was written:\n  ${base.problems.join("\n  ")}`);

  const existing = Object.keys(present).filter((p) => p.startsWith(`${prefix}/`));
  const registered = existing.length > 0;
  if (registered) {
    const same = existing.length === paths.length && paths.every((p) => present[`${prefix}/${p}`]?.equals(files[p]));
    if (!same) throw new KaalError(`${prefix}/ is already registered with other content: nothing was written`);
  }

  const combined = evaluate({ ...present, ...Object.fromEntries(paths.map((p) => [`${prefix}/${p}`, files[p]])) });
  const admitted = new Set(combined.nodes.map((n) => n.id));
  const nodes = paths.map((p) => ({ path: p, ...readNode(files[p]) }));
  for (const n of nodes) {
    if (!n.type) throw new KaalError(`${n.path} declares no type: only the genesis Node does`);
    if (!admitted.has(n.id)) {
      const why = combined.rejected.find((r) => r.path === `${prefix}/${n.path}`)?.reason ?? "not admitted";
      throw new KaalError(`${n.path} is not admitted: ${why}`);
    }
  }
  const own = anchor(kind);
  const { article } = KINDS[kind];
  const typed = nodes.filter((n) => n.type?.id === own.id);
  if (typed.length === 0) throw new KaalError(`${article} ${kind} contribution carries at least one Node typed by ${own.name} (${own.id})`);
  for (const other of (Object.keys(KINDS) as Kind[]).filter((k) => k !== kind).map(anchor)) {
    const crossed = nodes.find((n) => n.type?.id === other.id);
    if (crossed) throw new KaalError(`${crossed.path} is typed by ${other.name}: ${article} ${kind} contribution carries no ${other.name}`);
  }

  // The Engine verified before; a typed artifact the contribution leaves unknown would make it fail (core/F32).
  const unknown = combined.artifacts.find((a) => a.state === "unknown");
  if (unknown) throw new KaalError(`${prefix}/ would leave ${unknown.path} with an unknown Type: ${unknown.findings.map((f) => f.rule).join("; ")}; nothing was written`);

  const ids = [...new Set(typed.map((n) => n.id))].sort();
  return { ids, written: !registered, prefix, files };
}
