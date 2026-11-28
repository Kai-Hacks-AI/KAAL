// Case controls/T1727 tests: controls/F225
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1727';
export const tests = ['controls/F225'];
export const title = 'renderFlagStatus builds the Markdown from the rows and findings only, showing the declared decision, the observed signal and what blocked in their own columns, and the report code reads nothing and names no adopter or platform';
export async function run() {
  const { renderFlagStatus } = await load('flag-status.mjs');
  const rows = [{ control: 'x/CTL1', place: 'pr', type: 'preventive', flag: { name: 'F1', value: 'preventing' }, declared: 'PREVENTING', observed: 'OK', stamp: 'PREVENTING', blocking: true, blocked: true, running: true, last: { run: 'r9', sha: 'tree:a' }, configError: null },
    { control: 'x/CTL6', place: 'mg', type: 'preventive', flag: null, declared: null, observed: null, stamp: null, blocking: null, blocked: null, running: null, last: null, configError: 'no-flag' }];
  const md = renderFlagStatus({ title: 'Flag status', rows, findings: ['no-flag:x/CTL6@mg'] });
  for (const h of ['Control', 'Place', 'Type', 'Flag', 'Declared', 'Observed', 'STAMP', 'Blocking', 'Blocked', 'Running', 'Last run']) assert.ok(md.includes(h), `the table lacks ${h}`);
  for (const t of ['Flag status', 'x/CTL1', 'pr', 'F1', 'r9', 'x/CTL6', 'mg', 'PREVENTING', 'no-flag:x/CTL6@mg']) assert.ok(md.includes(t), `the text lacks ${t}`);
  assert.equal(renderFlagStatus({ title: 'T', rows: [], findings: [] }).includes('no-flag'), false);
  const text = readFileSync(join(S, 'flag-status.mjs'), 'utf8');
  for (const bad of ['node:fs', 'node:child_process', 'process.env', 'github', 'GitHub', 'engineering/', 'KAAL_', 'fetch(']) assert.ok(!text.includes(bad), `flag-status.mjs contains ${bad}`);
}
