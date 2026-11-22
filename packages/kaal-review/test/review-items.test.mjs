// review/C5: runs the planned Cases of Review items (review/T298, review/T299, review/T1388 to review/T1390) and the unit tests of the navigation parser.
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from '../skills/kaal-review/scripts/navigate.mjs';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'plan/review-items');

describe('the planned Cases of review/C5', () => {
  for (const file of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
    it(file, async () => {
      const m = await import(pathToFileURL(join(dir, file)).href);
      await m.run();
    });
  }
});

describe('the front matter parser of the navigation', () => {
  it('reads scalars, inline lists and indented lists, and leaves the body whole', () => {
    const { front, body } = parse('---\nid: a/V1\nvalidates: [x, y]\nparts:\n  - one: satisfied\n  - two: unresolved\n---\n# Title\n');
    assert.equal(front.id, 'a/V1');
    assert.deepEqual(front.validates, ['x', 'y']);
    assert.deepEqual(front.parts, ['one: satisfied', 'two: unresolved']);
    assert.equal(body, '# Title\n');
  });

  it('treats a file without front matter as having no front matter and keeps its text', () => {
    assert.deepEqual(parse('just text'), { front: {}, body: 'just text' });
  });

  it('reads an empty value as an empty list', () => {
    assert.deepEqual(parse('---\nvalidates:\n---\nx').front.validates, []);
  });
});
