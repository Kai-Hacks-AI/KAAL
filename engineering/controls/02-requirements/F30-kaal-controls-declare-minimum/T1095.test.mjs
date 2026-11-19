// Case controls/T1095 tests: controls/F30
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const RECORDS = join(repo, 'engineering/controls/06-records');
const files = () => { const out = []; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name === '.git') continue; const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(md|mjs)$/.test(e.name)) out.push({ path: p, text: readFileSync(p, 'utf8') }); } }; walk(join(repo, 'engineering')); return out; };
const controls = async () => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls(files()).controls.filter((c) => c.valid); };

export const id = 'controls/T1095';
export const tests = ['controls/F30'];
export const title = 'a declared minimum names a fixture, a real and a real-failure kind, and a preventive or corrective control asks for at least two real runs';
export async function run() {
  const cs = (await controls()).filter((c) => c.evidence?.length);
  assert.ok(cs.length > 0, 'no control declares a minimum');
  for (const c of cs) {
    const k = Object.fromEntries(c.evidence.map((e) => [e.kind, e]));
    assert.ok(k.fixture, `${c.id} declares no fixture kind`);
    assert.ok(k.real, `${c.id} declares no real kind`);
    assert.ok(c.evidence.some((e) => e.fail), `${c.id} declares no real failure`);
    if (c.type === 'preventive' || c.type === 'corrective') assert.ok(k.real.runs >= 2, `${c.id} is ${c.type} and asks for fewer than two real runs`);
  }
}
