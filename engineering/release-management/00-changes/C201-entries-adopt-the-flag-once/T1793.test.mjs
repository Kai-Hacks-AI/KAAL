// Case release/T1793 tests: release/C201. Each adopting entry job of the three plain sources supplies the flag file and its own control record, and nothing else of the adoption.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { repo, SRC } from './fixture.mjs';
export const id = 'release/T1793';
export const tests = ['release/C201'];
export const title = 'every entry job of checks 1, 2 and 4 supplies KAAL_FLAGS and the record of its own control, and no station, mode or flag value';
export async function run() {
  const W = join(SRC, 'wiring/workflows');
  let seen = 0;
  for (const f of ['change-isolation-plain.yml', 'branching-plain.yml', 'promotion-source-plain.yml']) {
    const text = readFileSync(join(W, f), 'utf8');
    assert.doesNotMatch(text, /KAAL_STATION/, `${f}: the job supplies no station`);
    assert.doesNotMatch(text, /KAAL_(MODE|FLAG_VALUE)|:\s*(advisory|preventive|detective)\s*$/m, `${f}: no mode or flag value in the workflow`);
    // each judge step: the two lines in its env, in front of its run line
    const steps = text.split(/\n(?=      - )/).filter((s) => /run: node engineering\/release-management\/05-src\/\S+\/judge-[a-z-]+\.mjs/.test(s));
    assert.ok(steps.length >= 2, `${f}: its entry steps`);
    for (const s of steps) {
      const entry = /\/(judge-[a-z-]+\.mjs)/.exec(s)[1];
      const folder = /05-src\/([a-z-]+)\//.exec(s)[1];
      const wanted = /const ID = '([^']+)'/.exec(readFileSync(join(SRC, folder, entry), 'utf8'))[1];
      assert.equal((s.match(/^\s+KAAL_FLAGS: engineering\/14-operations\/controls\/flags\.json$/gm) ?? []).length, 1, `${entry}: the flag file, once`);
      const rec = /^\s+KAAL_CONTROL_RECORD: (\S+)$/m.exec(s)?.[1];
      assert.ok(rec && existsSync(join(repo, rec)), `${entry}: the record path is a file`);
      assert.match(readFileSync(join(repo, rec), 'utf8'), new RegExp(`^id: ${wanted}$`, 'm'), `${entry}: the record is the control's own (${wanted})`);
      assert.ok(s.indexOf('KAAL_CONTROL_RECORD') < s.indexOf('run: node'), `${entry}: supplied in the step's env`);
      seen += 1;
    }
    assert.equal((text.match(/KAAL_FLAGS:/g) ?? []).length, steps.length, `${f}: only the entry jobs adopt`);
  }
  assert.equal(seen, 7, 'the seven entries of checks 1, 2 and 4');
}
