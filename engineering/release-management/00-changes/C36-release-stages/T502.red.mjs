// Case release/T502 tests: F54
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T502';
export const tests = ['release/F54'];
export const title = "KAAL's own four Stages exist as an example set that the stage judge accepts";

export async function run() {
  const base = join(repo, 'engineering/release-management/05-src/stages');
  assert.ok(existsSync(join(base, 'stage-judge.mjs')), 'the stage judge is absent');
  const dir = join(base, 'instance');
  assert.ok(existsSync(dir), "KAAL's example Stages are absent");
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ({ name: f, text: readFileSync(join(dir, f), 'utf8') }));
  const { judgeStages } = await import(pathToFileURL(join(base, 'stage-judge.mjs')).href);
  const r = judgeStages(files);
  assert.equal(r.valid, true, r.findings.join('; '));
  assert.deepEqual(r.stages, ['Development', 'Integration', 'Promotion', 'Publishing']);
}
