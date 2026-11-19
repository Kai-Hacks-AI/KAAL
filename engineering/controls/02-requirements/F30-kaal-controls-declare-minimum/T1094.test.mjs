// Case controls/T1094 tests: controls/F30
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const RECORDS = join(repo, 'engineering/controls/06-records');
const files = () => { const out = []; const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name === '.git') continue; const p = join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(md|mjs)$/.test(e.name)) out.push({ path: p, text: readFileSync(p, 'utf8') }); } }; walk(join(repo, 'engineering')); return out; };
const controls = async () => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls(files()).controls.filter((c) => c.valid); };

export const id = 'controls/T1094';
export const tests = ['controls/F30'];
export const title = 'every control registered in engineering declares its own minimum evidence';
export async function run() {
  const cs = await controls();
  assert.ok(cs.length > 0, 'no control was found');
  const bare = cs.filter((c) => !c.evidence?.length).map((c) => c.id);
  assert.deepEqual(bare, [], `controls without a declared minimum: ${bare.join(', ')}`);
}
