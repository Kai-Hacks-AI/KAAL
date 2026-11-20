// Case engineering/T1240 tests: engineering/F55
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(import.meta.url).split('/packages/')[0];
export const run = () => {
  // The pointer's contract is the paths it names (code spans and link targets), not its prose.
  const text = readFileSync(join(root, 'AGENTS.md'), 'utf8');
  const named = [...text.matchAll(/`([^`]+)`|\]\(([^)]+)\)/g)].map((m) => resolve(root, m[1] ?? m[2]));
  const engine = join(root, 'engineering/core');
  assert.ok(named.includes(engine), 'the root AGENTS.md does not name engineering/core');
  assert.ok(named.includes(join(engine, 'AGENTS.md')), 'the root AGENTS.md does not name engineering/core/AGENTS.md as the entry point');
  assert.ok(existsSync(join(engine, 'AGENTS.md')), 'the entry point it names is absent');
  assert.ok(!named.includes(join(root, '.kaal')) && !named.includes(join(root, '.kaal/AGENTS.md')), 'the root AGENTS.md still names .kaal as the Engine');
};
if (process.argv[1] === fileURLToPath(import.meta.url)) run();
