// Case release/T1046 tests: release/G104
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const folder = (dir, p) => readdirSync(join(RM, dir)).find((n) => n.startsWith(p + '-'));
const read = (dir, p) => { const f = folder(dir, p); assert.ok(f && existsSync(join(RM, dir, f, p + '.md')), p + ' is absent from ' + dir); return readFileSync(join(RM, dir, f, p + '.md'), 'utf8'); };
const flat = (s) => s.replace(/\s+/g, ' ');
export const id = 'release/T1046';
export const tests = ['release/G104'];
export const title = 'the gap is closed: the integrating approval rule has thread resolution on where the recorded baseline (From) had it off, and every other setting equals the baseline';
export async function run() {
  const base = readFileSync(join(RM, '00-changes/C81-thread-resolution/baseline.md'), 'utf8').split(/^## From \(recorded\)$/m)[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
  const from = JSON.parse(base);
  assert.equal(from.required_review_thread_resolution, false, 'the recorded baseline is not the From');
  const pr = JSON.parse(readFileSync(join(RM, '05-src/wiring/rulesets/integrating.json'), 'utf8')).rules.find((r) => r.type === 'pull_request');
  assert.deepEqual(pr.parameters, { ...from, required_review_thread_resolution: true }, 'the thread setting is not on, or another setting differs from the baseline');
}
