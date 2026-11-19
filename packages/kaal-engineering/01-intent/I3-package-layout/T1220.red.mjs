// Case engineering/T1220 tests: engineering/I3
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
const pkg = join(root, 'packages/kaal-engineering');
const dir = join(pkg, 'skills/kaal-engineering');
const template = () => { const f = join(dir, 'references/package-layout.json'); assert.ok(existsSync(f), 'the template references/package-layout.json is absent'); return JSON.parse(readFileSync(f, 'utf8')); };
const folder = (t, n) => t.folders.find((f) => f.name === n);
export const id = 'engineering/T1220';
export const tests = ['engineering/I3'];
export const title = 'for every entry of the template a reader can tell machinery from content and what verifies it';
export async function run() {
  const t = template();
  const entries = [...t.root, ...t.folders];
  for (const e of entries) assert.ok(['machinery', 'content'].includes(e.kind), `${e.name} is neither machinery nor content`);
  for (const f of t.folders.filter((x) => x.element)) assert.ok(f.verifiedBy, `${f.name} does not say what verifies it`);
  assert.ok(folder(t, '13-source').verifiedBy, '13-source does not say what verifies it');
}
