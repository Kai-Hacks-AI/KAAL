// Case release/T1254 tests: release/F79
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const draft = (name) => readFileSync(join(RM, '00-changes/C102-inspector-app/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const WF = join(RM, '05-src/wiring/workflows/inspector.yml');
const KEY = 'INSPECTOR_PRIVATE_KEY';
// A job is the text from its two-space key under jobs to the next two-space key.
const jobs = (text) => {
  const body = text.split(/^jobs:\n/m)[1] ?? '';
  const out = {};
  const parts = body.split(/^  ([A-Za-z0-9_-]+):\n/m);
  for (let i = 1; i < parts.length; i += 2) out[parts[i]] = parts[i + 1];
  return out;
};
// The judgement of the workflow: what breaks the separation. Empty means the judge holds no secret and the signer runs nothing of the change.
const problems = (text) => {
  const out = [];
  const j = jobs(text);
  if (!j.judge || !j.sign) return ['the workflow has no judge job or no sign job'];
  if (/pull_request_target/.test(text)) out.push('it uses pull_request_target');
  if (!/^permissions: \{\}$/m.test(text)) out.push('the top level does not start from no permissions');
  if (/secrets\./.test(j.judge) || j.judge.includes(KEY)) out.push('the judge job names a secret');
  if (!j.judge.includes('persist-credentials: false')) out.push('the judge job keeps credentials');
  if (!/permissions:\n\s+contents: read\n/.test(j.judge) || /: write/.test(j.judge)) out.push('the judge job holds more than contents read');
  if (!/needs: judge/.test(j.sign)) out.push('the sign job does not need the judge job');
  if (!j.sign.includes(`secrets.${KEY}`)) out.push('the sign job does not hold the key');
  if ((text.match(new RegExp(KEY, 'g')) ?? []).length !== (j.sign.match(new RegExp(KEY, 'g')) ?? []).length) out.push('the key is named outside the sign job');
  if (/refs\/pull|merge_group\.head_ref|pull_request\.head/.test(j.sign)) out.push('the sign job reads the change');
  if (!/ref: \$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.event\.merge_group\.base_sha \}\}/.test(j.sign)) out.push('the sign job does not check out the base');
  if (!/ref: \$\{\{ github\.event\.pull_request\.base\.sha \|\| github\.event\.merge_group\.base_sha \}\}/.test(j.judge)) out.push('the judge job does not check out the base');
  return out;
};
export const id = 'release/T1254';
export const tests = ['release/F79'];
export const title = 'release/F79: the Inspector workflow equals its draft, its judge job holds no secret and its sign job alone holds the key and checks out only the base; a judge with a secret, a signer that reads the change or pull_request_target is refused';
export async function run() {
  assert.ok(existsSync(WF), 'inspector.yml is absent');
  const text = readFileSync(WF, 'utf8');
  assert.equal(text, `${draft('inspector.yml')}\n`, 'inspector.yml differs from the draft');
  assert.deepEqual(problems(text), [], 'the real workflow breaks the separation');
  // Hand-made negatives.
  const bad = (f) => problems(f(text));
  assert.ok(bad((t) => t.replace('name: Fetch the proposed head as Git data', `env:\n          LEAK: \${{ secrets.${KEY} }}\n        name: Fetch the proposed head as Git data`)).length > 0, 'a secret in the judge job is not refused');
  assert.ok(bad((t) => t.replace('          persist-credentials: false\n      - name: Fetch', '      - name: Fetch')).length > 0, 'a judge job that keeps credentials is not refused');
  assert.ok(bad((t) => t.replace('  pull_request:\n', '  pull_request_target:\n')).length > 0, 'pull_request_target is not refused');
  assert.ok(bad((t) => t.replace('permissions: {}', 'permissions: write-all')).length > 0, 'write-all permissions are not refused');
  assert.ok(bad((t) => t.replace(/(  sign:[\s\S]*?ref: )\$\{\{[^}]*\}\}/, '$1refs/pull/1/head')).length > 0, 'a signer that checks out the change is not refused');
  assert.ok(bad((t) => t.replace('needs: judge', '')).length > 0, 'a signer that does not need the judge is not refused');
  assert.ok(bad((t) => t.replace('      - name: Keep the verdicts as data', `      - run: echo \${{ secrets.${KEY} }}\n      - name: Keep the verdicts as data`)).length > 0, 'the key named in the judge job is not refused');
}
