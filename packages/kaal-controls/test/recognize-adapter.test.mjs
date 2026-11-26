import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recognizeIntegration } from '../skills/kaal-controls/scripts/recognize-adapter.mjs';
import { findUnadapted } from '../skills/kaal-controls/scripts/verify-adapter.mjs';

const adapter = 'lib/adapter.mjs';
const rec = (text, over = {}) => recognizeIntegration({ control: 'c/CTL1', entry: { path: 'run/go.mjs', text }, adapter, revision: 's', ...over });
const head = "import { runControl } from '../lib/adapter.mjs';\n";

test('a call after the import is recognized, aliased or not, and says nothing of execution', () => {
  assert.deepEqual(rec(`${head}await runControl({});`), { control: 'c/CTL1', revision: 's', integration: 'recognized' });
  assert.equal(rec("import { runControl as go } from '../lib/adapter.mjs';\nawait go({});").integration, 'recognized');
  assert.equal(rec("import { other, runControl as $go } from '../lib/adapter.mjs';\nawait $go({});").integration, 'recognized');
});
test('a literal or a comment that looks like the integration is not read', () => {
  for (const body of ['const s = "await runControl({})";', 'const s = `runControl(${x})`;', '// await runControl({});', '/* runControl({}) */', "const s = 'import { runControl } from \"../lib/adapter.mjs\"'; runControl({});"]) {
    const text = body.startsWith("const s = 'import") ? body : `${head}${body}`;
    assert.throws(() => rec(text), /does not show/, body);
  }
});
test('an import that is not the adapter, or is not called, or is called where it cannot run, is not recognized', () => {
  assert.throws(() => rec(`${head}run();`));
  assert.throws(() => rec("import { runControl } from '../other/adapter.mjs';\nawait runControl({});"));
  assert.throws(() => rec("import { runControl } from './adapter.mjs';\nawait runControl({});"));
  assert.throws(() => rec("import { runControl } from 'adapter.mjs';\nawait runControl({});"));
  assert.throws(() => rec('await runControl({});'));
  assert.throws(() => rec(`${head}if (false) { await runControl({}); }`));
  assert.throws(() => rec(`${head}if (0) runControl({});`));
  assert.throws(() => rec(`${head}obj.runControl({});`));
  assert.throws(() => rec(`${head}other(runControl);`));
});
test('a branch that can run is not removed, and what follows a dead branch is read', () => {
  assert.equal(rec(`${head}if (ok) { await runControl({}); }`).integration, 'recognized');
  assert.equal(rec(`${head}if (false) { x(); }\nawait runControl({});`).integration, 'recognized');
});
test('anything missing or malformed throws, never answers', () => {
  assert.throws(() => recognizeIntegration({ control: 'c', revision: 's', adapter }));
  for (const text of ['', 42, null]) assert.throws(() => rec(text));
  for (const over of [{ control: '' }, { revision: '' }, { adapter: '' }, { control: 7 }]) assert.throws(() => rec(`${head}runControl({});`, over));
  assert.throws(() => recognizeIntegration({ control: 'c', entry: { text: 'x' }, adapter, revision: 's' }));
});
test('the result is never a claim of execution or of nonconformance', () => {
  const r = rec(`${head}runControl({});`);
  assert.equal('adapted' in r, false);
});

