// Case controls/T1716 tests: controls/F220
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1716';
export const tests = ['controls/F220'];
export const title = 'the ratchet library has its run, step and strategy files, the strategy gives what judgeRun gives, and it imports only its own files and the base contract';
export async function run() {
  const run = await load('lib/ratchet/run.mjs');
  const step = await load('lib/ratchet/step.mjs');
  const { ratchetStrategy } = await load('lib/ratchet/strategy.mjs');
  const old = await load('ratchet.mjs');
  assert.deepEqual(Object.keys(run).sort(), ['applyBaseline', 'judgeRun']);
  assert.deepEqual(Object.keys(step).sort(), ['judgeAdoption', 'judgeProgress', 'judgeRatchetStep', 'judgeRetirement']);
  assert.equal(ratchetStrategy.name, 'ratchet'); assert.equal(typeof ratchetStrategy.judge, 'function');
  const table = [
    { findings: ['a'], baseline: ['a'], previous: ['a'] },
    { findings: ['a', 'b'], baseline: ['a'], previous: ['a'] },
    { findings: [], baseline: [], previous: [] },
    { findings: [], baseline: ['a'], previous: ['a'] },
    { findings: ['a'], baseline: ['a', 'z'], previous: ['a'] },
    { findings: null, baseline: ['a'], previous: ['a'] },
  ];
  for (const t of table) {
    assert.deepEqual(ratchetStrategy.judge(t), old.judgeRun(t));
    assert.deepEqual(run.judgeRun(t), old.judgeRun(t));
  }
  const dir = join(S, 'lib/ratchet');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mjs'))) {
    for (const s of specs(readFileSync(join(dir, f), 'utf8'))) assert.ok(/^\.\/[a-z-]+\.mjs$/.test(s) || s === '../contract.mjs', `lib/ratchet/${f} imports ${s}`);
  }
}
