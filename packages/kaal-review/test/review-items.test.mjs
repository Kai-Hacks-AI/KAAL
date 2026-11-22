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
    assert.deepEqual(parse('just text'), { front: {}, body: 'just text', malformed: [] });
  });

  it('reads an empty value as an empty list', () => {
    assert.deepEqual(parse('---\nvalidates:\n---\nx').front.validates, []);
  });
});

describe('an invalid carry-forward never changes what applies', async () => {
  const { item, result, tree } = await import('./plan/review-items/lib.mjs');
  const { navigate } = await import('../skills/kaal-review/scripts/navigate.mjs');
  const A = 'a'.repeat(40);
  const B = 'b'.repeat(40);
  const f = (revision, conclusion, extra = {}) => ({ appraises: 'ns/V1', revision, appraiser: 'an Agent', relation: 'not-author', execution: 'performed', conclusion, ...extra });
  const at = (carry, o = {}) => navigate(tree({
    'v/V1.md': item('ns/V1', { validates: ['x/F1'] }),
    'r/RV1.md': result('ns/RV1', f(A, 'satisfied')),
    'r/RV2.md': result('ns/RV2', f(B, o.conclusion ?? 'satisfied', { carries: carry }), { result: 'result' in o ? o.result : 'The later commit does not touch the subject.' }),
  }), { revision: B });

  it('keeps a carry-forward without a reason out of what applies, reports it, and leaves the carried result stale', async () => {
    const nav = await at('ns/RV1', { result: undefined });
    assert.ok(nav.findings.some((x) => x.kind === 'carry-without-reason'));
    assert.deepEqual(nav.current['ns/V1'].filter((c) => c.applicability === 'carried'), []);
    assert.ok(nav.stale['ns/V1'].includes('ns/RV1'));
  });

  it('keeps a carry-forward that changes the conclusion out of what applies', async () => {
    const nav = await at('ns/RV1', { conclusion: 'unresolved' });
    assert.ok(nav.findings.some((x) => x.kind === 'carry-conclusion-differs'));
    assert.deepEqual(nav.current['ns/V1'].filter((c) => c.applicability === 'carried'), []);
    assert.ok(nav.stale['ns/V1'].includes('ns/RV1'));
  });

  it('never lists a result that does not exist', async () => {
    const nav = await at('ns/RV9');
    assert.ok(nav.findings.some((x) => x.kind === 'carry-dangling'));
    assert.deepEqual(nav.current['ns/V1'].map((c) => c.result), ['ns/RV2']);
  });
});

describe('malformed records are reported and never stop the navigation', async () => {
  const { item, result, tree } = await import('./plan/review-items/lib.mjs');
  const { navigate } = await import('../skills/kaal-review/scripts/navigate.mjs');
  const A = 'a'.repeat(40);
  const f = (extra = {}) => ({ appraises: 'ns/V1', revision: A, appraiser: 'an Agent', relation: 'not-author', execution: 'performed', conclusion: 'satisfied', ...extra });

  it('reports a list item after a scalar as a finding of that file and still returns the valid records', async () => {
    const nav = await navigate(tree({ 'v/V1.md': item('ns/V1', { validates: ['x/F1'] }), 'v/V2.md': '---\nid: ns/V2\n  - bad\n---\n## Question\n\nq\n' }), { revision: A });
    assert.deepEqual(nav.findings.map((x) => [x.kind, x.files[0]]), [['malformed-front-matter', 'v/V2.md']]);
    assert.deepEqual(nav.items.map((i) => i.id), ['ns/V1']);
  });

  it('reports a scalar where a list is expected', async () => {
    const nav = await navigate(tree({ 'v/V1.md': item('ns/V1', { validates: ['x/F1'] }), 'r/RV1.md': result('ns/RV1', f({ parts: undefined })).replace('relation:', 'parts: oops\nrelation:') }), { revision: A });
    assert.ok(nav.findings.some((x) => x.kind === 'malformed-front-matter' && x.files[0] === 'r/RV1.md'));
  });

  it('does not accept a conclusion from a result that does not declare it was performed', async () => {
    for (const execution of [undefined, 'maybe']) {
      const nav = await navigate(tree({ 'v/V1.md': item('ns/V1', { validates: ['x/F1'] }), 'r/RV1.md': result('ns/RV1', f({ execution })) }), { revision: A });
      assert.ok(nav.findings.some((x) => x.kind === 'bad-execution'), String(execution));
    }
  });
});
