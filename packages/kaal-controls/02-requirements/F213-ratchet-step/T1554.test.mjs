// Case controls/T1554 tests: controls/F213
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/judge-ratchet.mjs');
export const id = 'controls/T1554';
export const tests = ['controls/F213'];
export const title = 'the step of a ratchet is judged from the files of the base and the head: adoption, shrink and retirement are told apart, and nothing unreadable passes';
const window = { from: '2026-11-25T08:00Z', to: '2026-11-25T12:00Z' };
const L = (o) => JSON.stringify(o);
const adoption = { at: '2026-11-25T09:00Z', change: 'rel/C134', from: null, to: 3, removed: [] };
const shrink = { at: '2026-11-25T10:00Z', change: 'rel/C140', from: 3, to: 2, removed: ['c'] };
const carried = (id) => [{ id, exists: true }];
const files = (baseline, ...lines) => ({ baseline: baseline === null ? null : L(baseline), history: lines.length ? lines.map(L).join('\n') + '\n' : null });
export async function run() {
  assert.ok(existsSync(lib), 'scripts/judge-ratchet.mjs is absent');
  const { judgeRatchetStep } = await import(pathToFileURL(lib).href);
  assert.equal(typeof judgeRatchetStep, 'function', 'judgeRatchetStep is not exported');
  const j = (base, head, c, w = window) => judgeRatchetStep({ base, head, carried: c, window: w });
  const is = (r, verdict, step, reason) => { assert.equal(r.verdict, verdict, `${step}: ${JSON.stringify(r)}`); assert.equal(r.step, step, `step of ${JSON.stringify(r)}`); if (reason) assert.equal(r.reason, reason); };
  // the three steps are told apart from the files alone
  is(j(files(null), files(['a', 'b', 'c'], adoption), carried('rel/C134')), 'PASS', 'adoption');
  is(j(files(['a', 'b', 'c']), files(['a', 'b', 'c'], adoption), carried('rel/C134')), 'PASS', 'adoption');
  is(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption, shrink), carried('rel/C140')), 'PASS', 'progress');
  is(j(files([], adoption, { ...adoption, at: '2026-11-25T09:30Z', from: 3, to: 0, removed: ['a', 'b', 'c'] }), files(null, adoption, { ...adoption, at: '2026-11-25T09:30Z', from: 3, to: 0, removed: ['a', 'b', 'c'] }), []), 'PASS', 'retirement');
  // nothing changed: nothing to judge, and no Change is needed
  is(j(files(['a'], { ...adoption, to: 1 }), files(['a'], { ...adoption, to: 1 }), []), 'PASS', 'unchanged');
  is(j(files(null), files(null), []), 'PASS', 'unchanged');
  // each judgement is the library's: its reasons come through
  is(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption), carried('rel/C140')), 'FAIL', 'progress', 'history-missing');
  is(j(files(['a', 'b', 'c'], adoption), files(['a', 'b', 'c', 'd'], adoption), carried('rel/C140')), 'FAIL', 'progress', 'baseline-grew');
  is(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption, shrink), carried('rel/C999')), 'FAIL', 'progress', 'change-mismatch');
  is(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption, shrink), [{ id: 'rel/C140', exists: false }]), 'FAIL', 'progress', 'change-unknown');
  is(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption, { ...shrink, at: '2026-11-25T13:00Z' }), carried('rel/C140')), 'FAIL', 'progress', 'time-out-of-window');
  is(j(files(null), files(['a', 'b', 'c'], { ...adoption, to: 2 }), carried('rel/C134')), 'FAIL', 'adoption', 'line-mismatch');
  is(j(files(['a'], { ...adoption, to: 1 }), files(['a'], { ...adoption, to: 1 }, shrink), carried('rel/C140')), 'FAIL', 'progress', 'history-without-change');
  // absent is not empty: a file the caller could not read is not "no file" (null), it is unreadable
  const bad = (x) => { assert.equal(x.verdict, 'UNKNOWN', `not UNKNOWN: ${JSON.stringify(x)}`); };
  bad(j(files(['a', 'b', 'c'], adoption), { baseline: '[not json', history: L(shrink) }, carried('rel/C140')));
  bad(j(files(['a', 'b', 'c'], adoption), { baseline: L(['a', 'a']), history: L(shrink) }, carried('rel/C140')));
  bad(j(files(['a', 'b', 'c'], adoption), { baseline: L(['a']), history: '{"at":' }, carried('rel/C140')));
  bad(j({ baseline: undefined, history: null }, files(['a'], { ...adoption, to: 1 }), carried('rel/C134')));
  bad(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption, shrink), []));
  bad(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption, shrink), [...carried('rel/C140'), ...carried('rel/C141')]));
  bad(j(files(['a', 'b', 'c'], adoption), files(['a', 'b'], adoption, shrink), carried('rel/C140'), null));
  bad(judgeRatchetStep({ carried: carried('x'), window }));
  bad(judgeRatchetStep());
}
