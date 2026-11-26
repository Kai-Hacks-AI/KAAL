// Case release/T1536 tests: release/D19
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const id = 'release/T1536';
export const tests = ['release/D19'];
export const title = 'what a merge into a collector brought is classified from the paths it changed on its own, never from the pull request: plan paths are a PLAN, source paths a DO, retros an ACT, paths main already holds a SYNC, and a retro together with source paths is mixed and red';
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  const script = join(repo, 'engineering/release-management/05-src/promotion-raise/dispatch.mjs');
  const tmp = mkdtempSync(join(tmpdir(), 't1536-'));
  const put = (tree, rel, text = 'x\n') => { mkdirSync(join(tree, rel, '..'), { recursive: true }); writeFileSync(join(tree, rel), text); };
  const base = (tree) => { put(tree, 'engineering/x/00-changes/C1-old/C1.md', '---\nid: x/C1\ntitle: t\n---\n'); put(tree, 'engineering/x/00-changes/C2-new/C2.md', '---\nid: x/C2\ntitle: t\n---\n'); };
  // before: the collector before the merge; after: the merge result; contained: main as the result holds it.
  const world = (name, change, fromMain = []) => {
    const before = join(tmp, name, 'before'), after = join(tmp, name, 'after'), contained = join(tmp, name, 'contained'), main = join(tmp, name, 'main');
    for (const t of [before, after, contained, main]) base(t);
    for (const t of [after, contained]) for (const p of fromMain) put(t, p, 'from main\n');
    for (const p of change) put(after, p, 'own\n');
    return { before, after, contained, main };
  };
  const inflow = (w) => {
    const r = spawnSync(process.execPath, [script, 'final'], { encoding: 'utf8', env: { ...process.env, KAAL_REPO: 'o/r', KAAL_PR_MERGED: 'true', KAAL_PR_BASE: 'kaal/x/y', KAAL_PR_MERGE_SHA: 'a'.repeat(40), KAAL_PR_BODY: 'free text', KAAL_PR_TITLE: 'whatever', KAAL_BEFORE_DIR: w.before, KAAL_COLLECTOR_DIR: w.after, KAAL_MAIN_DIR: w.main, KAAL_CONTAINED_DIR: w.contained } });
    const line = r.stdout.split('\n').find((l) => l.startsWith('{')) ?? '{}';
    let d = {}; try { d = JSON.parse(line); } catch { /* none */ }
    return { code: r.status, inflow: d.inflow };
  };
  try {
    assert.equal(inflow(world('plan', ['engineering/x/00-changes/C2-new/change.md'])).inflow, 'PLAN');
    assert.equal(inflow(world('do', ['engineering/x/05-src/thing.mjs'])).inflow, 'DO');
    const act = inflow(world('act', ['engineering/x/02-learnings/retros/RT1.md']));
    assert.equal(act.inflow, 'ACT'); assert.equal(act.code, 0);
    const sync = inflow(world('sync', [], ['engineering/y/05-src/arrived.mjs']));
    assert.equal(sync.inflow, 'SYNC'); assert.equal(sync.code, 0);
    const mixed = inflow(world('mixed', ['engineering/x/02-learnings/retros/RT1.md', 'engineering/x/05-src/thing.mjs']));
    assert.equal(mixed.inflow, 'mixed'); assert.notEqual(mixed.code, 0, 'a merge the files cannot place is red');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
