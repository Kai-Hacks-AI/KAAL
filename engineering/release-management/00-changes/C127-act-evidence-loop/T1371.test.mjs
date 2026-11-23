// Case release/T1371 tests: release/C127
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { RM, JUDGE, rec, recs, review } from './evidence-fixtures.mjs';
export const id = 'release/T1371';
export const tests = ['release/C127'];
export const title = 'the evidence library reads no file, no process and no history, and the summary script reads the ledger as a file and prints the summary of one judge';
export async function run() {
  const phase = join(RM, '05-src/phase');
  const lib = readFileSync(join(phase, 'lib/evidence.mjs'), 'utf8');
  assert.doesNotMatch(lib.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n'), /node:|child_process|process\.|readFileSync|rev-list|git /, 'the library is pure over data');
  assert.ok(existsSync(join(phase, 'summarize-act-evidence.mjs')));
  const dir = mkdtempSync(join(tmpdir(), 'c127-'));
  try {
    const file = join(dir, 'evidence.jsonl');
    writeFileSync(file, [...recs(1, 10), review('NOT READY')].map((e) => JSON.stringify(e)).join('\n') + '\n');
    const r = spawnSync('node', [join(phase, 'summarize-act-evidence.mjs'), file, JUDGE], { encoding: 'utf8' });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /limit: 10 counted runs of 10 recorded \(0 not an ACT, 0 unobserved\): trigger reached \(10 needed\)/);
    assert.match(r.stdout, /limit: review NOT READY/);
    assert.equal(spawnSync('node', [join(phase, 'summarize-act-evidence.mjs')], { encoding: 'utf8' }).status, 2);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
