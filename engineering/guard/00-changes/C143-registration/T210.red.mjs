// Case guard/T210 tests: F44
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, regText, rev, reg, scratch, SOURCES } from './lib.mjs';
export const id = 'guard/T210';
export const tests = ['guard/F44'];
export const title = 'for each origin, registrations evolve freely without rewiring Guard (the invocation is the same before and after): an added, a modified and a removed registration run as the candidate has them, and only a malformed one, or one whose command cannot start, is cannot judge, naming it';
export function run() {
  for (const origin of ['solution', 'change']) {
    const own = origin === 'solution' ? 'alpha' : 'c7';
    const dir = scratch({ ...baseline, ...owner('alpha'), ...reg(own, 'held', { origin }), ...reg(own, 'gone', { origin }) });
    try {
      const base = rev(dir, 'HEAD');
      const src = SOURCES[origin](own, 'held');
      const inst = `.kaal/guard/registered/${origin}/${own}/held.md`;
      // Added, modified and removed in one pull request: all three are the owner's to change.
      const changed = regText(origin, own, 'held', src).replace('held.mjs', 'held2.mjs');
      commit(dir, { ...reg(own, 'added', { origin }), [src]: changed, [inst]: changed, 'held2.mjs': "console.log('RAN held2');\n",
        [SOURCES[origin](own, 'gone')]: null, [`.kaal/guard/registered/${origin}/${own}/gone.md`]: null });
      let r = hook(dir, base);
      assert.ok(r.out.includes('RAN added') && r.out.includes('RAN held2'), `${origin}: an added or modified registration did not run as the candidate has it: ${r.out}`);
      assert.ok(!r.out.includes('RAN gone'), `${origin}: a removed registration still ran`);
      assert.equal(r.status, 0, `${origin}: authorized evolution was refused: ${r.out}`);
      // Execution integrity: malformed and unexecutable registrations are cannot judge.
      const bad = changed.replace('type: Guard/Check', 'type: Not/A/Check');
      commit(dir, { [src]: bad, [inst]: bad });
      r = hook(dir, base);
      assert.equal(r.status, 2, `${origin}: a malformed registration was not cannot judge: ${r.status} ${r.out}`);
      assert.match(r.out, /held/, 'the refusal does not name the registration');
      const dead = changed.replace('node held2.mjs', 'no-such-program-c143');
      commit(dir, { [src]: dead, [inst]: dead });
      r = hook(dir, base);
      assert.equal(r.status, 2, `${origin}: a registration whose command cannot start was not cannot judge: ${r.status} ${r.out}`);
    } finally { cleanup(dir); }
  }
}
