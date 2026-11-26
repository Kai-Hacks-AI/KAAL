// Case release/T1535 tests: release/D19
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const id = 'release/T1535';
export const tests = ['release/D19'];
export const title = 'the Dispatcher reads from the files of the collector whether its carried Changes are reflected by a retro and decides from that, whatever the pull request says: ready raises, not ready and nothing carried are reported and quiet, a carried Change with no readable id is red';
export async function run() {
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  const script = join(repo, 'engineering/release-management/05-src/promotion-raise/dispatch.mjs');
  const sha = 'a'.repeat(40);
  const tmp = mkdtempSync(join(tmpdir(), 't1535-'));
  const put = (tree, rel, text) => { mkdirSync(join(tree, rel, '..'), { recursive: true }); writeFileSync(join(tree, rel), text); };
  const record = (tree, dir, cid, title = 't') => put(tree, `engineering/x/00-changes/${dir}/${cid.split('/')[1]}.md`, `---\nid: ${cid}\ntitle: ${title}\n---\n`);
  const retro = (tree, n, reflects) => put(tree, `engineering/x/02-learnings/retros/RT${n}.md`, `---\nid: x/RT${n}\nformat: 4L\nreflects: [${reflects.join(', ')}]\n---\nbody\n`);
  const world = (name, build) => {
    const main = join(tmp, name, 'main'), collector = join(tmp, name, 'collector');
    record(main, 'C1-old', 'x/C1'); record(collector, 'C1-old', 'x/C1');
    build(collector);
    return { main, collector };
  };
  const final = ({ main, collector }, body = 'free text, no convention at all', title = 'whatever') => {
    const out = join(tmp, `out-${Math.random()}`);
    const r = spawnSync(process.execPath, [script, 'final'], { encoding: 'utf8', env: { ...process.env, KAAL_REPO: 'o/r', KAAL_PR_MERGED: 'true', KAAL_PR_BASE: 'kaal/x/y', KAAL_PR_MERGE_SHA: sha, KAAL_PR_BODY: body, KAAL_PR_TITLE: title, KAAL_MAIN_DIR: main, KAAL_COLLECTOR_DIR: collector, GITHUB_OUTPUT: out } });
    let output = ''; try { output = readFileSync(out, 'utf8'); } catch { /* none */ }
    return { code: r.status, said: `${r.stdout}\n${r.stderr}`, output };
  };
  try {
    const ready = final(world('ready', (c) => { record(c, 'C2-new', 'x/C2', 'the new thing'); retro(c, 1, ['x/C2']); }));
    assert.equal(ready.code, 0);
    assert.match(ready.output, /"action":"raise"/, 'a collector whose carried Change is reflected by a retro raises, whatever the body says');
    assert.match(ready.output, /x\/C2/, 'the PROMOTION is titled from the records');
    const before = final(world('before', (c) => { record(c, 'C2-new', 'x/C2'); }));
    assert.equal(before.code, 0, 'a carried Change with no retro is quiet');
    assert.doesNotMatch(before.output, /"action":"raise"/);
    assert.match(before.said, /x\/C2/, 'the report names the carried Change that no retro reflects');
    const partial = final(world('partial', (c) => { record(c, 'C2-new', 'x/C2'); record(c, 'C3-next', 'x/C3'); retro(c, 1, ['x/C2']); }));
    assert.equal(partial.code, 0);
    assert.doesNotMatch(partial.output, /"action":"raise"/, 'one carried Change is still unreflected');
    assert.match(partial.said, /x\/C3/);
    const nothing = final(world('nothing', () => {}));
    assert.equal(nothing.code, 0, 'a collector that carries nothing, a SYNC, is quiet');
    assert.doesNotMatch(nothing.output, /"action":"raise"/);
    const bad = final(world('bad', (c) => { put(c, 'engineering/x/00-changes/C9-bad/notes.md', 'no record here'); }));
    assert.notEqual(bad.code, 0, 'a carried Change with no readable id is red');
    assert.match(bad.said, /C9-bad/, 'and the report names the folder');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
