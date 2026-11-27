// Case controls/T1726 tests: controls/F225
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const load = async (rel) => { const f = join(S, rel); assert.ok(existsSync(f), `scripts/${rel} is absent`); return import(pathToFileURL(f).href); };
export const id = 'controls/T1726';
export const tests = ['controls/F225'];
export const title = 'renderFlagStatus builds the Markdown from the rows and findings only, and the report code reads nothing and names no adopter or platform';
export async function run() {
  const { renderFlagStatus } = await load('flag-status.mjs');
  const rows = [{ control: 'x/CTL1', type: 'preventive', flag: { name: 'F1', value: 'on' }, state: 'on', effective: 'preventive', applied: true, running: true, last: { run: 'r9', sha: 'tree:a' } },
    { control: 'x/CTL6', type: 'preventive', flag: null, state: 'UNKNOWN', effective: 'preventive', applied: null, running: null, last: null }];
  const md = renderFlagStatus({ title: 'Flag status', rows, findings: ['no-flag:x/CTL6'] });
  for (const h of ['Control', 'Type', 'Flag', 'Value', 'State', 'Effective', 'Applied', 'Running', 'Last run']) assert.ok(md.includes(h), `the table lacks ${h}`);
  for (const t of ['Flag status', 'x/CTL1', 'F1', 'r9', 'x/CTL6', 'UNKNOWN', 'no-flag:x/CTL6']) assert.ok(md.includes(t), `the text lacks ${t}`);
  assert.equal(renderFlagStatus({ title: 'T', rows: [], findings: [] }).includes('no-flag'), false);
  const text = readFileSync(join(S, 'flag-status.mjs'), 'utf8');
  for (const bad of ['node:fs', 'node:child_process', 'process.env', 'github', 'GitHub', 'engineering/', 'KAAL_', 'fetch(']) assert.ok(!text.includes(bad), `flag-status.mjs contains ${bad}`);
}
