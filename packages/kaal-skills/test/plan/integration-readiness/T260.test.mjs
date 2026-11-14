// Case skills/T260 tests: skills/F1. A declaration reads or is refused, and a capability without one is unknown, never conforming.
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { check, draft, load } from './lib.mjs';
export const id = 'skills/T260';
export const tests = ['skills/F1'];
export const title = "a declaration beside the ownership claim reads when it names its owner and its mechanisms, is refused when it does not, and a capability with no declaration is reported unknown";
export async function run() {
  const { out, v } = await check(draft());
  assert.equal(v.F1, 'PASS', `the Testing draft must read: ${JSON.stringify(out.F1)}`);
  const refused = {
    'another owner id': (d) => { d.owner.id = '0'.repeat(64); },
    'no mechanism': (d) => { d.mechanisms = []; },
    'a duplicate mechanism name': (d) => { d.mechanisms.push({ ...d.mechanisms[0] }); },
    'a level that is none of script, skill, agent': (d) => { d.mechanisms[0].level = 'daemon'; },
    'a kind that is none of check, measure, judgment': (d) => { d.mechanisms[0].kind = 'oracle'; },
    'documentation that does not exist': (d) => { d.mechanisms[0].docs = 'NOPE.md'; },
    'a module that does not exist': (d) => { d.mechanisms[0].invoke.module = 'lib/nope.mjs'; },
  };
  for (const [why, mutate] of Object.entries(refused)) {
    const d = draft(); mutate(d);
    assert.equal((await check(d)).v.F1, 'FAIL', `a declaration with ${why} must be refused`);
  }
  const { discover } = await load();
  const root = mkdtempSync(join(tmpdir(), 'skills-discover-'));
  for (const p of ['kaal-declared', 'kaal-silent']) mkdirSync(join(root, 'packages', p), { recursive: true });
  writeFileSync(join(root, 'packages/kaal-declared/integration.kaal.json'), JSON.stringify(draft()));
  const found = Object.fromEntries((await discover(root)).map((e) => [e.package.split('/').pop(), e]));
  assert.ok(found['kaal-declared']?.declaration, 'a package with integration.kaal.json is found with its declaration');
  assert.equal(found['kaal-silent']?.declaration, null, 'a package with none is found without one');
  assert.equal(found['kaal-silent']?.status, 'UNKNOWN', 'a capability that has not declared is unknown, never PASS');
}
