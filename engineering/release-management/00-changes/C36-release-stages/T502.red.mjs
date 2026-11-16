// Case release/T502 tests: F54
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T502';
export const tests = ['release/F54'];
export const title = "KAAL's activities in release/C35's names exist as a platform-free example set that the declaration judge finds sound";

export async function run() {
  const base = join(repo, 'engineering/release-management/05-src/stage-declaration');
  assert.ok(existsSync(join(base, 'declaration-judge.mjs')), 'the declaration judge is absent');
  const dir = join(base, 'instance');
  assert.ok(existsSync(dir), "KAAL's example Stages are absent");
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ({ name: f, text: readFileSync(join(dir, f), 'utf8') }));
  const { judgeDeclaration } = await import(pathToFileURL(join(base, 'declaration-judge.mjs')).href);
  const r = judgeDeclaration(files);
  assert.equal(r.structure, 'SOUND', r.findings.join('; '));
  assert.deepEqual(r.stages, ['Developing', 'Integrating', 'Promoting', 'Publishing']);
  const integrating = files.find((f) => /^name: Integrating$/m.test(f.text));
  assert.ok(integrating, 'Integrating is absent');
  assert.match(integrating.text, /^parts: \[Collecting, Hotfixing, Wiring\]$/m, 'Collecting, Hotfixing and Wiring are not the parts of Integrating');
  for (const f of files) assert.doesNotMatch(f.text, /\bmain\b|\*\*|Promotion Source|verify Stages/, `${f.name} holds platform data`);
}
