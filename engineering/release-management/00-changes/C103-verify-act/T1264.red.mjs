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
export const title = 'judgeAct says PASS only when every planned Case is really green, FAIL with the message and the Cases named when one is absent, still red, changed or observed RED, and UNKNOWN when one is not observed or the PLAN added none';
export async function run() {
  assert.ok(existsSync(SRC), 'judge-act.mjs is absent');
  assert.equal(readFileSync(SRC, 'utf8'), `${draft('judge-act.mjs')}\n`, 'judge-act.mjs differs from the draft');
  const { judgeAct } = await load();
  const planned = [{ id: 'T1', fingerprint: 'a' }, { id: 'T2', fingerprint: 'b' }];
  const headOk = { T1: { path: 'x/T1.test.mjs', green: true, fingerprint: 'a' }, T2: { path: 'y/T2.test.mjs', green: true, fingerprint: 'b' } };
  const green = { T1: 'GREEN', T2: 'GREEN' };
  assert.equal(judgeAct({ planned, head: headOk, observed: green }).verdict, 'PASS');
  const fail = (head, observed, id) => {
    const r = judgeAct({ planned, head, observed });
    assert.equal(r.verdict, 'FAIL', `${id} is not refused`);
    assert.match(r.message, /finish your work first/);
    assert.ok(r.message.includes(id), `${id} is not named`);
    return r;
  };
  // The same Case turned green by the DO is the one thing that passes; each way of not being that is refused by name.
  fail({ ...headOk, T2: undefined }, green, 'T2');
  fail({ ...headOk, T2: { ...headOk.T2, green: false } }, green, 'T2');
  fail({ ...headOk, T2: { ...headOk.T2, fingerprint: 'edited' } }, green, 'T2');
  fail(headOk, { T1: 'GREEN', T2: 'RED' }, 'T2');
  assert.match(fail({ ...headOk, T1: undefined, T2: { ...headOk.T2, green: false } }, green, 'T1').message, /T2/, 'a second failing Case is not named');
  // UNKNOWN never passes, and FAIL outranks it.
  assert.equal(judgeAct({ planned, head: headOk, observed: { T1: 'GREEN' } }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ planned, head: headOk, observed: { T1: 'GREEN', T2: 'UNKNOWN' } }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ planned, head: headOk, observed: undefined }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ planned: [], head: headOk, observed: green }).verdict, 'UNKNOWN', 'a PLAN without Cases must not pass');
  assert.equal(judgeAct({ planned: undefined, head: headOk, observed: green }).verdict, 'UNKNOWN');
  assert.equal(judgeAct({ planned, head: { ...headOk, T2: undefined }, observed: { T1: 'GREEN' } }).verdict, 'FAIL', 'FAIL must outrank UNKNOWN');
  // A Case the PLAN did not add does not matter.
  assert.equal(judgeAct({ planned, head: { ...headOk, T9: { path: 'z/T9.test.mjs', green: false, fingerprint: 'q' } }, observed: green }).verdict, 'PASS');
}
