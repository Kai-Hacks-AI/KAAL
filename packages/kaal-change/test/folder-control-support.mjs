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
// Passive: one check that runs the Change check on the folder; the runner is a command argument, so kaal-change takes no package dependency on Testing.
export const REGISTRATION = JSON.stringify({ checks: [{ id: 'cases', run: `node packages/p/skills/kaal-change/scripts/change-check.mjs ${FOLDER} --runner "node packages/testing/run.mjs"` }] });
/** Before the Change: one element with its own target Case. */
export const from = () => ({
  [`${P}/kaal-guard.json`]: JSON.stringify({ checks: [{ id: 'enduring-cases', run: 'node --test "packages/p/0[1-6]-*/**/T*.test.mjs"' }] }),
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
/** The ACT: act.md is added; the registration stays and no Case and no evidence is removed. ACT does no unwiring. */
export const acted = (files = done()) => ({ ...files, [`${FOLDER}/act.md`]: '# act\n' });
/** Execution evidence as `assess` reads it: one evaluation per Plan, here a registered check as Guard names it. */
export const CAPABILITY_PLAN = `${P}/kaal-guard.json:enduring-cases`;
export const CHANGE_PLAN = `${FOLDER}/kaal-guard.json:cases`;
export const evaluation = (plan, cases) => ({ run: 'r1', plan, result: Object.values(cases).every((r) => r === 'passed') ? 'passed' : 'failed', cases, findings: [] });
export const evidence = (...evaluations) => ({ by: 'ci', evaluations });
/** The run that judged the correct ACT: every Case passed in both checks. */
export const green = () => evidence(evaluation(CAPABILITY_PLAN, { 'p/T1': 'passed', 'p/T12': 'passed' }), evaluation(CHANGE_PLAN, { 'p/T10': 'passed', 'p/T11': 'passed' }));
export { kase };
