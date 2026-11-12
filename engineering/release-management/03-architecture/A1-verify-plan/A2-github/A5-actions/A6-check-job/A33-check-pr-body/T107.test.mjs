// Case release/T107 tests: A33
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const runner = join(repo, 'engineering/release-management/05-src/plan-body/verify.mjs');
export const id = 'release/T107';
export const tests = ['release/A33'];
export const title = 'A33 runs by hand on a body file: exit 0 for a clean body, exit 1 with a finding for a contaminated one';
export function run() {
  const dir = mkdtempSync(join(tmpdir(), 'body-'));
  const clean = '## Change\n\nrelease/C8 check PR Body: find contamination.\n\n## From\n\nOnly text is required.\n\n## To\n\nContamination is named.\n\n## Because\n\nNobody corrects bodies by hand.\n';
  const write = (name, text) => { const file = join(dir, name); writeFileSync(file, text); return file; };
  const ok = spawnSync(process.execPath, [runner, write('clean.md', clean)], { encoding: 'utf8' });
  assert.equal(ok.status, 0, `a clean body is rejected: ${ok.stderr}${ok.stdout}`);
  const bad = spawnSync(process.execPath, [runner, write('bad.md', clean + '\n---\nGenerated with Claude Code\n')], { encoding: 'utf8' });
  assert.equal(bad.status, 1, 'a contaminated body is not rejected');
  assert.match(bad.stdout + bad.stderr, /Because/, 'the finding does not say where');
}
