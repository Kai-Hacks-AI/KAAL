// Shared by the Cases of change/C12. In-memory repository views: nothing here touches Git, the network or a file outside the package.
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// The control the Cases judge: the Skill's script. KAAL_CHANGE_CONTROL points the Cases at another file (the draft in the Change folder proves each Case can pass).
export const CONTROL = process.env.KAAL_CHANGE_CONTROL ? resolve(process.env.KAAL_CHANGE_CONTROL) : join(PACKAGE, 'skills/kaal-change/scripts/folder-control.mjs');
export async function load() {
  if (!existsSync(CONTROL)) throw new Error(`the folder control is absent: ${relative(resolve(PACKAGE, '../..'), CONTROL)}`);
  return import(pathToFileURL(CONTROL).href);
}
/** A repository view from { path: text }: the only thing the control reads. */
export const view = (files) => ({ files: Object.keys(files).sort(), read: (p) => files[p] });
const kase = (id, ...tests) => `export const id = '${id}';\nexport const tests = [${tests.map((t) => `'${t}'`).join(', ')}];\nexport const run = () => {};\n`;
export const P = 'packages/p';
export const FOLDER = `${P}/00-changes/C1-move`;
export const REGISTRATION = JSON.stringify({ checks: [{ id: 'cases', run: `node --test "${FOLDER}/T*.test.mjs"` }] });
/** Before the Change: one element with its own target Case. */
export const from = () => ({
  [`${P}/02-requirements/F1-old/F1.md`]: '# p/F1\n',
  [`${P}/02-requirements/F1-old/T1.test.mjs`]: kase('p/T1', 'p/F1'),
});
/** The Change after its DO: change-oriented Cases inside, the new element F2 with its own target Case outside, still registered. */
export const done = () => ({
  ...from(),
  [`${FOLDER}/C1.md`]: '# p/C1\n', [`${FOLDER}/kaal-guard.json`]: REGISTRATION,
  [`${FOLDER}/T10.test.mjs`]: kase('p/T10', 'p/G1'), [`${FOLDER}/T11.test.mjs`]: kase('p/T11', 'p/C1'),
  [`${P}/02-requirements/F2-new/F2.md`]: '# p/F2\n', [`${P}/02-requirements/F2-new/T12.test.mjs`]: kase('p/T12', 'p/F2'),
});
/** The ACT: act.md is added and the registration deleted; no Case and no evidence is removed. */
export const acted = (files = done()) => { const { [`${FOLDER}/kaal-guard.json`]: _gone, ...rest } = files; return { ...rest, [`${FOLDER}/act.md`]: '# act\n' }; };
export { kase };
