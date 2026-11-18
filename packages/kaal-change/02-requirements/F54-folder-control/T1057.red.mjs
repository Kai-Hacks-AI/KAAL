// Case change/T1057 tests: change/F54
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load, view, from, done, kase, P, PACKAGE } from '../../test/folder-control-support.mjs';
export const id = 'change/T1057';
export const tests = ['change/F54'];
export const title = 'outside a Change folder nothing tests a Change or a Gap and no C or G document lies in an element folder, a kind the control has never seen counts as target, and the change kinds are the ones the Definition states';
export async function run() {
  const c = await load();
  const outside = (extra) => c.judgeFolders(view({ ...done(), ...extra }));
  assert.deepEqual(outside({ [`${P}/02-requirements/F1-old/T1.test.mjs`]: kase('p/T1', 'p/F1', 'p/Z9') }), [], 'a never-seen kind outside is judged a change kind');
  assert.deepEqual(outside({ [`${P}/02-requirements/F1-old/T1.test.mjs`]: kase('p/T1', 'p/G1') }).map((f) => f.rule), ['change-case-outside-change-folder']);
  assert.deepEqual(outside({ [`${P}/02-requirements/F1-old/T1.test.mjs`]: kase('p/T1', 'p/C1') }).map((f) => f.rule), ['change-case-outside-change-folder']);
  assert.deepEqual(outside({ [`${P}/02-requirements/F1-old/G7-late.md`]: 'x' }).map((f) => f.rule), ['change-document-outside-change-folder']);
  assert.deepEqual(outside({ [`${P}/06-defects/D5-late.md`]: 'x' }), [], 'a defect document outside is judged');
  const kinds = /change kinds[^.]*/i.exec(readFileSync(join(PACKAGE, 'capability/Change-Record.md'), 'utf8'))?.[0] ?? '';
  assert.deepEqual([...kinds.matchAll(/\b([A-Z])\b/g)].map((m) => m[1]).filter((k) => k !== 'A').sort(), [...c.CHANGE_KINDS].sort(), 'the Definition and the control disagree about the change kinds');
}
test(id, () => run());
