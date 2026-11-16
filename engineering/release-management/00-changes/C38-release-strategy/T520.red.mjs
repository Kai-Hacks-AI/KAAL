// Case release/T520 tests: C38 (the release strategy document)
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T520';
export const tests = ['release/C38'];
export const title = 'strategy.md at the root equals its draft, has the four chapters and a chain block, stays small and names no GitHub setting';

export function run() {
  const iface = join(repo, 'engineering/release-management/00-changes/C38-release-strategy/interface.md');
  const after = readFileSync(iface, 'utf8').split(/^## Draft of strategy\.md$/m)[1];
  assert.ok(after, 'the draft section is absent');
  const m = after.match(/^````\n([\s\S]*?)\n````$/m);
  assert.ok(m, 'the fenced draft is absent');
  const src = join(repo, 'engineering/release-management/strategy.md');
  assert.ok(existsSync(src), 'strategy.md is absent from the root of release-management');
  const text = readFileSync(src, 'utf8');
  assert.equal(text, `${m[1]}\n`, 'strategy.md differs from the draft');
  for (const h of ['## Chain', '## Challenge model', '## IN, STOCK and OUT', '## Priority and flow']) assert.ok(text.includes(`\n${h}\n`), `the chapter "${h}" is absent`);
  assert.match(text, /^```chain\n[\s\S]*?\n```$/m, 'the chain block is absent');
  assert.ok(text.split('\n').length <= 80, 'strategy.md is longer than 80 lines');
  assert.ok(!/ruleset|required check|bypass|branch protection/i.test(text.replace(/rulesets by target/i, '')), 'strategy.md names a GitHub setting');
}
