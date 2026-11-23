// Case controls/T1114 tests: controls/F34
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const f = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/judge-mode.mjs');

export const id = 'controls/T1114';
export const tests = ['controls/F34'];
export const title = 'the ratchet is a filter in front of the verdict: with an empty baseline it removes nothing, so the verdict equals the preventive one';
export async function run() {
  assert.ok(existsSync(f), 'scripts/judge-mode.mjs is absent');
  const { applyBaseline, judgeMode } = await import(pathToFileURL(f).href);
  assert.equal(typeof applyBaseline, 'function', 'the filter is not separable from the verdict');
  const found = ['a', 'b'];
  const id0 = applyBaseline({ findings: found, baseline: [], previous: [] });
  assert.deepEqual(id0.remaining, found, 'an empty baseline removed findings');
  for (const findings of [[], found]) {
    const r = judgeMode({ mode: 'ratchet', findings, baseline: [], previous: [] });
    const p = judgeMode({ mode: 'preventive', findings });
    assert.deepEqual([r.verdict, r.blocked], [p.verdict, p.blocked], 'a spent ratchet did not judge like preventive');
  }
  const some = applyBaseline({ findings: found, baseline: ['a'], previous: ['a'] });
  assert.deepEqual([some.remaining, some.known], [['b'], ['a']], 'the filter did not subtract the allowance');
}
