// Case release/T1714 tests: release/C191. The old call is one lane, and the module is pure.
import assert from 'node:assert/strict';
import { lanes, item, claim, ITEM_ROOT, CLAIM_ROOT, add, mod, codes, load } from './fixture.mjs';
export const id = 'release/T1714';
export const tests = ['release/C191'];
export const title = 'the table of one item entry gives the verdict and findings of the backlog judge on the inputs of backlog T495 to T499, and the module stays pure';
export async function run() {
  const qualify = await load(import.meta.url);
  const { readFileSync } = await import('node:fs'); const { join } = await import('node:path'); const { fileURLToPath, pathToFileURL } = await import('node:url');
  const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
  const old = (await import(pathToFileURL(join(repo, 'packages/kaal-backlog/lib/qualify.mjs')).href)).qualify;
  const strip = (r) => ({ verdict: r.verdict, findings: r.findings.map(({ code, path }) => ({ code, path })) });
  const R = ITEM_ROOT, roots = [R], held = [R + 'B3-first.md'];
  const inputs = [
    [[add(R + 'B1.md'), mod(R + 'B3-first.md')], held], [[], []], [undefined, []], [null, []], ['diff', []], [[add('.github/workflows/x.yml')], []], [[add(R + 'README.md')], []], [[add(R + 'b3.md')], []], [[add(R + 'sub/B3.md')], []],
    [[{ path: R + 'B3.md', status: 'D' }], []], [[{ path: R + 'B3.md', status: 'R', oldPath: 'packages/kaal-backlog/lib/check.mjs', mode: '100644' }], []], [[{ path: R + 'B3.md', status: 'T', mode: '120000' }], []],
    [[{ path: R + 'B3.md', status: 'A', mode: '160000' }], []], [[{ path: R + 'B3.md', status: 'C', mode: '100644' }], []], [[{ path: R + 'B3.md', mode: '100644' }], []], [[{ path: R + 'B3.md', status: 'AM', mode: '100644' }], []],
    [[add(R + '../lib/B1.md')], []], [[add(R + '..\\B1.md')], []], [[add('/' + R + 'B1.md')], []], [[add(R + './B1.md')], []],
    [[add(R + 'B3-second.md')], held], [[add(R + 'B7.md'), add(R + 'B7-again.md')], held], [[add(R + 'B2.md'), add(R + 'B1.md'), add('.github/x.yml')], []],
  ];
  for (const [diff, existing] of inputs) assert.deepEqual(strip(qualify(diff, { lanes: [item], existing: { item: existing } })), strip(old(diff, { roots, existing })), JSON.stringify(diff));
  for (const bad of [[], undefined, ['packages/'], ['.github/'], [''], ['/'], ['packages/kaal-backlog/lib/']]) assert.equal(qualify([add(R + 'B1.md')], { lanes: [{ ...item, roots: bad }] }).verdict, old([add(R + 'B1.md')], { roots: bad }).verdict);
  const a = [add(R + 'B1.md'), add(CLAIM_ROOT + 'K2.json'), add('.github/x.yml')];
  assert.deepEqual(qualify([...a].reverse(), { lanes }), qualify(a, { lanes }), 'order does not matter');
  assert.doesNotMatch(readFileSync(join(repo, 'engineering/release-management/05-src/lane/qualify.mjs'), 'utf8'), /\b(import|require)\b|\bDate\b|\bprocess\b|\bperformance\b|\bfetch\b|\.kaal|node:/, 'the module is not pure');
}
