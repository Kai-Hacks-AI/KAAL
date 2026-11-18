// DRAFT of skills/kaal-change/scripts/folder-control.mjs (change/A26). The DO moves it there. Pure: views in, findings out.
// A view is { files: string[], read(path): string }. Nothing here reads a file, runs a program or writes.
import { posix } from "node:path";

/** The change kinds: C (Change), G (Gap), D (defect). Every other kind is a target kind. The Change Record Definition states this set. */
export const CHANGE_KINDS = Object.freeze(["C", "G", "D"]);
const kindOf = (id) => /([A-Za-z]+)\d+$/.exec(id)?.[1];
const CHANGE_FOLDER = /^(.*\/00-changes\/C[^/]+)\//;
const ELEMENT_FOLDER = /^(.*\/0[1-4]-[^/]+\/([A-Z]+\d+)(?:-[^/]*)?)\//;
const isCase = (p) => /\/T\d+\.test\.mjs$/.test(p);
const testsOf = (text) => [...(/export const tests = \[([^\]]*)\]/.exec(text ?? "")?.[1] ?? "").matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
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
        if (inside && !CHANGE_KINDS.includes(kindOf(id))) out.push(finding("target-case-in-change-folder", p, `tests ${id}: an element's Case belongs beside the element`));
        if (!inside && ["C", "G"].includes(kindOf(id)) && /\/0[0-6]-/.test(p)) out.push(finding("change-case-outside-change-folder", p, `tests ${id}: a Change's Case belongs in its folder`));
      }
    }
    const doc = /^([A-Z]+)\d+(-.*)?\.md$/.exec(posix.basename(p));
    if (doc && !inside && ["C", "G"].includes(doc[1]) && /\/0[1-6]-/.test(p)) out.push(finding("change-document-outside-change-folder", p, `${doc[1]} documents belong in a Change folder`));
  }
  for (const p of view.files.filter((p) => p.endsWith("/kaal-guard.json"))) {
    const m = CHANGE_FOLDER.exec(p);
    if (m && p === `${m[1]}/kaal-guard.json` && closed(view, m[1])) out.push(finding("stale-registration", p, "the folder holds act.md, so the Change is closed and its registration ends"));
  }
  return out;
}

/**
 * The deletion of a Change's kaal-guard.json. `before` is the state the deletion starts from, `head` the state after,
 * `from` the state before the Change. Applies only when a registration is deleted; element Cases are read from `head`, so removing one with the registration is caught.
 */
export function judgeRetirement({ before, head, from }) {
  const out = [];
  const headFiles = new Set(head.files);
  const deleted = before.files.filter((p) => /\/00-changes\/C[^/]+\/kaal-guard\.json$/.test(p) && !headFiles.has(p));
  for (const reg of deleted) {
    const folder = posix.dirname(reg);
    if (!headFiles.has(`${folder}/act.md`)) out.push(finding("not-closed", folder, "the registration is deleted but the folder holds no act.md"));
    for (const p of before.files.filter((p) => p.startsWith(`${folder}/`) && p !== reg && !headFiles.has(p))) out.push(finding("history-removed", p, "a closed Change keeps its Cases and evidence"));
  }
  if (!deleted.length) return out;
  const changed = new Set([...head.files.filter((p) => !from.files.includes(p) || from.read(p) !== head.read(p)), ...from.files.filter((p) => !headFiles.has(p))]);
  const touched = new Set([...changed].map((p) => ELEMENT_FOLDER.exec(p)).filter(Boolean).map((m) => m[1]));
  for (const dir of touched) {
    const id = ELEMENT_FOLDER.exec(`${dir}/x`)[2];
    const has = head.files.some((p) => p.startsWith(`${dir}/`) && isCase(p) && testsOf(head.read(p)).some((t) => t.endsWith(`/${id}`)));
    if (!has) out.push(finding("touched-element-without-target-case", dir, `no Case under ${dir} tests ${id}`));
  }
  return out;
}
