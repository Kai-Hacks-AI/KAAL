// change/check Predecessor (change/C16): a detective judgement over the Changes under check.
//
// checkPredecessor({ pinOf, main, carried, elsewhere, delivered }) judges whether every hard predecessor a
// Change under check declares is satisfied. Records are { identity, text }: `main` are the ones main holds,
// `carried` those of the Changes under check (the same promotion), `elsewhere` those of other Changes that are
// known but not delivered, and `delivered` the identities that Change's own delivery judgement reports
// delivered. A predecessor is satisfied by being on main, or by being carried together with the Change and
// delivered. Matching record bytes alone are not delivery.
//
// The judge is pure: it reads no file, no process and no network, and it gates nothing. A fact it cannot read
// is UNKNOWN, never a pass. `require` is an optional list of the identities that must have stated their
// predecessors or stated none; a carried Change in it that states neither is a finding.

import { readSuccession } from "./succession.mjs";

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const isRecords = (value) => Array.isArray(value) && value.every((r) => r && typeof r.identity === "string" && r.identity !== "" && typeof r.text === "string");
const isNames = (value) => Array.isArray(value) && value.every((v) => typeof v === "string");

const ANSWERED = "declared none: every required Change has stated its predecessors, or stated that it has none, which is a statement and not the absence of one";
const NONE = "no declared prerequisite: no carried Change states a hard predecessor, which is not a claim that none exists";

export function checkPredecessor({ pinOf, main, carried, elsewhere, delivered, require } = {}) {
  const unreadable = [];
  if (typeof pinOf !== "function") unreadable.push({ kind: "unreadable", fact: "pinOf" });
  if (!isRecords(main)) unreadable.push({ kind: "unreadable", fact: "main" });
  if (!isRecords(carried)) unreadable.push({ kind: "unreadable", fact: "carried" });
  if (!isRecords(elsewhere)) unreadable.push({ kind: "unreadable", fact: "elsewhere" });
  if (!isNames(delivered)) unreadable.push({ kind: "unreadable", fact: "delivered" });
  if (require !== undefined && !isNames(require)) unreadable.push({ kind: "unreadable", fact: "require" });
  if (unreadable.length) return { kind: "unknown", findings: unreadable, note: "a fact cannot be read, so nothing is judged" };

  const under = new Set(carried.map((r) => r.identity));
  const there = new Set(elsewhere.map((r) => r.identity));
  const onMain = new Set(main.map((r) => r.identity));
  const done = new Set(delivered);
  // A carried record replaces the record main holds under the same identity.
  const records = [...main.filter((r) => !under.has(r.identity)), ...carried];
  let read;
  try {
    read = readSuccession(records, { pinOf, require });
  } catch {
    return { kind: "unknown", findings: [{ kind: "unreadable", fact: "pinOf" }], note: "a fact cannot be read, so nothing is judged" };
  }

  const findings = [];
  for (const f of read.findings) {
    if (f.kind === "cycle") {
      if (f.changes.some((c) => under.has(c))) findings.push(f);
    } else if (under.has(f.change)) {
      findings.push(f.kind === "unresolved" && there.has(f.predecessor) ? { ...f, kind: "elsewhere" } : f);
    }
  }
  const stated = read.edges.filter((edge) => under.has(edge.from));
  for (const edge of stated) {
    if (under.has(edge.to) ? !done.has(edge.to) : !onMain.has(edge.to))
      findings.push({ kind: "undelivered", change: edge.from, predecessor: edge.to });
  }
  findings.sort((a, b) => compare(a.change ?? a.changes[0], b.change ?? b.changes[0]) || compare(a.predecessor ?? "", b.predecessor ?? "") || compare(a.kind, b.kind));

  if (findings.length) return { kind: "fail", findings };
  return { kind: "pass", findings: [], note: stated.length ? "every declared predecessor is satisfied" : require?.length ? ANSWERED : NONE };
}
