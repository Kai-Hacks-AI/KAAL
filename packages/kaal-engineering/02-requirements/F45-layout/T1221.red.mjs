// Case engineering/T1221 tests: engineering/F45
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(root, 'packages/kaal-engineering/skills/kaal-engineering');
const ref = () => { const f = join(dir, 'references/package-layout.md'); assert.ok(existsSync(f), 'the reference packages/kaal-engineering/skills/kaal-engineering/references/package-layout.md is absent'); return readFileSync(f, 'utf8'); };
export const id = 'engineering/T1221';
export const tests = ['engineering/F45'];
export const title = 'the reference names the root files and the nine folders in order';
export async function run() {
  const t = ref();
  for (const f of ['AGENTS.md', 'README.md', 'LICENSE', 'package.json', '*.kaal.json']) assert.ok(t.includes(f), `the root file ${f} is not named`);
  const order = ['00-backlog', '01-changes', '02-controls', '10-intent', '11-requirements', '12-architecture', '13-source', '14-defects', 'dist'];
  let at = -1;
  for (const f of order) { const i = t.indexOf(f, at + 1); assert.ok(i > at, `the folder ${f} is missing or out of order`); at = i; }
}
