// Case guard/T210 tests: F44
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, kg, ran, rev, scratch, scripts } from './lib.mjs';
export const id = 'guard/T210';
export const tests = ['guard/F44'];
export const title = 'a package may change its own kaal-guard.json, removing checks included, and Guard runs it as the candidate has it; a malformed file, a check with no command or a command that cannot start is cannot judge, naming the file';
export function run() {
  const dir = scratch({ ...baseline, ...scripts('one', 'two'), 'packages/kaal-alpha/kaal-guard.json': kg('one', 'two') });
  try {
    const base = rev(dir, 'HEAD');
    // The package changes its contract: removes a check, adds nothing. That is allowed and runs as is.
    commit(dir, { 'packages/kaal-alpha/kaal-guard.json': kg('one'), 'packages/kaal-alpha/a.txt': 'x\n' });
    let r = hook(dir, base);
    assert.deepEqual(ran(r, ['one', 'two']), ['one'], `the candidate's own file was not run as it is: ${r.out}`);
    assert.equal(r.status, 0, r.out);
    for (const [why, text] of [['malformed', '{ not json'], ['no command', JSON.stringify({ checks: [{ id: 'x' }] })], ['unstartable', JSON.stringify({ checks: [{ id: 'x', run: 'no-such-command-c143' }] })]]) {
      commit(dir, { 'packages/kaal-alpha/kaal-guard.json': text, 'packages/kaal-alpha/a.txt': `${why}\n` });
      r = hook(dir, base);
      assert.equal(r.status, 2, `${why} was not cannot judge: ${r.status} ${r.out}`);
      assert.match(r.out, /packages\/kaal-alpha\/kaal-guard\.json/, `${why}: the file is not named: ${r.out}`);
    }
  } finally { cleanup(dir); }
}
