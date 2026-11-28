// Case release/T1796 tests: release/C201. Effective enforcement is preserved: with the flag on and preventive declared, a real violation blocks at each station, where the legacy rule fails; advisory reports without blocking; satisfied facts pass.
import assert from 'node:assert/strict';
import { load, files, record, flags, ENTRIES, JUDGED, TARGET, exitOfRun } from './fixture.mjs';
export const id = 'release/T1796';
export const tests = ['release/C201'];
export const title = 'at every station each adopting entry exits 1 on a violation with the flag on, 0 with advisory, 0 when satisfied, and the legacy rule fails on the same violation';
export async function run() {
  const { fromEnv } = await load('lib/entry-flag.mjs');
  for (const [module, ID, how, bad, good] of ENTRIES) {
    const m = await load(module);
    // the legacy rule on the same facts: the entry's own detective verdict is the rule's, which the old workflow runs
    const legacy = how === 'paths' ? await m.check(bad) : await m.check(bad, {});
    assert.equal(legacy.kind, 'fail', `${ID}: the rule fails on the violation (the legacy check blocks here)`);
    assert.equal((how === 'paths' ? await m.check(good) : await m.check(good, {})).kind, 'pass', `${ID}: the rule passes on satisfied facts`);
    for (const station of JUDGED) {
      const at = (value, declared = `${station}:preventive`) => fromEnv({ id: ID, env: files({ recordText: record(ID, declared), flagsText: flags([ID], JUDGED, value) }).env, baseRef: TARGET[station] });
      let r = await exitOfRun({ module, id: ID, how, facts: bad, entry: at('on') });
      assert.equal(r.exit, 1, `${ID}@${station}: a violation blocks with the flag on`); assert.equal(r.answer.blocked, true);
      r = await exitOfRun({ module, id: ID, how, facts: good, entry: at('on') });
      assert.equal(r.exit, 0, `${ID}@${station}: satisfied facts pass`);
      r = await exitOfRun({ module, id: ID, how, facts: bad, entry: at('advisory') });
      assert.equal(r.exit, 0, `${ID}@${station}: advisory reports and does not block`); assert.equal(r.answer.verdict, 'REPORT', `${ID}@${station}: it still reports`);
      // a valid configuration that is not declared preventive does not enforce either: that is a flip not yet made, and the Case says so
      r = await exitOfRun({ module, id: ID, how, facts: bad, entry: at('on', `${station}:detective`) });
      assert.equal(r.exit, 0, `${ID}@${station}: declared detective does not block, even with the flag on`);
    }
  }
}
