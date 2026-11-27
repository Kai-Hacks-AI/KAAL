// Case controls/T1713 tests: controls/F218
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1713';
export const tests = ['controls/F218'];
export const title = 'the base contract exports the verdicts and the revision rule and imports nothing: a revision is a full commit id, an abbreviation or a label is not';
const H40 = 'a'.repeat(40); const H64 = 'B'.repeat(64);
export async function run() {
  const c = await load('lib/contract.mjs');
  assert.deepEqual(Object.keys(c).sort(), ['VERDICTS', 'isRevision', 'isVerdict', 'sameRevision']);
  assert.deepEqual(c.VERDICTS, ['PASS', 'REPORT', 'FAIL', 'UNKNOWN']);
  assert.equal(c.isVerdict({ verdict: 'PASS', blocked: false }), true);
  assert.equal(c.isVerdict({ verdict: 'UNKNOWN', blocked: true, reason: 'x' }), true);
  for (const bad of [{ verdict: 'MAYBE', blocked: false }, { verdict: 'PASS' }, { verdict: 'PASS', blocked: 'no' }, null, 'PASS', [], undefined]) assert.equal(c.isVerdict(bad), false);
  for (const ok of [H40, H64, 'A'.repeat(40), '0123456789abcdef0123456789ABCDEF01234567']) assert.equal(c.isRevision(ok), true);
  for (const bad of ['abc', 'r1', '', 'a'.repeat(39), 'a'.repeat(41), 'g'.repeat(40), ' ' + H40, H40 + '\n', null, 40, undefined, {}]) assert.equal(c.isRevision(bad), false, String(bad));
  assert.equal(c.sameRevision(H40, H40.toUpperCase()), true);
  assert.equal(c.sameRevision(H40, 'b'.repeat(40)), false);
  assert.equal(c.sameRevision('abc', 'abc'), false);
  assert.equal(c.sameRevision(H40, null), false);
  assert.deepEqual(specs(readFileSync(join(S, 'lib/contract.mjs'), 'utf8')), []);
  assert.ok(!/\bimport\s*\(/.test(readFileSync(join(S, 'lib/contract.mjs'), 'utf8')), 'the base contract imports dynamically');
}
