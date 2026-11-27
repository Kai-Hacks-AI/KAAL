// Case controls/T1719 tests: controls/F222
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
const specs = (text) => [...text.matchAll(/^\s*(?:import|export)\s[^\n]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
export const id = 'controls/T1719';
export const tests = ['controls/F222'];
export const title = 'findOwnRatchets names a ratchet observed not to use the library, throws with what it confirmed when unknown, and recognizeRatchetUse reads structure only';
const R = 'tree:aaa';
export async function run() {
  const { findOwnRatchets, recognizeRatchetUse } = await load('lib/verify-ratchet-use.mjs');
  const o = (control, usesRatchetLibrary, identity = R) => ({ control, identity, usesRatchetLibrary });
  assert.deepEqual(findOwnRatchets({ ratchets: ['x/CTL1', 'x/CTL2'], observed: [o('x/CTL1', true), o('x/CTL2', true)], identity: R }), []);
  assert.deepEqual(findOwnRatchets({ ratchets: ['x/CTL2', 'x/CTL1'], observed: [o('x/CTL1', false), o('x/CTL2', false)], identity: R }), ['own-ratchet:x/CTL1', 'own-ratchet:x/CTL2']);
  const unknownCases = [
    { observed: [o('x/CTL1', false)] },
    { observed: [o('x/CTL1', false), o('x/CTL2', true, 'tree:bbb')] },
    { observed: [o('x/CTL1', false), o('x/CTL2', 'yes')] },
    { observed: [o('x/CTL1', false), o('x/CTL2', true), o('x/CTL2', false)] },
    { observed: [o('x/CTL1', false), null, o('x/CTL2', true)] },
  ];
  for (const u of unknownCases) {
    try { findOwnRatchets({ ratchets: ['x/CTL1', 'x/CTL2'], identity: R, ...u }); assert.fail('did not throw'); } catch (e) {
      assert.ok(Array.isArray(e.confirmed) && Array.isArray(e.unknown) && e.unknown.length > 0, String(e.message));
    }
  }
  assert.throws(() => findOwnRatchets({ ratchets: 'x', observed: [], identity: R }));
  assert.throws(() => findOwnRatchets({ ratchets: [], observed: [], identity: '' }));
  const c = 'x/CTL1';
  assert.equal(recognizeRatchetUse({ control: c, identity: R, entry: "import { ratchetStrategy } from './lib/ratchet/strategy.mjs';\n" }), true);
  assert.equal(recognizeRatchetUse({ control: c, identity: R, entry: "import { judgeRun } from './ratchet.mjs';\nconst ratchetStrategy = 1;" }), false);
  assert.equal(recognizeRatchetUse({ control: c, identity: R, entry: "import { runControl } from './adapter.mjs';\n" }), false);
  assert.equal(recognizeRatchetUse({ control: c, identity: R, entry: null }), null);
  assert.equal(recognizeRatchetUse({ control: c, identity: R, entry: 7 }), null);
}
