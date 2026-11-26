// Case controls/T1553 tests: controls/F212
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (name) => { const f = join(scripts, name); assert.ok(existsSync(f), `scripts/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1553';
export const tests = ['controls/F212', 'controls/F206'];
export const title = 'a recognizable integration is structure and no claim of execution, anything else is unknown, and the verify Adapter reads it without a finding';
export async function run() {
  const { recognizeIntegration } = await load('recognize-adapter.mjs');
  const { findUnadapted } = await load('verify-adapter.mjs');
  const adapter = 'lib/adapter.mjs';
  const rec = (text, over = {}) => recognizeIntegration({ control: 'c/CTL1', entry: { path: 'run/go.mjs', text }, adapter, revision: 's', ...over });
  const yes = "import { runControl } from '../lib/adapter.mjs';\nawait runControl({ id: 'c/CTL1' });\n";
  assert.deepEqual(rec(yes), { control: 'c/CTL1', revision: 's', integration: 'recognized' }, 'an import and a call of the adapter were not recognized');
  assert.equal('adapted' in rec(yes), false, 'structure claimed execution');
  assert.equal(rec("import { runControl as go } from '../lib/adapter.mjs';\nawait go({});").integration, 'recognized', 'an alias of the binding was not followed');
  const unknown = {
    'a comment': "import { runControl } from '../lib/adapter.mjs';\n// await runControl({});\n/* runControl({}) */\nrun();",
    'a string': "import { runControl } from '../lib/adapter.mjs';\nconst s = 'await runControl({})';\nrun(s);",
    'a template literal': "import { runControl } from '../lib/adapter.mjs';\nconst s = `runControl(${x})`;\nrun(s);",
    'an unused import': "import { runControl } from '../lib/adapter.mjs';\nrun();",
    'a branch that cannot run': "import { runControl } from '../lib/adapter.mjs';\nif (false) { await runControl({}); }\n",
    'a call without the import': 'await runControl({});',
    'an unrelated adapter module': "import { runControl } from '../other/adapter.mjs';\nawait runControl({});",
    'another module of the same name resolved elsewhere': "import { runControl } from './adapter.mjs';\nawait runControl({});",
    'an entry with no sign of it': 'const r = check(input);\nconsole.log(r);\n',
    'empty text': '',
    'text that is not text': 42,
  };
  for (const [what, text] of Object.entries(unknown)) assert.throws(() => rec(text), `${what} gave an answer instead of unknown`);
  assert.throws(() => recognizeIntegration({ control: 'c/CTL1', revision: 's', adapter }), 'no entry gave an answer');
  for (const bad of [{ control: '' }, { revision: '' }, { adapter: '' }, { control: 7 }]) assert.throws(() => rec(yes, bad), 'bad input did not throw');
  // the consumer: a recognition is read as observed, without a finding, and a declaration cannot change it
  const controls = [{ id: 'c/CTL1', status: 'designed', stations: ['S:detective'], path: 'p', mode: 'off', evidence: 'UNKNOWN', adapted: true }];
  assert.deepEqual(findUnadapted({ controls, delivered: [], observed: [rec(yes)], revision: 's' }), [], 'a recognized integration was named or not read as observed');
  assert.deepEqual(findUnadapted({ controls, delivered: [], observed: [{ control: 'c/CTL1', revision: 's', adapted: false }], revision: 's' }), ['unadapted:c/CTL1'], 'a confirmed nonconformance was lost');
  assert.throws(() => findUnadapted({ controls, delivered: [], observed: [], revision: 's' }), 'a control with no recognition and no other evidence was not unknown');
  assert.throws(() => findUnadapted({ controls, delivered: [], observed: [{ control: 'c/CTL1', revision: 'other', integration: 'recognized' }], revision: 's' }), 'a recognition of another revision was read');
  assert.throws(() => findUnadapted({ controls, delivered: [], observed: [{ control: 'c/CTL1', revision: 's', integration: 'yes' }], revision: 's' }), 'a recognition with another value was read');
}
