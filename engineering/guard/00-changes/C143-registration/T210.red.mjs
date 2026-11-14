// Case guard/T210 tests: F44
import assert from 'node:assert/strict';
import { baseline, cleanup, commit, hook, owner, regText, rev, reg, scratch, SOURCES } from './lib.mjs';
export const id = 'guard/T210';
export const tests = ['guard/F44'];
export const title = 'for every origin, a pull request may add a registration, but deleting, weakening or re-owning one the base holds is cannot judge, naming it, and its check never runs';
export function run() {
  for (const origin of ['solution', 'change', 'engineering']) {
    const own = origin === 'solution' ? 'alpha' : 'o1';
    const dir = scratch({ ...baseline, ...owner('alpha'), ...reg(own, 'held', { origin }) });
    try {
      const base = rev(dir, 'HEAD');
      const src = SOURCES[origin](own, 'held');
      const inst = `.kaal/guard/registered/${origin}/${own}/held.md`;
      commit(dir, { ...reg(own, 'added', { origin }), 'packages/alpha/a.txt': '1\n' });
      let r = hook(dir, base);
      assert.ok(r.out.includes('RAN added') && r.out.includes('RAN held'), `${origin}: an added registration did not run beside the held one: ${r.out}`);
      assert.equal(r.status, 0, r.out);
      commit(dir, { [src]: null, [inst]: null });
      r = hook(dir, base);
      assert.equal(r.status, 2, `${origin}: a deleted registration was not cannot judge: ${r.status} ${r.out}`);
      assert.match(r.out, /held/, 'the refusal does not name the registration');
      const weak = regText(origin, own, 'held', src).replace(/command: .*/, 'command: node -e 0');
      commit(dir, { [src]: weak, [inst]: weak });
      r = hook(dir, base);
      assert.equal(r.status, 2, `${origin}: a weakened registration was not cannot judge: ${r.status} ${r.out}`);
      const moved = weak.replace(`owner: ${own}`, 'owner: other');
      commit(dir, { [src]: moved, [inst]: moved });
      r = hook(dir, base);
      assert.equal(r.status, 2, `${origin}: a re-owned registration was not cannot judge: ${r.status} ${r.out}`);
    } finally { cleanup(dir); }
  }
}
