// Case release/T1360 tests: release/C123
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM } from './attribution-fixtures.mjs';
export const id = 'release/T1360';
export const tests = ['release/C123'];
export const title = 'attribute Changes is a control of its own: a record of the control, a check of its own name and a flag of its own in the workflow source, none of the four judges';
export async function run() {
  const rec = join(RM, '04-controls/CTL33-attribute-changes/CTL33.md');
  assert.ok(existsSync(rec), 'the control record is absent');
  const text = readFileSync(rec, 'utf8');
  assert.match(text, /^id: release\/CTL33$/m); assert.match(text, /^title: attribute Changes$/m); assert.match(text, /^type: detective$/m); assert.match(text, /^has: \[release\/I67\]$/m);
  assert.match(text, /KAAL_RELEASE_ATTRIBUTE_CHANGES/);
  assert.ok(existsSync(join(RM, '01-intent/I67-controls-judge-contributions/I67.md')), 'the Intent is absent');
  const code = readFileSync(join(RM, '05-src/wiring/workflows/controls-act.yml'), 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.match(code, /name: attribute Changes\n/); assert.match(code, /KAAL_FLAG: \$\{\{ vars\.KAAL_RELEASE_ATTRIBUTE_CHANGES \}\}/);
  assert.match(code, /run-controls-act\.mjs attribute --main \. --pr pr --before before --contained contained/);
  assert.equal((code.match(/KAAL_FLAG:/g) ?? []).length, 5, 'four judges and attribute Changes, each with a flag of its own');
}
