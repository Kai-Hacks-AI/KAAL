// Case pull/T50 tests: pull/F49
import assert from 'node:assert/strict';
import { script, NEW, entry } from './declare/lib.mjs';
export const id = 'pull/T50';
export const tests = ['pull/F49'];
export const title = 'value, size and unit are all there or all absent, an absent triple is judged and never guessed, and a partial one is a problem';

export async function run() {
  const mod = await script();
  for (const name of NEW) {
    const e = entry(name);
    assert.ok(e, `${name} is not declared`);
    const present = ['value', 'size', 'unit'].filter((f) => e[f] !== undefined);
    assert.ok(present.length === 0 || present.length === 3, `${name} carries a partial triple (${present.join(', ')})`);
  }
  // With no triple recorded, several qualifying candidates are judged, naming every one.
  const candidates = NEW.map((name) => ({ name }));
  const judged = mod.chooseNext(NEW, [], { collectors: candidates });
  assert.equal(judged.collector, null, 'the order was guessed from nothing');
  assert.deepEqual(judged.judged, NEW, 'the judged candidates are not named');
  // A partial or invalid triple is named in problems.
  const { walkCollectors } = mod;
  const evidence = { plan: ['plan'], do: ['src'], cases: { files: ['^t/(T\\d+)\\.test\\.mjs$'] }, act: { files: ['concluding-act'], headings: ['Liked'] } };
  const r = walkCollectors({ collectors: [] }, { evidence, collectors: [{ name: 'c-a', value: 3 }, { name: 'c-b', value: 3, size: 0, unit: 'u' }] });
  assert.ok(r.problems.some((p) => /c-b/.test(p) && /size/.test(p)), 'an invalid size was not named');
  assert.ok(r.problems.some((p) => /c-a/.test(p)), 'a partial triple was not named in problems');
}
