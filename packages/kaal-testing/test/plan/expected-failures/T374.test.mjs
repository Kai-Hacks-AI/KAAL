// Case testing/T374 tests: testing/F149. A held expected failure is listed, and nothing observed changes.
import { assert, fixture, inProject, registerOf, runCommand, writeFileSync, join } from './lib.mjs';
export const id = 'testing/T374';
export const tests = ['testing/F149'];
export const title = 'compareExpectations lists a registered RED as held, changes nothing it was given, is deterministic and throws on an invalid register';
export function run() {
  const dir = fixture();
  const { report } = runCommand(dir);
  assert.ok(report, 'the installed command printed no report on the fixture');
  writeFileSync(join(dir, 'report.json'), JSON.stringify(report));
  writeFileSync(join(dir, 'register.json'), JSON.stringify(registerOf([{ id: 'f.test.mjs > known bug', reference: 'ref-1' }])));
  const probe = (register) => `
    import { readFileSync } from 'node:fs';
    let m;
    try { m = await import('kaal-testing/expectations'); } catch (e) { console.log(JSON.stringify({ absent: String(e.code ?? e.message) })); process.exit(0); }
    const report = JSON.parse(readFileSync(${JSON.stringify(join(dir, 'report.json'))}, 'utf8'));
    const register = ${register};
    const before = JSON.stringify([report, register]);
    let out; let thrown = null;
    try { out = m.compareExpectations(report, register); } catch (e) { thrown = String(e.message); }
    const again = thrown ? null : m.compareExpectations(report, register);
    console.log(JSON.stringify({ exportNames: Object.keys(m).sort(), out, thrown, same: JSON.stringify(out) === JSON.stringify(again), untouched: JSON.stringify([report, register]) === before }));`;
  const good = inProject(probe(`JSON.parse(readFileSync(${JSON.stringify(join(dir, 'register.json'))}, 'utf8'))`));
  assert.equal(good.status, 0, good.stderr);
  assert.equal(good.value.absent, undefined, `kaal-testing/expectations does not resolve in the installed package (${good.value.absent})`);
  assert.ok(good.value.exportNames.includes('compareExpectations'), 'compareExpectations is not exported');
  const { out } = good.value;
  assert.equal(out.schema, 'kaal-testing/expectations@1');
  assert.deepEqual(out.held, [{ id: 'f.test.mjs > known bug', reference: 'ref-1' }], 'a registered RED is not listed as held with its reference');
  assert.equal(out.register.count, 1);
  assert.ok(good.value.untouched, 'the function changed the report or the register it was given');
  assert.ok(good.value.same, 'equal input gave different output');
  for (const bad of ["{ schema: 'other', expected: [] }", "{ schema: 'kaal-testing/expected-failures@1', expected: [{ id: 'a' }, { id: 'a' }] }", "{ schema: 'kaal-testing/expected-failures@1', expected: [{ reference: 'x' }] }", "{ schema: 'kaal-testing/expected-failures@1' }"]) {
    const r = inProject(probe(bad));
    assert.equal(r.status, 0, r.stderr);
    assert.ok(r.value.thrown, `an invalid register was accepted: ${bad}`);
  }
}
