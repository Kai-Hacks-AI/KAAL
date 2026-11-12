// Case release/T162 tests: A33
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const runner = join(repo, 'engineering/release-management/05-src/plan-body/envelope.mjs');
export const id = 'release/T162';
export const tests = ['release/A33'];
export const title = 'A33 runs by hand on a facts file that carries the registry: exit 0 for a clean envelope, exit 1 naming the title for a wrong one';
export function run() {
  const dir = mkdtempSync(join(tmpdir(), 'envelope-'));
  const body = '## Change\n\nrelease/C99 sample: a sample Change.\n\n## From\n\nNothing.\n\n## To\n\nSomething.\n\n## Because\n\nIt helps.\n';
  const registry = { PLAN: ['Change', 'From', 'To', 'Because'] };
  const facts = { registry, title: 'PLAN: Create a sample', body, base: 'kaal/release/sample', head: 'claude/x', commits: [{ subject: 'x', message: 'x\n\nDriven-by: release/C99\n' }] };
  const write = (name, value) => { const file = join(dir, name); writeFileSync(file, JSON.stringify(value)); return file; };
  const ok = spawnSync(process.execPath, [runner, write('ok.json', facts)], { encoding: 'utf8' });
  assert.equal(ok.status, 0, `a clean envelope is rejected: ${ok.stderr}${ok.stdout}`);
  const bad = spawnSync(process.execPath, [runner, write('bad.json', { ...facts, title: 'Create a sample' })], { encoding: 'utf8' });
  assert.equal(bad.status, 1, 'a wrong title is not rejected');
  assert.match(bad.stdout + bad.stderr, /title/i, 'the finding does not say where');
}