const ctl = { id: 'c/CTL1', stations: ['S:detective'] };
const find = (observed) => findUnadapted({ controls: [ctl], delivered: [], observed, revision: 's' });
const run = (adapted) => ({ control: 'c/CTL1', revision: 's', adapted });
const seen = rec(`${head}runControl({});`);
test('verify Adapter reads a recognition as observed, with no finding, and keeps evidence apart', () => {
  assert.deepEqual(find([seen]), []);
  assert.deepEqual(find([seen, run(true)]), []);
  assert.deepEqual(find([seen, run(false)]), ['unadapted:c/CTL1']);
  assert.deepEqual(find([run(false), seen]), ['unadapted:c/CTL1']);
  assert.throws(() => find([seen, run(true), run(false)]));
  assert.throws(() => find([run(true), run(false)]));
  assert.throws(() => find([]));
});
test('verify Adapter refuses a recognition of another revision or of another value', () => {
  assert.throws(() => find([{ ...seen, revision: 'other' }]));
  assert.throws(() => find([{ control: 'c/CTL1', revision: 's', integration: 'yes' }]));
  assert.throws(() => find([{ control: 'c/CTL1', revision: 's', integration: 'recognized', adapted: 'x' }]));
});

test('a name that is declared again is not the imported binding', () => {
  const shadows = {
    'a function parameter': `${head}function go(runControl) { return runControl({}); }`,
    'an arrow parameter in parentheses': `${head}const go = (a, runControl) => runControl(a);`,
    'a single arrow parameter': `${head}const go = runControl => runControl({});`,
    'a method parameter': `${head}class A { go(runControl) { return runControl({}); } }`,
    'a const': `${head}const runControl = () => 1;\nrunControl({});`,
    'a let': `${head}let runControl = fake;\nrunControl({});`,
    'a var': `${head}var runControl = fake;\nrunControl({});`,
    'a further declarator': `${head}const a = 1, runControl = fake;\nrunControl({});`,
    'a destructured name': `${head}const { runControl } = fake;\nrunControl({});`,
    'a renamed destructured name': `${head}const { x: runControl } = fake;\nrunControl({});`,
    'an array pattern': `${head}const [runControl] = fakes;\nrunControl({});`,
    'a function declaration': `${head}function runControl() {}\nrunControl({});`,
    'a class declaration': `${head}class runControl {}\nnew runControl({}); runControl({});`,
    'a catch parameter': `${head}try { x(); } catch (runControl) { runControl({}); }`,
    'a for loop variable': `${head}for (const runControl of fakes) { runControl({}); }`,
    'a destructured function parameter': `${head}function f({runControl}) { runControl({}); }`,
    'a destructured parameter with a default': `${head}function f({ runControl = fake } = {}) { return runControl({}); }`,
    'an array pattern parameter': `${head}function f([runControl]) { return runControl({}); }`,
    'a destructured arrow parameter': `${head}const g = ({ runControl }) => runControl({});`,
    'a method definition': `${head}class A { runControl(x) { return x; } }\nnew A().m = () => runControl({});`,
    'an object method': `${head}const o = { runControl(x) { return x; } };\nrunControl({});`,
    'a property name': `${head}const o = { runControl: fake };\nrunControl({});`,
    'a getter': `${head}class A { get runControl() { return 1; } }\nrunControl({});`,
    'another import of the name': `${head}import { runControl } from './fake.mjs';\nrunControl({});`,
    'an optional call': `${head}await runControl?.({});`,
  };
  for (const [what, text] of Object.entries(shadows)) assert.throws(() => rec(text), /does not show/, what);
  const aliased = "import { runControl as go } from '../lib/adapter.mjs';\nfunction f(runControl) { return runControl(1); }\nawait go({});";
  assert.equal(rec(aliased).integration, 'recognized', 'a declaration of another name than the imported one blocked the recognition');
});
test('a call that only uses the name in an expression is still recognized', () => {
  assert.equal(rec(`${head}const r = await runControl({ id: 1 });\nif (r.verdict) { done(r); }`).integration, 'recognized');
  assert.equal(rec(`${head}export const run = async (input) => runControl(input);`).integration, 'recognized');
  assert.equal(rec(`${head}const out = [1].map((x) => runControl(x));`).integration, 'recognized');
  assert.equal(rec(`${head}try { await runControl({}); } catch (e) { fail(e); }`).integration, 'recognized');
  assert.equal(rec(`${head}for (const c of controls) { await runControl(c); }`).integration, 'recognized');
});
