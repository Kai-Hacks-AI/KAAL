// Case testing/T373 tests: testing/F148. The judged use: a recorded trial of a new consumer, read against the key.
import assert from 'node:assert/strict';
import { existsSync, install, join, PACKAGE, readdirSync, readFileSync, sh, writeFileSync } from './lib.mjs';
import { cpSync } from 'node:fs';
export const id = 'testing/T373';
export const tests = ['testing/F148'];
export const title = 'three recorded runs of a stranger agent with only the installed package, each with its isolation and a judgment that quotes the transcript, meet every must item of the key';
const TRIAL = join(PACKAGE, 'plan/standalone/trial');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
export async function run() {
  assert.ok(existsSync(join(TRIAL, 'key.json')), 'the key is absent');
  assert.ok(existsSync(join(TRIAL, 'prompt.txt')) && existsSync(join(TRIAL, 'protocol.md')), 'the prompt or the protocol is absent');
  const key = json(join(TRIAL, 'key.json'));
  assert.equal(key.schema, 'kaal-testing/trial-key@1');
  assert.ok(key.items.length >= 6 && key.items.every((i) => /^K\d+$/.test(i.id) && ['must', 'should'].includes(i.level) && i.says), 'the key has items without an id, a level or a statement');
  assert.deepEqual(new Set(key.items.map((i) => i.id)).size, key.items.length, 'the key repeats an item id');

  // The deterministic anchor: the fixture yields the counts the key states, with the installed package.
  const { project } = install();
  for (const f of readdirSync(join(TRIAL, 'fixture'))) cpSync(join(TRIAL, 'fixture', f), join(project, f));
  assert.ok(existsSync(join(project, 'node_modules/.bin/kaal-testing')), 'the installed package has no command to run the fixture with');
  const r = sh(join(project, 'node_modules/.bin/kaal-testing'), ['run', 'a.test.mjs', 'skipped.test.mjs', 'pending.test.mjs'], { cwd: project });
  assert.equal(r.status, 0, `the installed command did not report on the fixture: ${r.stderr}`);
  assert.deepEqual(JSON.parse(r.stdout).counts, key.expected, 'the fixture does not yield the counts the key states');

  // The recorded runs.
  const runsDir = join(TRIAL, 'runs');
  assert.ok(existsSync(runsDir), 'no run is recorded yet (runs/ is absent)');
  const runs = readdirSync(runsDir).filter((n) => /^run-\d+$/.test(n)).sort();
  assert.ok(runs.length >= 3, `${runs.length} runs are recorded, three are required`);
  for (const n of runs) {
    const dir = join(runsDir, n);
    for (const f of ['transcript.md', 'isolation.json', 'judgment.json']) assert.ok(existsSync(join(dir, f)), `${n}: ${f} is absent`);
    const iso = json(join(dir, 'isolation.json'));
    assert.ok(Number(String(iso.node).split('.')[0]) >= 24, `${n}: Node 24 or later is not recorded`);
    assert.equal(iso.startedEmpty, true, `${n}: the project was not empty before the install`);
    assert.equal(iso.repositoryReachable, false, `${n}: a repository was reachable from the agent's folder`);
    assert.deepEqual((iso.family ?? []).filter((p) => !['kaal-testing', '@kaihacksai/kaal-hosting', '@kaihacksai/kaal-foundation'].includes(p)), [], `${n}: another KAAL package was installed`);
    assert.ok(iso.agent?.session && iso.judge?.session && iso.agent.session !== iso.judge.session, `${n}: the judge is not a different session from the agent`);
    const transcript = readFileSync(join(dir, 'transcript.md'), 'utf8');
    const judgment = json(join(dir, 'judgment.json'));
    for (const item of key.items) {
      const v = judgment.items?.find((j) => j.id === item.id);
      assert.ok(v && ['met', 'not met', 'unresolved'].includes(v.verdict), `${n}: ${item.id} has no verdict`);
      assert.ok(typeof v.quote === 'string' && v.quote.length > 0 && transcript.includes(v.quote), `${n}: the quote for ${item.id} is not in the transcript`);
      if (item.level === 'must') assert.equal(v.verdict, 'met', `${n}: must item ${item.id} is ${v.verdict}`);
    }
  }
}
