// change/identify Conflict (change/C16): a detective judgement over open Changes and the paths they claim.
//
// identifyConflict({ pinOf, changes, resolved }) takes `changes: [{ identity, text, claimed }]`, the record of
// each open Change and the paths it claims that main does not hold, and optionally
// `resolved: [{ path, before, after }]`, the shared paths that synchronization has resolved. A path claimed by
// two Changes is a conflict. A declared edge between the two Changes orders them and does not resolve the
// overlap: an ordered conflict stays a conflict (`ordered: true`) until a stated resolution names the path for
// that pair. A stale or otherwise invalid edge orders nothing.
//
// The judge is pure: it reads no file, no process and no network, and it gates nothing. A fact it cannot read
// is UNKNOWN, never "no conflict".

import { readSuccession } from "./succession.mjs";

const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const isText = (value) => typeof value === "string" && value !== "";
const isNames = (value) => Array.isArray(value) && value.every(isText);

export function identifyConflict({ pinOf, changes, resolved } = {}) {
  const unreadable = [];
  if (typeof pinOf !== "function") unreadable.push({ kind: "unreadable", fact: "pinOf" });
  if (!Array.isArray(changes)) unreadable.push({ kind: "unreadable", fact: "changes" });
  else {
    for (const c of changes) {
      const name = c && isText(c.identity) ? c.identity : "a Change";
      if (!c || !isText(c.identity)) unreadable.push({ kind: "unreadable", change: name, fact: "identity" });
      else if (typeof c.text !== "string") unreadable.push({ kind: "unreadable", change: name, fact: "record" });
      else if (!isNames(c.claimed)) unreadable.push({ kind: "unreadable", change: name, fact: "claimed" });
    }
  }
  if (resolved !== undefined && !(Array.isArray(resolved) && resolved.every((r) => r && isText(r.path) && isText(r.before) && isText(r.after))))
    unreadable.push({ kind: "unreadable", fact: "resolved" });
  if (unreadable.length) return { kind: "unknown", findings: unreadable.sort((a, b) => compare(a.change ?? "", b.change ?? "")), note: "a fact cannot be read, so no conflict is judged absent" };

  let edges;
  try {
    const read = readSuccession(changes.map(({ identity, text }) => ({ identity, text })), { pinOf });
    // An edge inside a cycle is invalid and orders nothing: a cycle does not say which Change lands first.
    const cycles = read.findings.filter((f) => f.kind === "cycle").map((f) => f.changes);
    edges = read.edges.filter((e) => !cycles.some((group) => group.includes(e.from) && group.includes(e.to)));
  } catch {
    return { kind: "unknown", findings: [{ kind: "unreadable", fact: "pinOf" }], note: "a fact cannot be read, so no conflict is judged absent" };
  }
  const claims = new Map();
  for (const { identity, claimed } of changes) {
    for (const path of new Set(claimed)) claims.set(path, [...(claims.get(path) ?? []), identity].sort(compare));
  }

  const findings = [];
  for (const path of [...claims.keys()].sort(compare)) {
    const claimants = [...new Set(claims.get(path))];
    for (let i = 0; i < claimants.length; i += 1) {
      for (let j = i + 1; j < claimants.length; j += 1) {
        const pair = [claimants[i], claimants[j]];
        const [x, y] = pair;
        const xAfterY = edges.some((e) => e.from === x && e.to === y);
        const yAfterX = edges.some((e) => e.from === y && e.to === x);
        if (xAfterY === yAfterX) {
          findings.push({ kind: "conflict", path, changes: pair, ordered: false, resolved: false });
          continue;
        }
        const [before, after] = xAfterY ? [y, x] : [x, y];
        const stated = (resolved ?? []).some((r) => r.path === path && r.before === before && r.after === after);
        findings.push(stated
          ? { kind: "resolved", path, changes: pair, before, after, ordered: true, resolved: true }
          : { kind: "conflict", path, changes: pair, before, after, ordered: true, resolved: false });
      }
    }
  }
  return { kind: findings.some((f) => f.kind === "conflict") ? "fail" : "pass", findings };
}
