// Case release/T912 (release/C71): one definition for each object and relationship, a status on each, the repository's identifiers kept
import assert from "node:assert/strict";
import { model, mermaid, edges, objects, relationships, STYLE, norm } from "./helper.mjs";

export const id = "release/T912";
export const tests = ["release/C71"];
export const title = "each object and each relationship has exactly one definition with a status (normative, observed or proposed), the arrow style of every edge agrees with that status, and the repository's identifier prefixes and keys are kept";
export async function run() {
  const text = model();
  const os = objects(text), rs = relationships(text);
  const ok = new Set(["normative", "observed", "proposed"]);
  assert.equal(new Set(os.map((o) => o.name)).size, os.length, "an object is defined twice");
  for (const o of os) { assert.ok(ok.has(o.status), `${o.name}: status ${o.status}`); assert.ok(o.identity && o.by, `${o.name}: identity or definition missing`); }
  const dup = new Set();
  for (const r of rs) { const k = `${r.label} ${r.from} ${r.tos.join(",")}`; assert.ok(!dup.has(k), `a relationship is defined twice: ${k}`); dup.add(k); assert.ok(ok.has(r.status), `${k}: status ${r.status}`); assert.ok(r.key && r.source, `${k}: key or source missing`); }
  const table = os.map((o) => o.identity).join(" ");
  for (const p of ["I<n>", "F<n>", "N<n>", "A<n>", "D<n>", "T<n>", "C<n>", "CTL<n>", "G<n>"]) assert.ok(table.includes(p), `the identifier ${p} of the repository is not kept`);
  const keys = rs.map((r) => r.key).join(" ");
  for (const k of ["implements", "serves", "addresses", "closes", "has", "tests"]) assert.ok(keys.includes(k), `the repository key ${k} is not kept`);
  for (const e of edges(mermaid(text)[0] ?? "")) {
    const r = rs.find((x) => x.label === e.label && norm(x.from) === e.from && x.tos.map(norm).includes(e.to));
    assert.ok(r, `the edge ${e.from} ${e.label} ${e.to} has no relationship row`);
    assert.equal(STYLE[e.style], r.status, `the edge ${e.from} ${e.label} ${e.to} is drawn ${STYLE[e.style]} and defined ${r.status}`);
  }
}
