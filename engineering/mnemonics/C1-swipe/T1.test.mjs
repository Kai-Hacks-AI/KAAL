// Case mnemonics/T1 tests: mnemonics/F1, mnemonics/F2
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
export const id = 'mnemonics/T1';
export const tests = ['mnemonics/F1', 'mnemonics/F2'];
export const title = 'SWIPE is a KAAL Definition that spells Show Work In Progress Expectations, names Show WIP without renaming it, and owns nothing';
export async function run() {
  const file = join(repoRoot, 'engineering/SWIPE.md');
  assert.ok(existsSync(file), 'engineering/SWIPE.md does not exist');
  const text = readFileSync(file, 'utf8');
  const disco = readFileSync(join(repoRoot, 'engineering/DISCO.md'), 'utf8');
  const typeId = /id: ([0-9a-f]{64})/.exec(disco)[1];
  assert.ok(text.startsWith(`---\nname: SWIPE\ntype:\n  name: KAAL Definition\n  id: ${typeId}\n---\n`), 'the front matter is not that of a KAAL Definition named SWIPE');
  assert.match(text, /^# SWIPE$/m, 'no SWIPE heading');
  assert.match(text, /^Show Work In Progress Expectations\.$/m, 'the mnemonic sentence is missing');
  assert.match(text, /`Show WIP`, which keeps its name/, 'it does not say that Show WIP keeps its name');
  assert.match(text, /owns no instruction, no capability and no control/, 'it does not say that it owns nothing');
}
