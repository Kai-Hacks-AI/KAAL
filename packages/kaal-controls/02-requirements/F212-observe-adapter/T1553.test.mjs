// Case controls/T1553 tests: controls/F212
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1553';
export const tests = ['controls/F212'];
export const title = 'the delivered entry shows whether a control runs through the adapter, and anything it does not show is unknown';
export async function run() {
  const { observeAdapted } = await load('observe-adapter.mjs');
  const { findUnadapted } = await load('verify-adapter.mjs');
  const obs = (text, over = {}) => observeAdapted({ control: 'c/CTL1', entry: { path: 'run.mjs', text }, revision: 's', ...over });
  const yes = "import { runControl } from './adapter.mjs';\nawait runControl({ id: 'c/CTL1' });\n";
  assert.deepEqual(obs(yes), { control: 'c/CTL1', revision: 's', adapted: true }, 'an entry that imports and calls the adapter was not seen as adapted');
  assert.equal(obs("import { runControl as go } from '../scripts/adapter.mjs';\nawait runControl({});").adapted, true, 'another path to the adapter module was not accepted');
  assert.deepEqual(obs("const r = check(input);\nconsole.log(r);\n"), { control: 'c/CTL1', revision: 's', adapted: false }, 'an entry with its own mode and log was not seen as not adapted');
  assert.equal(obs("// import { runControl } from './adapter.mjs';\n/* runControl({}) */\nrun();").adapted, false, 'a comment was read as the adapter');
  const unknown = {
    'import without a call': "import { runControl } from './adapter.mjs';\nrun();",
    'call without the import': 'await runControl({});',
    'import of another module': "import { runControl } from './other.mjs';\nawait runControl({});",
    'empty text': '',
    'text that is not text': 42,
  };
  for (const [what, text] of Object.entries(unknown)) assert.throws(() => obs(text), `${what} gave an answer instead of unknown`);
  assert.throws(() => observeAdapted({ control: 'c/CTL1', revision: 's' }), 'no entry gave an answer');
  for (const bad of [{ control: '' }, { revision: '' }, { control: 7 }]) assert.throws(() => obs(yes, bad), 'bad input did not throw');
  // the observation is of the form the verify Adapter reads, and a declaration cannot make it true
  const controls = [{ id: 'c/CTL1', status: 'designed', stations: ['S:detective'], path: 'p', mode: 'off', evidence: 'UNKNOWN', adapted: true }];
  assert.deepEqual(findUnadapted({ controls, delivered: [], observed: [obs('run();')], revision: 's' }), ['unadapted:c/CTL1'], 'a declaration of being adapted overruled the entry');
  assert.deepEqual(findUnadapted({ controls, delivered: [], observed: [obs(yes)], revision: 's' }), [], 'an adapted entry was named');
}
