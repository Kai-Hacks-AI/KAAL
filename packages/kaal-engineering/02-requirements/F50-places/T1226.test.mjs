// Case engineering/T1226 tests: engineering/F50
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
export const id = 'engineering/T1226';
export const tests = ['engineering/F50'];
export const title = 'each place has a machinery rule and a content rule, machinery is written in packages only, content is local';
export async function run() {
  const t = template();
  for (const p of t.places) {
    assert.ok(t.deployment[p], `no deployment rule for ${p}`);
    assert.ok(t.deployment[p].machinery && t.deployment[p].content, `${p} lacks a machinery or a content rule`);
  }
  const written = t.places.filter((p) => /written/.test(t.deployment[p].machinery));
  assert.deepEqual(written, ['packages/<capability>'], 'machinery is written in the package only');
  for (const k of ['contentIsLocal', 'contentIsNeverDeployed', 'contentIsNeverCompared', 'deployedMachineryMatchesSource']) assert.equal(t.rules[k], true, `${k} does not hold`);
}
