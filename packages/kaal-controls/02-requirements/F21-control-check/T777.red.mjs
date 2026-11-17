// Case controls/T777 tests: controls/F21, controls/F22
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FINDER = join(dir, 'skills/kaal-controls/scripts/find-controls.mjs');
const STATUSES = ['designed', 'implemented', 'running', 'tested'];
async function finder() { assert.ok(existsSync(FINDER), 'the finder is absent'); const m = await import(pathToFileURL(FINDER).href); assert.equal(typeof m.findControls, 'function', 'the finder exports no findControls'); return m.findControls; }
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'verify Stages (Developing)', description: 'Stages are verified before they merge.', type: 'detective', status: 'designed', has: '[demo/I1]', ...o }; return '---\n' + Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const file = (path, text) => ({ path, text });
const CHECK = join(dir, 'skills/kaal-controls/scripts/check-controls.mjs');
export const id = 'controls/T777';
export const tests = ['controls/F21', 'controls/F22'];
export const title = 'the command checks whichever controls exist in any directory, fails visibly and never writes a status';
export async function run() {
  assert.ok(existsSync(CHECK), 'the product check is absent');
  const stray = [];
  const walk = (d) => { for (const n of readdirSync(d, { withFileTypes: true })) { if (n.name === 'node_modules') continue; const q = join(d, n.name); if (n.isDirectory()) walk(q); else if (/^check-controls/.test(n.name) && !q.startsWith(join(dir, 'skills/kaal-controls/scripts/'))) stray.push(q); } };
  walk(join(repo, 'packages')); walk(join(repo, 'engineering'));
  assert.deepEqual(stray, [], 'a check script lives outside the folder of the Skill');
  const run = (d) => { try { return { code: 0, out: execFileSync(process.execPath, [CHECK, d], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }; } catch (e) { return { code: e.status, err: String(e.stderr) }; } };
  const tmp = mkdtempSync(join(tmpdir(), 'c12-check-'));
  assert.equal(run(tmp).code, 0, 'a directory with no control failed');
  mkdirSync(join(tmp, 'a'));
  writeFileSync(join(tmp, 'a', 'CTL1.md'), item({ id: 'a/CTL1' }));
  assert.equal(run(tmp).code, 0, 'a valid control failed');
  const bad = join(tmp, 'a', 'CTL2.md');
  const text = item({ id: 'a/CTL2', status: undefined });
  writeFileSync(bad, text);
  const r = run(tmp);
  assert.equal(r.code, 1, 'a control without a status passed');
  assert.ok(r.err.includes('CTL2.md') && r.err.includes('a/CTL2') && /status/.test(r.err), 'the failure does not name the control and the status');
  for (const s of STATUSES) assert.ok(r.err.includes(s), `the failure does not name ${s}`);
  assert.equal(readFileSync(bad, 'utf8'), text, 'the check wrote to the declaration');
  writeFileSync(bad, item({ id: 'a/CTL2', status: 'implemented' }));
  assert.equal(run(tmp).code, 0, 'a recovered control still failed');
}
