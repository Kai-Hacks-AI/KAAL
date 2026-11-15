// Case release/T291 tests: G65
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T291';
export const tests = ['release/G65'];
export const title = 'gap release/G65 is closed: the target set of five rulesets is recorded Guard is required in all five, and Development is not one';
export function run() {
  const path = join(repo, 'engineering/release-management/05-src/wiring/rulesets/set.md');
  assert.ok(existsSync(path), 'the ruleset set record is absent');
  const text = readFileSync(path, 'utf8');
  for (const name of ['hotfixing', 'wiring', 'integration', 'promotion', 'publishing']) {
    assert.match(text, new RegExp(`\\|\\s*\`${name}\`\\s*\\|`), `the set names ${name}`);
  }
  assert.match(text, /Guard[^\n]*required[^\n]*all five/i, 'Guard is required in all five');
  assert.match(text, /Development[^\n]*hooks[^\n]*not a ruleset/i, 'Development is the hooks and not a ruleset');
}
