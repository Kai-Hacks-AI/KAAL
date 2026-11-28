// Case release/T1792 tests: release/C201. A target at no station is UNKNOWN, never a pass, and no flag is read.
import assert from 'node:assert/strict';
import { load, files, record, flags } from './fixture.mjs';
export const id = 'release/T1792';
export const tests = ['release/C201'];
export const title = 'an engaged entry whose target is at no station answers UNKNOWN with exit 2, names the target, and reads no flag';
export async function run() {
  const { fromEnv } = await load('lib/entry-flag.mjs');
  const ID = 'release/CTL40';
  // a flag file that could not be read would be exit 1; exit 2 shows it was not read
  for (const flagsText of [undefined, flags([ID], ['Promoting'], 'on')]) {
    for (const baseRef of ['claude/x', 'feature/y', 'kaal/', undefined, '']) {
      const { env } = files({ recordText: record(ID, 'Promoting:preventive'), flagsText });
      const r = fromEnv({ id: ID, env, baseRef });
      assert.equal(r.stop, true, `${baseRef}: nothing runs`); assert.equal(r.exit, 2, `${baseRef}: UNKNOWN, exit 2, never 0`);
      assert.ok(r.lines.some((l) => /UNKNOWN/.test(l) && /no station/.test(l)), `${baseRef}: the line names it`); assert.ok(r.lines.some((l) => l.includes(String(baseRef ?? '(none)'))), `${baseRef}: it names the target`);
    }
  }
  // the entry's own command line: exit 2 and no verdict record
  const { run: runEntry } = await load('promotion-source/lib/run.mjs');
  const { env } = files({ recordText: record(ID, 'Promoting:preventive'), flagsText: flags([ID], ['Promoting'], 'on') });
  const lines = []; let ran = 0;
  const exit = await runEntry({ label: 'x', id: ID, check: async () => { ran += 1; return {}; }, read: () => ({}), argv: ['--base-ref', 'claude/x'], env: { ...env, KAAL_REPO: 'o/r', KAAL_HEAD_REPO: 'o/r', KAAL_HEAD_REF: 'a', KAAL_HEAD_SHA: 'h' }, out: (l) => lines.push(l) });
  assert.equal(exit, 2); assert.equal(ran, 0, 'the check does not run'); assert.ok(!lines.some((l) => l.startsWith('kaal-control ')), 'no record');
}
