// Case release/T1360 tests: release/C123
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM } from './isolation-fixtures.mjs';
export const id = 'release/T1360';
export const tests = ['release/C123'];
export const title = 'isolate Changes is a control of its own: a record of the control, a check of its own name and a flag of its own in the workflow source, none of the four judges';
export async function run() {
  const rec = join(RM, '04-controls/CTL33-isolate-changes/CTL33.md');
  assert.ok(existsSync(rec), 'the control record is absent');
  const text = readFileSync(rec, 'utf8');
  assert.match(text, /^id: release\/CTL33$/m); assert.match(text, /^title: isolate Changes$/m); assert.match(text, /^type: detective$/m); assert.match(text, /^has: \[release\/I67\]$/m);
  assert.match(text, /KAAL_RELEASE_ISOLATE_CHANGES/);
  assert.ok(existsSync(join(RM, '01-intent/I67-controls-judge-contributions/I67.md')), 'the Intent is absent');
  const code = readFileSync(join(RM, '05-src/wiring/workflows/controls-act.yml'), 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
  assert.match(code, /name: isolate Changes\n/); assert.match(code, /KAAL_FLAG: \$\{\{ vars\.KAAL_RELEASE_ISOLATE_CHANGES \}\}/);
  assert.match(code, /run-controls-act\.mjs isolate --main \. --pr pr --before before --contained contained/);
  // release/C128: the control is named isolate Changes everywhere in the source; the old name is a leftover
  for (const f of ['04-controls/CTL33-isolate-changes/CTL33.md', '05-src/phase/lib/isolate-changes.mjs', '05-src/phase/run-controls-act.mjs', '05-src/wiring/workflows/controls-act.yml']) {
    assert.ok(existsSync(join(RM, f)), `${f} is absent`);
    assert.doesNotMatch(readFileSync(join(RM, f), 'utf8'), /attribute[ -]Changes|attributeChanges|ATTRIBUTE_CHANGES|attributionOf/, `${f} still carries the old name`);
  }
  assert.ok(!existsSync(join(RM, '04-controls/CTL33-attribute-changes')) && !existsSync(join(RM, '05-src/phase/lib/attribute-changes.mjs')), 'the old paths are still there');
  assert.equal((code.match(/KAAL_FLAG:/g) ?? []).length, 5, 'four judges and isolate Changes, each with a flag of its own');
}
