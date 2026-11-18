// DRAFT of skills/kaal-change/scripts/folder-control.mjs (change/A26). The DO moves it there. Pure: views and evidence in, findings out.
// A view is { files: string[], read(path): string }. Evidence is { by, evaluations } as `assess` reads it. Nothing here reads a file, runs a program or writes.
import { posix } from "node:path";

/** The change kinds: C (Change) and G (Gap). Every other kind, a Defect (D) included, is a target kind. The Change Record Definition states this set. */
export const CHANGE_KINDS = Object.freeze(["C", "G"]);
const kindOf = (id) => /([A-Za-z]+)\d+$/.exec(id)?.[1];
const CHANGE_FOLDER = /^(.*\/00-changes\/C[^/]+)\//;
const ELEMENT_FOLDER = /^(.*\/0[1-4]-[^/]+\/([A-Z]+\d+)(?:-[^/]*)?)\//;
const isCase = (p) => /\/T\d+\.test\.mjs$/.test(p);
const EXECUTABLE = /\.(mjs|cjs|js|ts)$/;
const field = (text, name) => [...(new RegExp(`export const ${name} = (\\[[^\\]]*\\]|'[^']*'|"[^"]*")`).exec(text ?? "")?.[1] ?? "").matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
const testsOf = (text) => field(text, "tests");
const idOf = (text) => field(text, "id")[0];
const finding = (rule, path, detail) => ({ rule, path, detail });

/** A Change folder is closed when it holds act.md. */
export const closed = (view, folder) => view.files.includes(`${folder}/act.md`);

/** Orientation: change-oriented inside a Change folder, target-oriented everywhere else. */
export function judgeFolders(view) {
  const out = [];
  for (const p of view.files) {
    const inside = CHANGE_FOLDER.test(p);
    if (isCase(p)) {
      for (const id of testsOf(view.read(p))) {
        if (inside && !CHANGE_KINDS.includes(kindOf(id))) out.push(finding("target-case-in-change-folder", p, `tests ${id}: the verification of an enduring object belongs beside it`));
        if (!inside && CHANGE_KINDS.includes(kindOf(id)) && /\/0[0-6]-/.test(p)) out.push(finding("change-case-outside-change-folder", p, `tests ${id}: a Change's Case belongs in its folder`));
      }
    }
    const doc = /^([A-Z]+)\d+(-.*)?\.md$/.exec(posix.basename(p));
    if (doc && inside && !CHANGE_KINDS.includes(doc[1])) out.push(finding("target-document-in-change-folder", p, `a ${doc[1]} document describes an enduring object and belongs beside it`));
    if (doc && !inside && CHANGE_KINDS.includes(doc[1]) && /\/0[1-6]-/.test(p)) out.push(finding("change-document-outside-change-folder", p, `${doc[1]} documents belong in a Change folder`));
  }
  // A registration is passive: it runs the Change check, which derives the state, and never the Cases directly. A closed folder keeps it and goes cold.
  for (const p of view.files.filter((p) => /\/00-changes\/C[^/]+\/kaal-guard\.json$/.test(p))) {
    for (const c of checksOf(view, p)) if (!/change-check/.test(c.run ?? "") || /node --test/.test(c.run ?? "")) out.push(finding("registration-not-passive", p, `check ${c.id} runs Cases directly: it must run the Change check, which goes cold when the Change is closed`));
  }
  return out;
}

const registrations = (view) => view.files.filter((p) => /\/00-changes\/C[^/]+\/kaal-guard\.json$/.test(p));
const checksOf = (view, path) => { try { return JSON.parse(view.read(path)).checks ?? []; } catch { return []; } };
const plan = (path, id) => `${path}:${id}`;

/**
 * The state of a Change folder, from the PR's two views. Derived, never stored: `closed` (act.md at base: cold, nothing to run),
 * `closing` (act.md added at head: this is the ACT), `open` (no act.md at head).
 */
export function stateOf({ base, head }, folder) {
  if (closed(base, folder)) return "closed";
  return closed(head, folder) ? "closing" : "open";
}

/** Counts are { red, green, unknown }, supplied by Testing's runner. */
const n = (x) => (Number.isInteger(x) && x >= 0 ? x : NaN);

/** What one run of the Change check concludes by state alone. Closed passes; closing needs RED 0 and UNKNOWN 0; UNKNOWN never passes. */
export function verdict({ state, counts }) {
  if (state === "closed") return [];
  const red = n(counts?.red), unknown = n(counts?.unknown);
  if (Number.isNaN(red) || Number.isNaN(unknown)) return [finding("no-counts", "", "the runner supplied no counts: that is not a pass")];
  const out = [];
  if (unknown > 0) out.push(finding("unknown-case", "", `${unknown} Case(s) are UNKNOWN: never a pass`));
  if (state === "closing" && red > 0) out.push(finding("act-not-green", "", `${red} Case(s) are RED: ACT needs all GREEN`));
  return out;
}

/** The reverse ratchet on the count of RED Cases, base against head. PLAN: same or up. DO: same or down, UNKNOWN may not rise. ACT: all GREEN. */
export function ratchet({ phase, base, head }) {
  const b = n(base?.red), h = n(head?.red);
  if (Number.isNaN(b) || Number.isNaN(h)) return [finding("no-counts", "", "counts are missing at base or head")];
  if (phase === "plan") return h < b ? [finding("plan-red-fell", "", `RED fell from ${b} to ${h}: a PLAN may not lower it`)] : [];
  if (phase === "do") return [...(h > b ? [finding("do-red-rose", "", `RED rose from ${b} to ${h}: a DO may not raise it`)] : []), ...(n(head?.unknown) > n(base?.unknown) ? [finding("do-unknown-rose", "", "a DO may not raise UNKNOWN: lowering RED by breaking a Case is not progress")] : [])];
  if (phase === "act") return verdict({ state: "closing", counts: head });
  return [finding("unknown-phase", "", `phase ${phase}: expected plan, do or act`)];
}

const IDS = /\b[a-z][a-z0-9-]*\/[A-Z]+\d+\b/g;
/** The ids a Change names: every id in its own records (the Change document and its Gap table). The scope is derived, never listed by hand. */
export const named = (view, folder) => new Set(view.files.filter((p) => p.startsWith(`${folder}/`) && p.endsWith(".md")).flatMap((p) => view.read(p).match(IDS) ?? []));

/** Every Case in scope: a Case in the folder, or beside an element, that tests an id the Change names. */
export function scope(view, folder) {
  const ids = named(view, folder);
  return view.files.filter(isCase).filter((p) => p.startsWith(`${folder}/`) || testsOf(view.read(p)).some((t) => ids.has(t)));
}

/** A Case the diff adds or changes that tests an id the Change does not name is a finding: the Change must be adjusted to name the new Gap. */
export function judgeNaming({ base, head, folder }) {
  const ids = named(head, folder);
  const changed = head.files.filter(isCase).filter((p) => !base.files.includes(p) || base.read(p) !== head.read(p));
  return changed.flatMap((p) => testsOf(head.read(p)).filter((t) => !ids.has(t)).map((t) => finding("case-not-named", p, `tests ${t}, which the Change does not name`)));
}

/** Whether an evaluation can count, as `assess` decides it (change/F27). */
const counts = (e) => e && typeof e === "object" && [e.run, e.plan, e.result].every((x) => typeof x === "string" && x) && e.cases && typeof e.cases === "object" && Array.isArray(e.findings) && e.findings.length === 0;
const inChange = (plan) => /\/00-changes\/C[^/]+\/kaal-guard\.json:/.test(plan);

/**
 * The ACT closes the folder (act.md added) and the registration stays. Continuity of effective verification, never particular Case files:
 * `base` is the state the ACT starts from, `head` the state after, `from` the state before the Change, `evidence` the evaluations of the run that judged `head`.
 * Applies only when act.md is added.
 */
export function judgeClosing({ base, head, from, evidence }) {
  const out = [];
  const folders = [...new Set(head.files.filter((p) => /\/00-changes\/C[^/]+\/act\.md$/.test(p) && !base.files.includes(p)).map((p) => posix.dirname(p)))];
  if (!folders.length) return out;
  for (const folder of folders) {
    // History is the Change's records. Executable files (Cases, helpers) are free to move, split, consolidate, be rewritten, replaced or removed.
    for (const p of base.files.filter((p) => p.startsWith(`${folder}/`) && !EXECUTABLE.test(p) && !head.files.includes(p))) out.push(finding("history-removed", p, "a closed Change keeps its records"));
  }
  const evaluations = Array.isArray(evidence?.evaluations) && typeof evidence?.by === "string" ? evidence.evaluations.filter(counts) : [];
  if (!evaluations.length) { out.push(finding("no-evidence", folders[0], "no counted evaluation of the head: the control cannot judge, and that is not a pass")); return out; }
  // The Change's own checks must be GREEN in the run that judged the closing head.
  const own = new Set(folders.flatMap((f) => (head.files.includes(`${f}/kaal-guard.json`) ? checksOf(head, `${f}/kaal-guard.json`).map((c) => plan(`${f}/kaal-guard.json`, c.id)) : [])));
  for (const o of own) {
    const ev = evaluations.filter((e) => e.plan === o);
    if (!ev.length) out.push(finding("closing-check-not-evaluated", o, "the head was not judged by the Change check"));
    for (const e of ev) for (const [id, result] of Object.entries(e.cases)) if (result !== "passed") out.push(finding("closing-check-failing", o, `${id} is ${result}`));
  }
  // Continuity: each touched element is verified at the head by a registered check outside any Change folder, and no relevant Case of such a check fails.
  const surviving = new Set(head.files.filter((p) => p.endsWith("/kaal-guard.json")).flatMap((p) => checksOf(head, p).map((c) => plan(p, c.id))).filter((x) => !inChange(x)));
  const headFiles = new Set(head.files);
  const changed = new Set([...head.files.filter((p) => !from.files.includes(p) || from.read(p) !== head.read(p)), ...from.files.filter((p) => !headFiles.has(p))]);
  const touched = new Set([...changed].map((p) => ELEMENT_FOLDER.exec(p)).filter(Boolean).map((m) => m[1]));
  const claims = new Map();
  for (const p of head.files.filter(isCase)) { const cid = idOf(head.read(p)); if (cid) for (const t of testsOf(head.read(p))) claims.set(t, [...(claims.get(t) ?? []), cid]); }
  for (const dir of touched) {
    const elementId = ELEMENT_FOLDER.exec(`${dir}/x`)[2];
    const mine = [...claims].filter(([t]) => t.endsWith(`/${elementId}`)).flatMap(([, ids]) => ids);
    // Every result a surviving check reports for a Case that claims the element counts: one pass never covers another Case's failure.
    const results = evaluations.filter((e) => surviving.has(e.plan)).flatMap((e) => mine.filter((cid) => cid in e.cases).map((cid) => [cid, e.cases[cid], e.plan]));
    for (const [cid, result, evaluated] of results.filter(([, r]) => r !== "passed")) out.push(finding("touched-element-failing", dir, `${elementId}: ${cid} is ${result} in ${evaluated}`));
    if (!results.some(([, r]) => r === "passed")) out.push(finding("touched-element-unverified", dir, `${elementId}: no Case that claims it passed in a counted evaluation of a check outside the Change folder`));
  }
  return out;
}
