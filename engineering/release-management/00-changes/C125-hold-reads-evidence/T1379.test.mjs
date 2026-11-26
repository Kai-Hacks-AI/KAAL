// Case release/T1379 tests: release/C125
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RM, use, evidenceOf } from './evidence-fixtures.mjs';
export const id = 'release/T1379';
export const tests = ['release/C125'];
export const title = 'the evidence is read as a file and never as Testing code: the library reader answers undefined, null or the parsed file, and no judge or library module imports Testing';
export async function run() {
  const { readEvidenceFile } = await use('lib/tree-facts.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'c125-'));
  try {
    assert.equal(readEvidenceFile(undefined), undefined);
    assert.equal(readEvidenceFile(join(dir, 'absent.json')), null);
    writeFileSync(join(dir, 'bad.json'), '{ not json'); assert.equal(readEvidenceFile(join(dir, 'bad.json')), null);
    writeFileSync(join(dir, 'ok.json'), JSON.stringify(evidenceOf())); assert.deepEqual(readEvidenceFile(join(dir, 'ok.json')), evidenceOf());
  } finally { rmSync(dir, { recursive: true, force: true }); }
  for (const f of ['judge-act.mjs', 'run-controls-act.mjs', 'lib/cases-green.mjs', 'lib/tree-facts.mjs', 'lib/collector.mjs']) {
    assert.doesNotMatch(readFileSync(join(RM, '05-src/phase', f), 'utf8'), /kaal-testing|packages\/kaal-testing|observeCases/, `${f} imports Testing`);
  }
  assert.match(readFileSync(join(RM, '05-src/phase/run-controls-act.mjs'), 'utf8'), /--evidence/);
}
