// Case release/T1540 tests: release/C138
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FILE = join(repo, 'packages/kaal-release/13-source/pull-request-types/kaal-release.json');
export const id = 'release/T1540';
export const tests = ['release/C138'];
export const title = 'release declares exactly SYNC, PROMOTION and WIRE in the form of Hosting, WIRE keeps Source, Target and Verification in order, and the declaration holds no GitHub word, no comment syntax and no recognition';
export async function run() {
  assert.ok(existsSync(FILE), 'the declaration of release is absent');
  const { types } = JSON.parse(readFileSync(FILE, 'utf8'));
  const by = Object.fromEntries(types.map((t) => [t.type, t]));
  assert.deepEqual(Object.keys(by).sort(), ['PROMOTION', 'SYNC', 'WIRE'], 'release declares only the types it owns');
  assert.deepEqual(by.WIRE.chapters.map((c) => c.name), ['Source', 'Target', 'Verification'], 'the WIRE keeps its three chapters in order');
  for (const t of types) {
    assert.ok(t.chapters.length > 0 && t.chapters.every((c) => c.name && typeof c.guidance === 'string'), `${t.type} chapters are {name, guidance}`);
    assert.ok(!t.chapters.some((c) => /HOW TO WORK/i.test(c.name)), `${t.type} declares the removed HOW TO WORK`);
    const text = JSON.stringify(t);
    assert.ok(!/<!--|KAAL-PR-template|\.github|pull_request/i.test(text), `${t.type} holds a GitHub word or comment syntax`);
    assert.ok(!('recognised' in t) && !('recognition' in t), `${t.type} repeats recognition`);
  }
}
