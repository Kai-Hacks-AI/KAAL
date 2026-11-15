// Case release/T440 tests: F23
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T440';
export const tests = ['release/F23'];
export const title = 'HOW TO WORK guidance: one file per type, each with distinct Work and Review steps';

const TYPES = ['plan', 'do', 'act', 'sync', 'promotion', 'hotfix', 'wire', 'default'];
export function steps(text, heading) {
  const m = text.match(new RegExp(`^## ${heading}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'));
  return m ? m[1].split('\n').filter((l) => /^\d+\. /.test(l)).map((l) => l.replace(/^\d+\. /, '')) : null;
}
export function run() {
  const dir = join(repo, 'engineering/release-management/03-architecture/A49-how-to-work');
  assert.ok(existsSync(dir), 'the guidance folder is absent');
  assert.deepEqual(readdirSync(dir).sort(), TYPES.map((t) => `${t}.md`).sort());
  const seen = new Map();
  for (const t of TYPES) {
    const text = readFileSync(join(dir, `${t}.md`), 'utf8');
    for (const h of ['Work', 'Review']) {
      const s = steps(text, h);
      assert.ok(s && s.length >= 1 && s.length <= 4, `${t} ${h} must hold one to four steps`);
      for (const line of s) {
        assert.ok(!seen.has(line), `${t} ${h} repeats a step of ${seen.get(line)}`);
        seen.set(line, `${t} ${h}`);
      }
    }
  }
}
