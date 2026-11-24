// Case testing/T396 tests: testing/F172, testing/N38. Every survivor is handed over, none is fixed here, and the Change stays inside Testing.
import assert from 'node:assert/strict';
import { JUDGMENTS, pilot } from './lib.mjs';

export const id = 'testing/T396';
export const tests = ['testing/F172', 'testing/N38'];
export const title = 'every survivor carries an allowed judgment, the justified Cases are listed as text, and the record adds no file outside kaal-testing';

export function run() {
  const { text, rows } = pilot();
  for (const r of rows.filter((x) => x.observation.startsWith('survived'))) {
    assert.ok(JUDGMENTS.some((j) => r.judgment.startsWith(j)), `${r.id}: a survivor's judgment starts with one of ${JUDGMENTS.join(', ')}`);
  }
  assert.match(text, /^## Justified Cases\s*$/m, 'the record has a "Justified Cases" section');
  const added = text.match(/^## Files added\s*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';
  const files = [...added.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]);
  assert.ok(files.length > 0, 'the record lists the files the Change adds');
  assert.ok(files.every((f) => f.startsWith('packages/kaal-testing/')), 'the Change adds nothing outside packages/kaal-testing/');
  assert.ok(!files.some((f) => f.startsWith('engineering/') || f.startsWith('.github/')), 'and nothing under engineering/ or .github/');
}
