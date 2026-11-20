// Case testing/T375 tests: testing/F150. A registered entry is held, not holding, unconfirmed or absent, and a RED nobody listed is unexpected.
import { FULL, assert, fixture, inProject, runCommand, writeFileSync, join } from './lib.mjs';
export const id = 'testing/T375';
export const tests = ['testing/F150'];
export const title = 'each registered id lands in exactly one strict state, an unlisted RED is unexpected, and a held entry leaves the observed counts alone';
export function run() {
  const dir = fixture();
  const { report } = runCommand(dir);
  assert.ok(report, 'the installed command printed no report on the fixture');
  assert.deepEqual(report.counts, { GREEN: 1, RED: 2, UNKNOWN: 1 }, 'the fixture does not yield 1 GREEN, 2 RED, 1 UNKNOWN');
  writeFileSync(join(dir, 'report.json'), JSON.stringify(report));
  writeFileSync(join(dir, 'register.json'), JSON.stringify(FULL));
  const r = inProject(`
    import { readFileSync } from 'node:fs';
    let m;
    try { m = await import('kaal-testing/expectations'); } catch (e) { console.log(JSON.stringify({ absent: String(e.code ?? e.message) })); process.exit(0); }
    const report = JSON.parse(readFileSync(${JSON.stringify(join(dir, 'report.json'))}, 'utf8'));
    const register = JSON.parse(readFileSync(${JSON.stringify(join(dir, 'register.json'))}, 'utf8'));
    console.log(JSON.stringify({ out: m.compareExpectations(report, register), counts: report.counts }));`);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.value.absent, undefined, `kaal-testing/expectations does not resolve in the installed package (${r.value.absent})`);
  const { out } = r.value;
  assert.deepEqual(out.held.map((e) => e.id), ['f.test.mjs > known bug']);
  assert.deepEqual(out.notHolding.map((e) => [e.id, e.actual, e.reference]), [['f.test.mjs > fixed', 'GREEN', 'ref-2']], 'a registered test observed GREEN is not reported as no longer holding');
  assert.deepEqual(out.unconfirmed.map((e) => [e.id, e.actual]), [['f.test.mjs > later', 'UNKNOWN']], 'a registered test observed UNKNOWN is not unconfirmed');
  const absent = Object.fromEntries(out.absent.map((e) => [e.id, e]));
  assert.deepEqual(Object.keys(absent).sort(), ['f.test.mjs > gone', 'g.test.mjs > elsewhere']);
  assert.equal(absent['f.test.mjs > gone'].provisional, false, 'an id missing from a complete file is provisional');
  assert.equal(absent['g.test.mjs > elsewhere'].provisional, true, 'an id of a file that was not run is not provisional');
  assert.ok(absent['g.test.mjs > elsewhere'].reason, 'a provisional absence has no reason');
  assert.deepEqual(out.unexpected.map((e) => e.id), ['f.test.mjs > other bug'], 'a RED that no entry lists is not unexpected');
  assert.deepEqual(out.counts, { held: 1, notHolding: 1, unconfirmed: 1, absent: 2, unexpected: 1 });
  assert.deepEqual(r.value.counts, report.counts, 'the observed counts of the report changed');
}
