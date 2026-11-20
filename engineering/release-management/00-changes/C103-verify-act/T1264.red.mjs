// Case release/T1264 tests: release/F80
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, renameSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const SRC = join(RM, '05-src/phase/judge-act.mjs');
const load = () => import(pathToFileURL(SRC).href);
const draft = (name) => readFileSync(join(RM, '00-changes/C103-verify-act/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const id = 'release/T1264';
export const tests = ['release/F80'];
export const title = 'judgeAct says PASS only when every applicable Case is not parked and observed GREEN, FAIL with the message, the counts and the Cases named when one is parked red or observed RED, and UNKNOWN when one is not observed or none applies';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-act.mjs')}\n`, 'judge-act.mjs differs from the draft');
  const { judgeAct } = await load();
  const applicable = [{ id: 'x/T1', parked: false }, { id: 'x/T2', parked: false }];
  const green = { 'x/T1': 'GREEN', 'x/T2': 'GREEN' };
  const pass = judgeAct({ applicable, observed: green });
  assert.equal(pass.verdict, 'PASS');
  assert.deepEqual(pass.progress, { red: 0, green: 2, unknown: 0 });
  const fail = (app, observed, id, progress) => {
    const r = judgeAct({ applicable: app, observed });
    assert.equal(r.verdict, 'FAIL', `${id} is not refused`);
    assert.match(r.message, /finish your work first/);
    assert.ok(r.message.includes(id), `${id} is not named`);
    assert.deepEqual(r.progress, progress);
    return r;
  };
  fail([applicable[0], { ...applicable[1], parked: true }], green, 'x/T2', { red: 1, green: 1, unknown: 0 });
  fail(applicable, { 'x/T1': 'GREEN', 'x/T2': 'RED' }, 'x/T2', { red: 1, green: 1, unknown: 0 });
  assert.match(fail(applicable.map((c) => ({ ...c, parked: true })), green, 'x/T1', { red: 2, green: 0, unknown: 0 }).message, /x\/T2/, 'a second failing Case is not named');
  // UNKNOWN never passes, and FAIL outranks it.
  assert.equal(judgeAct({ applicable, observed: { 'x/T1': 'GREEN' } }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ applicable, observed: { 'x/T1': 'GREEN', 'x/T2': 'UNKNOWN' } }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ applicable, observed: undefined }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ applicable: [], observed: green }).verdict, 'UNKNOWN', 'a Change with no applicable Case must not pass');
  assert.equal(judgeAct({ applicable: undefined, observed: green }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ applicable: [{ ...applicable[0], parked: true }, applicable[1]], observed: { 'x/T1': 'GREEN' } }).verdict, 'FAIL', 'FAIL must outrank UNKNOWN');
}
