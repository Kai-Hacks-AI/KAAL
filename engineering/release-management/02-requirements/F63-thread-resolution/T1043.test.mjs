// Case release/T1043 tests: release/F63
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const folder = (dir, p) => readdirSync(join(RM, dir)).find((n) => n.startsWith(p + '-'));
const read = (dir, p) => { const f = folder(dir, p); assert.ok(f && existsSync(join(RM, dir, f, p + '.md')), p + ' is absent from ' + dir); return readFileSync(join(RM, dir, f, p + '.md'), 'utf8'); };
const flat = (s) => s.replace(/\s+/g, ' ');
export const id = 'release/T1043';
export const tests = ['release/F63'];
export const title = 'the integrating source requires every review thread to be resolved, for kaal/**, hotfix/** and wire/**, with no bypass actor';
export async function run() {
  read('02-requirements', 'F63');
  const real = JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/integrating.json'), 'utf8'));
  const pr = real.rules.find((r) => r.type === 'pull_request');
  assert.ok(pr, 'there is no pull_request rule');
  assert.equal(pr.parameters.required_review_thread_resolution, true, 'an unresolved thread does not block');
  assert.deepEqual(real.conditions.ref_name.include, ['refs/heads/kaal/**', 'refs/heads/hotfix/**', 'refs/heads/wire/**']);
  assert.deepEqual(real.bypass_actors, [], 'a bypass actor is listed');
}
