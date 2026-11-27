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
export const title = 'the base contract exports the verdicts and the identity rule of testing/C84 and imports nothing: an identity is any opaque non-blank string, compared exactly';
export async function run() {
  const c = await load('lib/contract.mjs');
  assert.deepEqual(Object.keys(c).sort(), ['VERDICTS', 'isIdentity', 'isVerdict', 'sameIdentity']);
  assert.deepEqual(c.VERDICTS, ['PASS', 'REPORT', 'FAIL', 'UNKNOWN']);
  assert.equal(c.isVerdict({ verdict: 'PASS', blocked: false }), true);
  assert.equal(c.isVerdict({ verdict: 'UNKNOWN', blocked: true, reason: 'x' }), true);
  for (const bad of [{ verdict: 'MAYBE', blocked: false }, { verdict: 'PASS' }, { verdict: 'PASS', blocked: 'no' }, null, 'PASS', [], undefined]) assert.equal(c.isVerdict(bad), false);
  for (const ok of ['a'.repeat(40), 'sha256:9f2c4a', 'tree:9f2c', 'build-2026.11.27', 'v1.4.0+meta', 'a', 'ABC']) assert.equal(c.isIdentity(ok), true, ok);
  for (const bad of ['', '   ', '\t\n', null, 40, undefined, {}, ['abc']]) assert.equal(c.isIdentity(bad), false, String(bad));
  assert.equal(c.sameIdentity('tree:9f2c', 'tree:9f2c'), true);
  assert.equal(c.sameIdentity('ABC', 'abc'), false, 'no change of case');
  assert.equal(c.sameIdentity('abc ', 'abc'), false, 'no trimming');
  assert.equal(c.sameIdentity('  ', '  '), false, 'two blank strings are no identity');
  assert.equal(c.sameIdentity('abc', null), false);
  assert.deepEqual(specs(readFileSync(join(S, 'lib/contract.mjs'), 'utf8')), []);
  assert.ok(!/\bimport\s*\(/.test(readFileSync(join(S, 'lib/contract.mjs'), 'utf8')), 'the base contract imports dynamically');
}
