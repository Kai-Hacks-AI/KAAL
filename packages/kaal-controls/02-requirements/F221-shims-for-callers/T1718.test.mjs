// Case controls/T1718 tests: controls/F221
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1718';
export const tests = ['controls/F221'];
export const title = 'the old paths of ratchet, judge-mode and judge-ratchet are deprecated shims, the pair works when only those two files are fetched (as release/T1431 does), and the shim holds the library code';
const body = (t) => t.split('\n').filter((l) => !/^\s*(\/\/|import )/.test(l)).join('\n').replace(/\s+/g, ' ').trim();
export async function run() {
  const pkg = JSON.parse(readFileSync(join(S, '../../../package.json'), 'utf8'));
  for (const f of ['ratchet.mjs', 'judge-mode.mjs', 'judge-ratchet.mjs']) {
    assert.match(readFileSync(join(S, f), 'utf8'), /DEPRECATED shim/, `${f} is no deprecated shim`);
    assert.ok(pkg.files.includes(`!skills/kaal-controls/scripts/${f}`), `${f} is not left out of the published files`);
  }
  assert.deepEqual(specs(readFileSync(join(S, 'ratchet.mjs'), 'utf8')), []);
  for (const s of specs(readFileSync(join(S, 'judge-mode.mjs'), 'utf8'))) assert.ok(s === './ratchet.mjs' || s.startsWith('node:'), `judge-mode.mjs imports ${s}`);
  const tmp = mkdtempSync(join(tmpdir(), 't1718-'));
  try {
    for (const f of ['judge-mode.mjs', 'ratchet.mjs']) copyFileSync(join(S, f), join(tmp, f));
    const m = await import(pathToFileURL(join(tmp, 'judge-mode.mjs')).href);
    assert.equal(m.judgeMode({ mode: 'ratchet', findings: ['a'], baseline: ['a'], previous: ['a'] }).verdict, 'PASS');
    assert.equal(m.judgeMode({ mode: 'ratchet', findings: ['a', 'b'], baseline: ['a'], previous: ['a'] }).verdict, 'FAIL');
    assert.equal(m.judgeMode({ mode: 'preventive', findings: ['a'] }).verdict, 'FAIL');
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  const lib = body(readFileSync(join(S, 'lib/ratchet/run.mjs'), 'utf8'));
  assert.ok(body(readFileSync(join(S, 'ratchet.mjs'), 'utf8')).includes(lib.slice(0, 400)), 'ratchet.mjs no longer holds the code of lib/ratchet/run.mjs');
  assert.equal(typeof (await load('judge-ratchet.mjs')).judgeRatchetStep, 'function');
}
