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
 * @property {Record<string, {alters?: string[], scope?: string[]}>} changes Change Nodes by id: `alters`, the elements a Change alters (change/C9, #744), and its selected scope (P1)
 * @property {Record<string, {owner: string}>} elements every element by its owner's identity, such as hosting/F31
 * @property {(id: string) => string[] | null} traverse incoming traces from an element, transitively, or null when it does not resolve (Graph's traverse with direction "in", over P2's Edges)
 * @property {Record<string, string[]>} claims each capability's locations, folder prefixes or root files (P3)
 * @property {(alters: string[]) => {result: "established" | "unknown", cases: string[], findings: string[], untraced: string[]}} [cases]
 *   the Case hop, Testing's impact(derived, target) over a derived Case inventory (testing/F88, #745): the Cases
 *   that test the altered elements. Its findings and untraced Case files are reported; unknown fails closed. The
 *   runner derives it from every .test.mjs in a Case location, passing a file it cannot read as { path, text: null }
 * @property {string[]} [converted] the capabilities whose traces are Graph Edges on the target (P2). Any capability
 *   with a claim that is not listed, or every one when the list is absent, is an impact-assessment gap: a trace it
 *   has not converted cannot be traversed, so no impact found there is proof of none (Kai, #740)
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
  if (node === undefined) {
    // No Change Node on the target: the defaults apply (N13).
    for (const v of check(paths)) if (!v.startsWith(".github travels alone")) fails.push(v);
    return verdict(fails, unresolved);
  }

  // A Change Node is on the target: admission fails closed unless its statements establish impact
  // (Kai, #744). A statement that is absent, withheld whole by Change or malformed admits nothing,
  // and nothing else on the Node (its delivery included) stands in for it.
  const statements = { alters: node.alters, scope: node.scope };
  const closed = [];
  for (const [key, value] of Object.entries(statements)) {
    if (value === undefined) closed.push(`fails closed: ${change} states no \`${key}\` on the target`);
    else if (!Array.isArray(value) || value.length === 0 || !value.every((v) => typeof v === "string" && v.length > 0)) {
      closed.push(`fails closed: ${change}'s \`${key}\` is malformed or empty, so impact cannot be established`);
    }
  }
  if (closed.length) return verdict([...fails, ...closed], unresolved);
  const scope = node.scope;

  // Impact: the owners of every changed element and of everything that traces to it (F25).
  const impact = new Set();
  let established = 0;
  for (const id of node.alters) {
    const element = target.elements[id];
    if (element === undefined) {
      unresolved.push(`unknown changed element: ${id}`);
      continue;
    }
    impact.add(element.owner);
    established++;
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

  // The Case hop (testing/F88): an empty answer is never "no impacted Case"; unknown fails closed.
  if (target.cases !== undefined) {
    const hop = target.cases([...node.alters]);
    for (const f of hop.findings ?? []) unresolved.push(`impact-assessment gap: Case inventory: ${f}`);
    for (const u of hop.untraced ?? []) unresolved.push(`impact-assessment gap: untraced Case file: ${u}`);
    if (hop.result !== "established") fails.push(`fails closed: the Case impact of ${change} is ${hop.result ?? "not stated"}, so impact cannot be established`);
    for (const c of hop.cases ?? []) {
      const e = target.elements[c];
      if (e === undefined) unresolved.push(`unresolved trace: Case ${c}, reached from ${change}`);
      else impact.add(e.owner);
    }
  }

  if (established === 0) fails.push(`fails closed: none of ${change}'s altered elements is on the target, so impact cannot be established`);

  // Unconverted traces: a missing Edge or Node is never proof of no impact (#740). Each capability
  // whose traces are not yet Graph Edges is reported, named, so the impact is never taken as complete.
  const converted = new Set(target.converted ?? []);
  for (const c of Object.keys(target.claims)) {
    if (!converted.has(c)) unresolved.push(`impact-assessment gap: ${c}'s traces are not converted, so impact through them is unknown`);
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
