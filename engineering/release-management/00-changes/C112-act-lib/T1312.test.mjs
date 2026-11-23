// Case release/T1312 tests: release/F87
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const LIB = join(RM, '05-src/phase/lib');
const use = (name) => { const f = join(LIB, name); assert.ok(existsSync(f), `lib/${name} is absent`); return import(pathToFileURL(f).href); };
export const id = 'release/T1312';
export const tests = ['release/F87'];
export const title = 'the library says whether Cases are really green: Given the Cases that apply and their observations, When asked, Then PASS only when none is parked and all are observed GREEN, FAIL while one is parked or RED, UNKNOWN when one is unobserved or none applies';
export async function run() {
  const { casesAreGreen, applicableCasesAreGreen } = await use('cases-green.mjs');
  const applicable = [{ id: 'x/T1', parked: false }, { id: 'x/T2', parked: false }];
  const green = { 'x/T1': 'GREEN', 'x/T2': 'GREEN' };
  // Given all observed GREEN, Then PASS with the counts.
  const pass = casesAreGreen({ applicable, observed: green });
  assert.equal(pass.verdict, 'PASS');
  assert.deepEqual(pass.progress, { red: 0, green: 2, unknown: 0 });
  // Given one parked or RED, Then FAIL naming it.
  for (const [app, obs] of [[[applicable[0], { ...applicable[1], parked: true }], green], [applicable, { 'x/T1': 'GREEN', 'x/T2': 'RED' }]]) {
    const r = casesAreGreen({ applicable: app, observed: obs });
    assert.equal(r.verdict, 'FAIL');
    assert.match(r.message, /finish your work first: x\/T2 of 2 applicable Cases are not really green/);
    assert.deepEqual(r.progress, { red: 1, green: 1, unknown: 0 });
  }
  // Given one unobserved, none applying or nothing observed, Then UNKNOWN, which never passes; and FAIL outranks it.
  assert.equal(casesAreGreen({ applicable, observed: { 'x/T1': 'GREEN' } }).verdict, 'UNKNOWN');
  assert.equal(casesAreGreen({ applicable, observed: undefined }).verdict, 'UNKNOWN');
  assert.equal(casesAreGreen({ applicable: [], observed: green }).verdict, 'UNKNOWN');
  assert.equal(casesAreGreen({ applicable, observed: { 'x/T1': 'RED' } }).verdict, 'FAIL');
  // Given the Cases of several Changes, Then they are judged together, and a Case parked in one Change is parked for all.
  const changes = [{ id: 'x/C1', applicable: [applicable[0]] }, { id: 'x/C2', applicable: [applicable[0], applicable[1]] }];
  assert.equal(applicableCasesAreGreen({ changes, observed: green }).verdict, 'PASS');
  assert.deepEqual(applicableCasesAreGreen({ changes, observed: green }).progress, { red: 0, green: 2, unknown: 0 });
  const parked = [{ id: 'x/C1', applicable: [{ id: 'x/T1', parked: true }] }, changes[1]];
  assert.equal(applicableCasesAreGreen({ changes: parked, observed: green }).verdict, 'FAIL');
}
