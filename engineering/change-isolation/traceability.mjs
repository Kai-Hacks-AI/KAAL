// Change Isolation by reverse traceability (engineering/C11 DO, draft): engineering/F25–F27, N13–N14.
//
// A Change isolates when every path it touches lies in a location it selected, and everything it
// selected lies within the impact computed from what it changes. Impact is analysis; selection is
// authorization. The judgment reads only the target: its Change Node, its traces and its ownership
// claims. The candidate's own Nodes are never read (N14).
//
// The input shapes below are provisional. P1 (Change) defines how a Change Node states its changed
// elements and selected scope, P2 (each trace owner) makes the traces Graph Edges, and P3 (every
// capability) declares its ownership claim. Until those reach the target, the cases run on fixtures,
// and check.mjs's rules stay the ones CI applies.
import { check } from "./check.mjs";

const GITHUB = /^\.github\//;

/**
 * The target, as the judgment reads it.
 * @typedef {object} Target
 * @property {Record<string, {changes?: string[], scope?: string[]}>} changes Change Nodes by id (P1)
 * @property {Record<string, {owner: string}>} elements every element by its owner's identity, such as hosting/F31
 * @property {(id: string) => string[] | null} traverse incoming traces from an element, transitively, or null when it does not resolve (Graph's traverse with direction "in", over P2's Edges)
 * @property {Record<string, string[]>} claims each capability's locations, folder prefixes or root files (P3)
 */

/** The capability whose claim covers a path: the longest matching location wins. */
export function owner(claims, path) {
  let best;
  let length = -1;
  for (const [capability, locations] of Object.entries(claims)) {
    for (const l of locations) {
      const covers = l.endsWith("/") ? path.startsWith(l) : path === l;
      if (covers && l.length > length) [best, length] = [capability, l.length];
    }
  }
  return best;
}

/**
 * Judges one candidate.
 * @param {{ target: Target, change?: string, paths: string[], candidate?: unknown }} input
 *   `candidate` is the candidate's own Nodes: accepted so a caller can pass them, and never read.
 * @returns {{ verdict: "pass" | "fail" | "unresolved", findings: string[] }}
 */
export function judge({ target, change, paths }) {
  const fails = [];
  const unresolved = [];

  // .github travels alone, with no exception (N13).
  if (paths.some((p) => GITHUB.test(p))) {
    for (const p of paths) if (!GITHUB.test(p)) fails.push(`.github travels alone: ${p} is outside .github/`);
  }

  const node = change === undefined ? undefined : target.changes[change];
  const scope = node?.scope ?? [];
  if (scope.length === 0) {
    // No Change Node on the target, or one stating no scope: the defaults apply (N13).
    for (const v of check(paths)) if (!v.startsWith(".github travels alone")) fails.push(v);
    return verdict(fails, unresolved);
  }

  // Impact: the owners of every changed element and of everything that traces to it (F25).
  const impact = new Set();
  for (const id of node.changes ?? []) {
    const element = target.elements[id];
    if (element === undefined) {
      unresolved.push(`unknown changed element: ${id}`);
      continue;
    }
    impact.add(element.owner);
    const reached = target.traverse(id);
    if (reached === null) {
      unresolved.push(`unresolved trace: from ${id}`);
      continue;
    }
    for (const r of reached) {
      const e = target.elements[r];
      if (e === undefined) unresolved.push(`unresolved trace: ${r}, reached from ${id}`);
      else impact.add(e.owner);
    }
  }

  // Selection is the authority, and must lie within the impact (F26).
  for (const c of scope) if (!impact.has(c)) fails.push(`selected without a trace: ${c} is not in the computed impact`);
  for (const p of paths) {
    if (GITHUB.test(p)) continue;
    const c = owner(target.claims, p);
    if (c === undefined) unresolved.push(`unattributed path: ${p} lies in no ownership claim`);
    else if (!scope.includes(c)) fails.push(`outside the selected scope: ${p} belongs to ${c}`);
  }
  return verdict(fails, unresolved);
}

/** A failure outranks an unresolved finding; neither is ever GREEN (F27). */
function verdict(fails, unresolved) {
  const findings = [...fails, ...unresolved];
  return { verdict: fails.length ? "fail" : unresolved.length ? "unresolved" : "pass", findings };
}
