// review/C7: runs the Cases of the scope, the reference and the criteria of a Review item (review/T1554 to review/T1556) and the unit tests of the part about a reference.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { item, tree } from './plan/scope-reference/lib.mjs';
import { judging, navigate } from '../skills/kaal-review/scripts/navigate.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, 'plan/scope-reference');
const script = join(here, '../skills/kaal-review/scripts/navigate.mjs');

describe('the Cases of review/C7', () => {
  for (const file of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    it(file, async () => {
      const m = await import(pathToFileURL(join(dir, file)).href);
      await m.run();
    });
  }
});

describe('the part of an answer about one reference', () => {
  const root = tree({
    'v/V1.md': item('ns/V1', { validates: ['x/A1'], against: ['x/F1'] }),
    'v/V2.md': item('ns/V2', { validates: ['x/A2'], against: ['x/F2'] }),
    'v/V3.md': item('ns/V3', { validates: ['x/A3'], against: ['intrinsic'] }),
  });

  it('holds the items judged against the reference, and none other', async () => {
    const answer = await navigate(root, {});
    assert.deepEqual(judging(answer, 'x/F1').items.map((i) => i.id), ['ns/V1']);
    assert.deepEqual(judging(answer, 'intrinsic').judgedAgainst, { intrinsic: ['ns/V3'] });
    assert.deepEqual(judging(answer, 'x/none').items, []);
    assert.deepEqual(judging(answer, 'constructor').judgedAgainst, {}, 'a name like a prototype key is not a reference that exists');
  });

  it('is what the command prints for --against, and the command takes one of --subject and --against', () => {
    const out = JSON.parse(execFileSync(process.execPath, [script, '--root', root, '--against', 'x/F2']));
    assert.deepEqual(out.items.map((i) => i.id), ['ns/V2']);
    const both = spawnSync(process.execPath, [script, '--root', root, '--against', 'x/F2', '--subject', 'x/A2']);
    assert.equal(both.status, 2);
    assert.match(String(both.stderr), /usage/);
  });
});
