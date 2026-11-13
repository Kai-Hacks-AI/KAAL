// Case mnemonics/T2 tests: mnemonics/F3, mnemonics/F4
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
export const id = 'mnemonics/T2';
export const tests = ['mnemonics/F3', 'mnemonics/F4'];
export const title = 'VIVA AQUA is a KAAL Definition that spells its sentence, names the Testing and Review boundary without renaming either, says neither approves, and owns nothing';
export async function run() {
  const file = join(repoRoot, 'engineering/VIVA-AQUA.md');
  assert.ok(existsSync(file), 'engineering/VIVA-AQUA.md does not exist');
  const text = readFileSync(file, 'utf8');
  const disco = readFileSync(join(repoRoot, 'engineering/DISCO.md'), 'utf8');
  const typeId = /id: ([0-9a-f]{64})/.exec(disco)[1];
  assert.ok(text.startsWith(`---\nname: VIVA AQUA\ntype:\n  name: KAAL Definition\n  id: ${typeId}\n---\n`), 'the front matter is not that of a KAAL Definition named VIVA AQUA');
  assert.match(text, /^# VIVA AQUA$/m, 'no VIVA AQUA heading');
  assert.match(text, /^Verification Improves Validation After Agents Qualify Unproven Assumptions\.$/m, 'the mnemonic sentence is missing');
  assert.match(text, /`kaal-testing` and `kaal-review`, which keep their names/, 'it does not say that kaal-testing and kaal-review keep their names');
  assert.match(text, /Neither approves: the Owner decides\./, 'it does not say that neither approves');
  assert.match(text, /owns no instruction, no capability and no control/, 'it does not say that it owns nothing');
}
