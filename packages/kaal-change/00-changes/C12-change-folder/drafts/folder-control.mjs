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
  for (const p of view.files.filter((p) => p.endsWith("/kaal-guard.json"))) {
    const m = CHANGE_FOLDER.exec(p);
    if (m && p === `${m[1]}/kaal-guard.json` && closed(view, m[1])) out.push(finding("stale-registration", p, "the folder holds act.md, so the Change is closed and its registration ends"));
  }
  return out;
}

const registrations = (view) => view.files.filter((p) => /\/00-changes\/C[^/]+\/kaal-guard\.json$/.test(p));
const checksOf = (view, path) => { try { return JSON.parse(view.read(path)).checks ?? []; } catch { return []; } };
const plan = (path, id) => `${path}:${id}`;

/** The checks a deleted Change registration retires, as Guard names them: { folder, id, plan, run }. Read from `before`. */
export function retiring({ before, head }) {
  const headFiles = new Set(head.files);
  return registrations(before).filter((p) => !headFiles.has(p)).flatMap((p) => checksOf(before, p).map((c) => ({ folder: posix.dirname(p), id: c.id, plan: plan(p, c.id), run: c.run })));
}

/** Whether an evaluation can count, as `assess` decides it (change/F27). */
const counts = (e) => e && typeof e === "object" && [e.run, e.plan, e.result].every((x) => typeof x === "string" && x) && e.cases && typeof e.cases === "object" && Array.isArray(e.findings) && e.findings.length === 0;

/**
 * The deletion of a Change's kaal-guard.json: continuity of effective verification, never particular Case files.
 * `before` is the state the deletion starts from, `head` the state after, `from` the state before the Change, and
 * `evidence` the evaluations of the run that judged `head`. Applies only when a registration is deleted.
 */
export function judgeRetirement({ before, head, from, evidence }) {
  const out = [];
  const retired = retiring({ before, head });
  const headFiles = new Set(head.files);
  const deleted = registrations(before).filter((p) => !headFiles.has(p));
  if (!deleted.length) return out;
  for (const reg of deleted) {
    const folder = posix.dirname(reg);
    if (!headFiles.has(`${folder}/act.md`)) out.push(finding("not-closed", folder, "the registration is deleted but the folder holds no act.md"));
    // History is the Change's records. Executable files (Cases, helpers) are free to move, split, consolidate, be rewritten, replaced or removed.
    for (const p of before.files.filter((p) => p.startsWith(`${folder}/`) && p !== reg && !EXECUTABLE.test(p) && !headFiles.has(p))) out.push(finding("history-removed", p, "a closed Change keeps its records"));
  }
  const evaluations = Array.isArray(evidence?.evaluations) && typeof evidence?.by === "string" ? evidence.evaluations.filter(counts) : [];
  if (!evaluations.length) { out.push(finding("no-evidence", deleted[0], "no counted evaluation of the head: the control cannot judge, and that is not a pass")); return out; }
  // The retiring checks must not hide a failure from the ACT's own final CI.
  for (const r of retired) {
    const ev = evaluations.filter((e) => e.plan === r.plan);
    if (!ev.length) out.push(finding("retiring-check-not-evaluated", r.plan, "the head was not judged by the check being retired"));
    for (const e of ev) for (const [id, result] of Object.entries(e.cases)) if (result !== "passed") out.push(finding("retiring-check-failing", r.plan, `${id} is ${result}`));
  }
  // Continuity: each touched element is verified at the head by a surviving registered check.
  const surviving = new Set(head.files.filter((p) => p.endsWith("/kaal-guard.json")).flatMap((p) => checksOf(head, p).map((c) => plan(p, c.id))));
  const retiringPlans = new Set(retired.map((r) => r.plan));
  const changed = new Set([...head.files.filter((p) => !from.files.includes(p) || from.read(p) !== head.read(p)), ...from.files.filter((p) => !headFiles.has(p))]);
  const touched = new Set([...changed].map((p) => ELEMENT_FOLDER.exec(p)).filter(Boolean).map((m) => m[1]));
  const claims = new Map();
  for (const p of head.files.filter(isCase)) { const cid = idOf(head.read(p)); if (cid) for (const t of testsOf(head.read(p))) claims.set(t, [...(claims.get(t) ?? []), cid]); }
  for (const dir of touched) {
    const elementId = ELEMENT_FOLDER.exec(`${dir}/x`)[2];
    const mine = [...claims].filter(([t]) => t.endsWith(`/${elementId}`)).flatMap(([, ids]) => ids);
    const verified = evaluations.some((e) => surviving.has(e.plan) && !retiringPlans.has(e.plan) && mine.some((cid) => e.cases[cid] === "passed"));
    if (!verified) out.push(finding("touched-element-unverified", dir, `${elementId}: no Case that claims it passed in a counted evaluation of a registered check that survives`));
  }
  return out;
}
